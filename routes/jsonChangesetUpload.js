'use strict';

var _ = require('lodash');
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});
var Promise = require('bluebird');
var BoundingBox = require('../services/BoundingBox');
var Node = require('../models/Node');
var Way = require('../models/Way');

function upload(req, res) {
  var changesetID = req.params.changesetID;
  if (!changesetID || isNaN(changesetID)) {
    res(Boom.badRequest('Changeset ID must be a non-zero number'));
  }
  knex('changesets').where('id', changesetID).then(function(changesets) {
    if (changesets.length === 0) {
      return res(Boom.badRequest('Could not find changeset'));
    }
    var meta = changesets[0];

    // Keep track of the number of changes this upload operation is doing.
    var numChanges = parseInt(meta.num_changes, 10) || 0;

    // Use changeset in request body.
    var changeset = req.payload.osmChange;
    if (!changeset) {
      console.log('JSON parse error');
      return res(Boom.badRequest('Problem parsing changeset JSON'));
    }

    // Start a transaction block
    knex.transaction(function(transaction) {

      // Use this to map old ids to new ids.
      var map = {
        node: {},
        way: {}
      }

      // TODO increment numChanges.
      query('node', changeset, meta, map).then(function() {
        query('way', changeset, meta, map).then(function() {
          transaction.commit();
          /*
           * Not gonna worry about relations atm.
          query('relation', changeset, meta, map)
            .then(transaction.commit)
            .catch(transaction.rollback);
          */
        }).catch(transaction.rollback);
      }).catch(transaction.rollback);
    })
    .then(function(queries) {
      console.log('in complete', queries);

      // If all goes well, update the changeset
      var nodes = [];
      ['create', 'modify', 'delete'].forEach(function(action) {
        if (changeset[action].node) {
          nodes.concat(changeset[action].node);
        }
      });
      var bbox = BoundingBox.fromNodes(nodes).toScaled();
      var changesetUpdate = {
        min_lon: bbox.minLon,
        min_lat: bbox.minLat,
        max_lon: bbox.maxLon,
        max_lat: bbox.maxLat,
        closed_at: new Date(),
        num_changes: numChanges
      };
      knex('changesets')
      .where('id', meta.id)
      .update(changesetUpdate)
      .then(function() {
        return res({
          changeset: _.extend(meta, updatedChangeset),
        });
      })
      .catch(function(err) {
        console.log(err);
        return res(Boom.badImplementation('Could not update changeset'));
      });
    });
  })
  .catch(function(err) {
    console.log(err);
    return res(Boom.badRequest('Could not find changeset'));
  });
}

var models = {
  node: Node,
  way: Way
};

function valToArray(val) {
  if (_.isArray(val)) {
    return val;
  }
  return [val];
}

function query(entity, changeset, meta, map) {
  var model = models[entity];
  if (!model) {
    return;
  }
  var actions = [];
  ['create', 'modify', 'destroy'].forEach(function(action) {
    actions.concat(valToArray(model.queryGenerator[action](changeset, meta, map)));
  });
  return Promise.all(actions);
}


module.exports = {
  method: 'POST',
  path: '/changeset/json/{changesetID}/upload',
  handler: upload
};
