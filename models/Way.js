'use strict';

/**
* Way.js
*
* @description :: Represents ways, or roads.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_ways
*
*/

var _ = require('lodash');
var Boom = require('boom');
var Promise = require('bluebird');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});

var Node = require('./Node');
var WayNode = require('./WayNode');
var WayTag = require('./WayTag');

var Way = {
  tableName: 'current_ways',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      numerical: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      primaryKey: true,
      autoIncrement: true,
      index: true,
      model: 'changesets'
    },
    timestamp: {
      type: 'datetime',
      date: true
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    version: {
      type: 'integer',
      numeric: true,
      index: true
    },
  },


  // Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entity) {
    var model = {
      changeset_id: parseInt(entity.changeset, 10),
      timestamp: new Date(),
      version: parseInt(entity.version, 10) || 1,
      visible: (entity.visible !== 'false' && entity.visible !== false),
    };
    return model;
  },

  // TODO this function should also handle node#fromJXEntity.
  // Test and replace to avoid duplication.
  fromEntity: function(entity, meta) {
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timeStamp = new Date();
    if (entity.id && entity.id > 0) {
      model.id = entity.id;
    }
    if (entity.changeset) {
      model.changeset_id = parseInt(entity.changeset, 10);
    }
    else if (meta && meta.id) {
      model.changeset_id = parseInt(meta.id);
    }
    return model;
  },

  canBeDeleted: function(way_id) {
    // TODO add relations support
    return new Promise(function(fullfill, reject) {
      fullfill(true)
    })
  },

  attachNodeIDs: function(ways, wayNodes) {
    // For each way, attach every node it contains using the wayNodes server
    //response.
    for (var j = 0, jj = ways.length; j < jj; ++j) {
      var way = ways[j];
      var nodesInWay = [];
      for (var i = 0, ii = wayNodes.length; i < ii; ++i) {
        var wayNode = wayNodes[i];
        if (wayNode.way_id === way.id) {
          nodesInWay.push(wayNode);
        }
      }
      way.nodes = nodesInWay;
    }
    return ways;
  },

  queryGenerator: {
    create: function(changeset, meta, map) {
      var creates = changeset.create.way;
      if (!creates) {
        return [];
      }

      // Create a list of models of just way creations with proper attributes.
      var models = creates.map(function(entity) {
        return Way.fromEntity(entity, meta);
      });

      // Bundle all the way insertions, bundle all the way nodes,
      // then bundle all the tag insertions if any.
      var query = knex(Way.tableName).insert(models).returning('id').then(function(ids) {
        var tags = [];
        var wayNodes = [];
        for (var i = 0, ii = creates.length; i < ii; ++i) {

          // Using the original change object.
          // Contains #nd and #tag.
          var change = creates[i];

          // Map the old way ID to the new ID,
          // so we can support relations later.
          map.way[change.id] = ids[i];

          // Set the new ID onto the changeset object.
          change.id = ids[i];

          // Safe to assume ways will have way nodes.
          // Use the map#node mapping to get the new Node ids.
          wayNodes.concat(change.nd.map(function(wayNode, i) {
            return {
              way_id: change.id,
              sequence_id: i,
              node_id: map.node[wayNode.ref]
            };
          }));

          if (change.tag && change.tag.length) {
            tags.concat(change.tag.map(function(tag) {
              return {
                k: tag.k,
                v: tag.v,
                way_id: change.id
              };
            }));
          }
        }

        // The dependents array will always contain a way node insertion query.
        // If there are way tags, it will include those too.
        var dependents = [];
        dependents.push(knex(WayNode.tableName).insert(wayNodes).catch(function(err) {
          console.log('err: creating way nodes in create');
          console.log(err);
        }));
        if (tags.length) {
          tags = [].concat.apply([], tags);
          dependents.push(knex(WayTag.tableName).insert(tags).catch(function(err) {
            console.log('err: creating way tags in create');
            console.log(err);
          }));
        }
        return Promise.all(dependents);
      })
      .catch(function(err) {
        console.log('err: inserting new ways');
        console.log(err);
      });
      return query;
    },

    modify: function(changeset, meta, map) {
      var modifies = changeset.modify.way;
      if (!modifies) {
        return [];
      }

      // Create a list of modify queries, since we can't do them all in a single query.
      var wayChanges = modifies.map(function(entity) {
        var model = Way.fromEntity(entity, meta);
        var query = knex(Way.tableName).where({ id: entity.id }).update(model).catch(function(err) {
          console.log('err: modify single way');
          console.log(err);
        });
        return query;
      });

      // Get all of our new tags and wayNodes.
      // Save IDs so we can delete old tags and wayNodes.
      var ids = [];
      var tags = [];
      var wayNodes = [];
      for(var i = 0, ii = modifies.length; i < ii; ++i) {
        var modify = modifies[i];
        ids.push(parseInt(modify.id, 10));
        wayNodes.concat(modify.nd.map(function(wayNode, i) {
          return {
            way_id: modify.id,
            sequence_id: i,
            node_id: map.node[wayNode.ref]
          }
        }));
        if (modify.tag && modify.tag.length) {
          tags.concat(modify.tag.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              way_id: modify.id
            };
          }));
        }
      }

      var query = Promise.all(wayChanges).then(function() {

        // Dependents is an array where each item is a delete().then.insert().
        // It will contain way nodes for certain. It will also contain a delete for tags.
        // If there are new tags, then it will also insert those tags.
        var dependents = [];
        dependents.push(knex(WayNode.tableName).whereIn('way_id', ids).del().then(function() {
          return knex(WayNode.tableName).insert(wayNodes).catch(function(err) {
            console.log('err: creating way nodes in modify');
            console.log(err);
          });
        })
        .catch(function(err) {
          console.log('err: deleting way nodes in modify');
          console.log(err);
        }));

        // Again, we always delete old way tags, even if we don't have new ones to add.
        dependents.push(knex(WayTag.tableName).whereIn('way_id', ids).del().then(function() {
          if (tags.length) {
            return knex(WayTag.tableName).insert(tags).catch(function(err) {
              console.log('err: creating way tags in modify');
              console.log(err);
            });
          }
          else return
        })
        .catch(function(err) {
          console.log('err: deleting way tags in modify');
          console.log(err);
        }));
        return Promise.all(dependents);
      });

      return query;
    },

    destroy: function(changeset, meta, map) {
      var destroys = changeset.delete.way;
      if (!destroys) {
        return [];
      }
      var ids = _.pluck(destroys, 'id');
      var query = knex(Way.tableName).whereI('id', ids).update({ visible: false });
      return query;
    }
  }
};

module.exports = Way;

