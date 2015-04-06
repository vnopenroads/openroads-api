'use strict';
/**
 * Nodes.js
 *
 * @description :: Represents nodes.
 * Schema: http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
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

var RATIO = require('../services/Ratio');
var QuadTile = require('../services/QuadTile');
var NodeTag = require('./NodeTag');
var WayNode = require('./WayNode');
var Way = require('./Way');

var Node = {

  tableName: 'current_nodes',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      index: true
    },
    latitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    longitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      model: 'changesets'
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    timestamp: {
      type: 'datetime',
      datetime: true
    },
    tile: {
      type: 'integer',
      index: true,
      numeric: true,
      required: true
    },
    version: {
      type: 'integer',
      numeric: true,
      required: true
    },
  },

  //Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entity) {
    var lat = parseFloat(entity.lat);
    var lon = parseFloat(entity.lon);

    var model = {
      latitude: lat * RATIO | 0,
      longitude: lon * RATIO | 0,
      tile: QuadTile.xy2tile(QuadTile.lon2x(lon), QuadTile.lat2y(lat)),
      changeset_id: parseInt(entity.changeset, 10),
      visible: (entity.visible !== 'false' && entity.visible !== false),
      version: parseInt(entity.version, 10) || 1,
      timestamp: new Date()
    };
    return model;
  },

  // TODO this function should also handle node#fromJXEntity.
  // Test and replace to avoid duplication.
  fromEntity: function(entity, meta) {
    var ratio = RATIO;
    var model = {};
    model.visible = (entity.visible !== 'false' && entity.visible !== false);
    model.version = parseInt(entity.version, 10) || 1;
    model.timestamp = new Date();
    if (entity.lat && entity.lon) {
      entity.lat = parseFloat(entity.lat);
      entity.lon = parseFloat(entity.lon);
      model.latitude = entity.lat * ratio | 0;
      model.longitude = entity.lon * ratio | 0;
      model.tile = QuadTile.xy2tile(QuadTile.lon2x(entity.lon), QuadTile.lat2y(entity.lat));
    }
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

  canBeDeleted: function(nodeId) {
    // No need to call parseInt on node_id, as that's already handled upstream.
    return knex(WayNode.tableName)
    .where('node_id', nodeId)
    .then(function wayNodeResp(wayNodes) {
      // If this node belongs to a way, check to see if
      // any of those ways are visible, aka not deleted yet.
      // Return false if this node is still part of an existing way.
      if (wayNodes) {
        return knex(Way.tableName).whereIn('id',_.pluck(wayNodes, 'way_id'))
        .then(function(ways) {
          var visible = _.chain(ways)
          .pluck('visible')
          .reduce(function(curr, val) { return curr && val; }, true)
          .value();
          return visible;
        });
      } else {
        return true;
      }
    })
    .catch(function(err) {
      throw new Error(err);
    });
  },

  // Attach a list of tags to a list of entities
  // by creating a mapping of entities by their id.
  withTags: function(entities, tags, accessor) {
    if (!tags.length) {
      return entities;
    }
    var map = {};
    for(var i = 0, ii = entities.length; i < ii; ++i) {
      var entity = entities[i];
      map[entity.id] = entity;
    }
    for(i = 0, ii = tags.length; i < ii; ++i) {
      var tag = tags[i];
      var entity = map[tag[accessor]];
      if (entity) {
        if (entity.tags === undefined) {
          entity.tags = [];
        }
        entity.tags.push(tag);
      }
    }
    return entities;
  },

  // Generate create, modify, and destroy queries.
  // Using as few connections as possible.
  queryGenerator: {
    create: function(changeset, meta, map, transaction) {
      var creates = changeset.create.node;
      if (!creates) {
        return [];
      }

      // Map each node creation to a model with proper attributes.
      var models = creates.map(function(entity) {
        return Node.fromEntity(entity, meta);
      });

      // Insert all node models, then use returned ids to insert all tags.
      var query = transaction(Node.tableName).insert(models).returning('id').then(function(ids) {
        var tags = [];
        for (var i = 0, ii = creates.length; i < ii; ++i) {

          // We need to take the original object from the changeset query here.
          // It contains node tags.
          var change = creates[i];

          // Re-map the old node ID to the new node ID on the map object.
          map.node[change.id] = ids[i];

          // Overwrite old ID's with new Node ID's on the changeset.
          // This assumes that ID's returned from postgresql maintain the same order
          // that they are inserted in.
          change.id = ids[i];

          // Check for Node tags. If they exist, they will be in the form of an array.
          if (change.tag && change.tag.length) {
            tags.push(change.tag.map(function(tag) {
              return {
                k: tag.k,
                v: tag.v,
                node_id: change.id
              };
            }));
          }
        }

        // Only save tags if there are any.
        if (tags.length) {
          tags = [].concat.apply([], tags);
          return transaction(NodeTag.tableName).insert(tags).catch(function(err) {
            console.log('err: creating node tags in create');
            console.log(err);
          });
        }
        else return
      })
      .catch(function(err) {
        console.log('err: inserting new nodes');
        console.log(err);
      });
      return query;
    },

    modify: function(changeset, meta, map, transaction) {
      var modifies = changeset.modify.node;
      if (!modifies) {
        return [];
      }

      // Create a list of modify queries.
      // TODO so far as I know, there's no way to bulk-modify a bunch of records.
      // So set up a list of all of them that we can call Promise.all() on.
      var nodeChanges = modifies.map(function(entity) {

        // Create a new model object with the proper attributes.
        var model = Node.fromEntity(entity, meta);
        var query = transaction(Node.tableName).where({id: entity.id}).update(model).catch(function(err) {
          console.log('err: modify single node');
          console.log(err);
        });
        return query;
      });

      // We'll need all the Node IDs to delete it's way tags.
      // Since we're looping over the modify object, record all the
      // new node tags.
      var ids = [];
      var tags = [];
      for (var i = 0, ii = modifies.length; i < ii; ++i) {
        var change = modifies[i];
        ids.push(parseInt(change.id, 10));
        if (change.tag && change.tag.length) {
          tags.push(change.tag.map(function(tag) {
            return {
              k: tag.k,
              v: tag.v,
              node_id: change.id
            };
          }));
        }
      }

      // Call Promise.all() on the modifications.
      // After that's done, we can safely delete node tags and insert new ones.
      var query = Promise.all(nodeChanges).then(function() {
        return transaction(NodeTag.tableName).whereIn('node_id', ids).del().then(function() {
          if (tags.length) {
            tags = [].concat.apply([], tags);
            return transaction(NodeTag.tableName).insert(tags).catch(function(err) {
              console.log('err: creating node tags in modify');
              console.log(err);
            });
          }
          else return
        }).catch(function(err) {
          console.log('err: deleting node tags in modify.');
          console.log(err);
        });
      }).catch(function(err) {
        console.log('err: modifying all nodes.');
        console.log(err);
      });
      return query;
    },

    destroy: function(changeset, meta, map, transaction) {
      var destroys = changeset.delete.node;
      if (!destroys) {
        return [];
      }
      var ids = _.pluck(destroys, 'id');
      var query = transaction(Node.tableName).whereIn('id', ids).update({
        visible: false,
        changeset_id: meta.id
      }).returning('id').then(function(invisibleNodes) {
        return transaction(NodeTag.tableName).whereIn('node_id', invisibleNodes).del().returning('node_id').then(function(deleted) {
          // console.log('Nodes set invisible', invisibleNodes.join(', '));
          // console.log('Node tags deleted', deleted.join(', '));
        }).catch(function(err) {
          console.log('err: deleting node tags in delete');
          console.log(err);
        });
      })
      .catch(function(err) {
        console.log('err: deleting nodes in delete');
        console.log(err);
      });
      return query;
    }
  },
};

module.exports = Node;

