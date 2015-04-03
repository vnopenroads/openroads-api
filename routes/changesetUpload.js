'use strict';

var _ = require('lodash');
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});
var Promise = require('bluebird');

var XML = require('../services/XML');
var BoundingBox = require('../services/BoundingBox');

var newOldEntity = {
  node: function(n) {
    var node = _.clone(n.attributes);
    node.node_id = n.id;
    return node;
  },
  way: function(w) {
    var way = _.clone(w.attributes);
    way.way_id = w.id;
    return way;
  },
  node_tag: function(nt) {
    var nodeTag = _.clone(nt.attributes);
    nodeTag.node_id = nt.id;
  },
  way_tag: function(wt) {
    var wayTag = _.clone(wt.attributes);
    wayTag.way_id = wt.id;
    return wayTag;
  },
  way_node: function(wn) {
    var wayNode = _.clone(wn.attributes);
    wayNode.version = wn.version;
    return wayNode;
  }
};

function upload(req, res) {
  var changesetID = req.params.changesetID;
  if (!changesetID || isNaN(changesetID)) {
    res(Boom.badRequest('Changeset ID must be a non-zero number'));
  }

  // Look for changeset in database
  knex('changesets')
  .where('id', changesetID)
  .then(function(changesets) {
    if (changesets.length === 0) {
      return res(Boom.badRequest('Could not find changeset'));
    }
    // Keep track of the number of changes this upload operation is doing.
    var cs = changesets[0];
    var numChanges = parseInt(cs.num_changes, 10) || 0;
    var actions = [];
    try {
      actions = XML.readChanges(req.payload.xmlString);
    }
    catch(e) {
      return res(Boom.badRequest('Could not parse changeset'));
    }
    var transactionError = false;

    // --------------------
    // Create a mapping of nodes and ways to their associated way_node and tags.
    // First group by type.
    // --------------------
    var map = {
      node: {},
      way: {}
    };

    var associated = [];
    for (var i = 0, ii = actions.length; i < ii; ++i) {
      var action = actions[i];
      if (map[action.model]) {
        // Create an empty array to hold future associations
        action.associated = [];
        // Create an object that uses the node_id or way_id as pointers actions.
        map[action.model][action.id] = action;
      }
      else {
        // Tags and way_nodes go here.
        associated.push(action);
      }
    }
    _.each(map, function(entityMap, name) {
      var accessor = name + '_id';
      for (var k = 0, kk = associated.length; k < kk; ++k) {
        var id = associated[k].attributes[accessor];
        var entity = entityMap[id];
        if (entity) {
          entity.associated.push(associated[k]);
        }
      }
    });

    var currentModels = {
      node: require('../models/Node'),
      way: require('../models/Way'),
    };

    // We will delete all the way_nodes and entity_tags in a modify block
    // A modify for a way node or entity tag becomes a create
    // TODO: How to deal with history?
    _.each(actions, function(action) {
      if ((action.model === 'node_tag' ||
           action.model === 'way_tag' ||
             action.model === 'way_node') &&
               action.action === 'modify') {
        action.action = 'create';
      }
    });


    // -------------------------
    // Begin transacting
    // -------------------------

    knex.transaction(function(transaction) {
      return Promise.each(actions, function(action) {
        var model = action.model;
        var currentTable = 'current_' + model + 's';
        var oldTable = model + 's';
        var placeholderID = action.id;
        var attributes = action.attributes;

        numChanges += 1;


        // sails.log.verbose('\n\n\n', action);
        if (action.action === 'create' ) {

          // For ways and nodes, re-map associations.
          if ( model === 'node' || model === 'way' ) {

            return transaction(currentTable).insert(attributes).returning('id')
            .then(function(id) {
              // It's a way or node, and it has associations
              // Remap the placeholder ID to the new, auto-ID from database.
              if (map[model] && action.associated) {
                var accessor = model + '_id';
                var newID = parseInt(id[0], 10);
                _.each(action.associated, function(association) {
                  association.attributes[accessor] = newID;
                });
                action.id = newID;
              }
              return action;
            });

            // For way_nodes, way_tags, and node_tags, just do an insert.
            // As there are no associations to re-map.
          } else {
            return transaction(currentTable).insert(attributes);
          }

        } else if (action.action === 'modify') {

          // Save the original entity in the old entity tables.

          // Update version of the model
          // If there's a version, increment it.
          if (attributes.version && !isNaN(attributes.version)) {
            attributes.version += 1;
          }

          // If there are associations and versions, write the versions
          // on those associations. Later we will check for them.
          if (action.associated && attributes.version) {
            _.each(action.associated, function(association) {
              association.version = attributes.version;
            });
          }


          var oldEntity = newOldEntity[model](action);

          // Create the old entity, if it fails, throw an error
          var updateTable = function() { return transaction(oldTable)
            .insert(oldEntity)
            .then(function() {
              console.log('in update');
              return transaction(currentTable)
              .where(action.key, '=', action.id)
              .update(attributes)

              .catch(function(err) {
                console.log(err);
              });
            })
            .catch(function(err) {
              console.log(err);
              throw new Error(err);
            }); };

            if (model === 'node' || model === 'way') {
              return transaction('current_' + model + '_tags')
              .where(model + '_id', '=', action.id)
              .delete()
              .then(function() {
                if (model === 'way') {

                  //Delete way_nodes
                  return transaction('current_way_nodes')
                  .where('way_id', '=', action.id)
                  .delete()
                  .then(function() {
                    return transaction(currentTable)
                    .where(action.key, '=', action.id)
                    .update(attributes);
                  });
                } else {
                  return transaction(currentTable)
                  .where(action.key, '=', action.id)
                  .update(attributes);
                }
              });
            } else {
              return updateTable;
            }
        }

        else if (action.action === 'delete') {
          if (model === 'node' || model === 'way') {
            return currentModels[model].canBeDeleted(action.id)

            .then(function(yes) {
              if (yes) {
                attributes.visible = false;
                //We need to delete all associations
                // Put in history

                // Delete tags
                return transaction('current_' + model + '_tags')
                .where(model + '_id', '=', action.id)
                .delete()
                .then(function() {
                  if (model === 'way') {

                    //Delete way_nodes
                    return transaction('current_way_nodes')
                    .where('way_id', '=', action.id)
                    .delete()
                    .then(function() {
                      return transaction(currentTable)
                      .where(action.key, '=', action.id)
                      .update(attributes);
                    });
                  } else {
                    return transaction(currentTable)
                    .where(action.key, '=', action.id)
                    .update(attributes);
                  }
                });
              }

              else {
                console.log('Couldn\'t delete entity');
                throw new Error('Couldn\'t delete entity');
              }
            })

            .catch(function(err) {
              console.log('Error in visibility check function');
              throw new Error(err);
            });

          } else {
            console.log(model, 'not a node/way delete');
            return action;
          }
        }
      });
    })
    .then(function() {
      // If all goes well, update the changeset
      var bbox = BoundingBox.fromScaledActions(actions).toScaled();
      var updatedChangeset = {
        min_lon: bbox.minLon,
        min_lat: bbox.minLat,
        max_lon: bbox.maxLon,
        max_lat: bbox.maxLat,
        closed_at: new Date(),
        num_changes: numChanges
      };
      knex('changesets')
      .where('id', cs.id)
      .update(updatedChangeset)
      .then(function() {
        return res({
          changeset: _.extend(cs, updatedChangeset),
          actions: actions
        });
      })
      .catch(function(err) {
        if (err) {
          console.log(err);
          return res(Boom.badImplementation('Could not update changeset'));
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      return knex('changesets').delete('id', cs.id).then(function() {
        return res(Boom.badImplementation('Could not complete transaction'));
      });

    });
  })
  .catch(function(err) {
    console.log(err);
    return res(Boom.badRequest('Could not find changeset'));
  });

}

module.exports = {
  method: 'POST',
  path: '/changeset/{changesetID}/upload',
  handler: upload
};
