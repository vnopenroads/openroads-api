'use strict';

var _ = require('lodash');
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});
var Promise = require('bluebird');

var BoundingBox = require('../services/bounding-box.js');
var log = require('../services/log.js');
var Node = require('../models/node-model.js');
var Way = require('../models/way.js');
var Relation = require('../models/relation.js');

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
      log.error('No json or cannot parse req.payload.osmChange');
      return res(Boom.badRequest('Problem reading changeset JSON'));
    }

    // Start a transaction block
    knex.transaction(function(transaction) {

      // Use this to map old ids to new ids.
      var map = {
        node: {},
        way: {}
      }

      // TODO increment numChanges.
      query('node', changeset, meta, map, transaction).then(function() {
        query('way', changeset, meta, map, transaction).then(function() {
          query('relation', changeset, meta, map, transaction).then(function() {

            // Update changeset with new bounding box.
            var updated = updateChangeset(changeset, meta, numChanges);
            knex('changesets')
            .where('id', meta.id)
            .update(updated)
            .then(function() {
              transaction.commit();
              return res({ changeset: _.extend({}, meta, updated) });
            })
            .catch(function(err) {
              log.error('Changeset update fails', err);
              transaction.rollback();
              return res(Boom.badImplementation('Could not update changeset'));
            });
          });
        });
      });

    }).catch(function(err) {
      log.error('Changeset transaction fails', err);
      return res(Boom.badImplementation('Could not complete changeset actions'));
    });
  })
  .catch(function(err) {
    log.error('Changeset not found', err);
    return res(Boom.badRequest('Could not find changeset'));
  });
}

var models = {
  node: Node,
  way: Way,
  relation: Relation
};

function query(entity, changeset, meta, map, transaction) {
  var model = models[entity];
  if (!model) {
    return;
  }
  var actions = ['create', 'modify', 'destroy'].map(function(action) {
    return toArray(model.query[action](changeset, meta, map, transaction));
  });
  return Promise.all(_.flatten(actions)).catch(function(err) {
    log.error(entity + ' changeset fails', err);
    transaction.rollback();
    throw new Error(err);
  });
}

function toArray(val) {
  if (_.isArray(val)) {
    return val;
  }
  return [val];
}

function updateChangeset(changeset, meta, numChanges) {
  var nodes = [];
  ['create', 'modify', 'delete'].forEach(function(action) {
    if (changeset[action].node) {
      nodes.push.apply(nodes, changeset[action].node);
    }
  });
  var bbox = BoundingBox.fromNodes(nodes).toScaled();
  var changesetUpdate = {
    min_lon: bbox.minLon | 0,
    min_lat: bbox.minLat | 0,
    max_lon: bbox.maxLon | 0,
    max_lat: bbox.maxLat | 0,
    closed_at: new Date(),
    num_changes: numChanges
  };
  return changesetUpdate
}

module.exports = {
  method: 'POST',
  path: '/changeset/{changesetID}/upload',
  handler: upload
};
