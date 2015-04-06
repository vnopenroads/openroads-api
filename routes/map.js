'use strict';
var Boom = require('boom');
var _ = require('lodash');
var Promise = require('bluebird');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});

var XML = require('../services/XML.js');
var Node = require('../models/Node.js');
var Way = require('../models/Way.js');
var BoundingBox = require('../services/BoundingBox.js');
var QuadTile = require('../services/QuadTile.js');

module.exports = {
  method: 'GET',
  path: '/xml/map',
  handler: function (req, res) {
    // parse and validate bbox parameter from query
    // See services/BoundingBox.js.
    var paramString = req.query.bbox || '';
    var bbox = new BoundingBox.fromCoordinates(paramString.split(','));
    if (bbox.error) {
      // TODO: log error on server
      return res(Boom.badRequest(bbox.error));
    }

    // Calculate the tiles within this bounding box.
    // See services/QuadTile.js.
    var tiles = QuadTile.tilesForArea(bbox);

    knex('current_nodes')

    // Find the nodes in the bounding box using the quadtile index.

    .where(function () {
      this
        .where('visible', true)
        .whereIn('tile', tiles);
    })
    .select('id')
    .then(function (nodes) {

      // Get all way_nodes in the bounding box.

      var nodeIds = _.pluck(nodes, 'id');
      return (nodes.length === 0) ? [] : knex('current_way_nodes')
        .whereIn('node_id', nodeIds)
        .select();
    })
    .then(function (waynodes) {

      // Grab the unique ways associated with these way_nodes.  This is a
      // list of ways that intersect the bounding box by at least 1 node.
      // (note that `ways` is still an array of waynode objects.)

      // Also query any additional way_nodes that are in those ways, which gets us
      // the way_nodes that we need from outside the bounding box.

      var wayIds = _(waynodes)
        .unique('way_id')
        .pluck('way_id')
        .value();

      return Promise.all([
        knex('current_ways').whereIn('id', wayIds),
        knex('current_way_nodes').whereIn('way_id', wayIds),
      ]);
    })
    .then(function (result) {

      // Now we have all the ways and nodes that we need, so fetch
      // the associated tags.

      var wayIds = _.pluck(result[0], 'id');
      var nodeIds = _(result[1])
        .unique('node_id')
        .pluck('node_id')
        .value();

      // pass along [ways, waynodes, nodes, waytags, nodetags], the last
      // three of which are promises.
      return Promise.all(result.concat([
        knex('current_nodes').whereIn('id', nodeIds),
        knex('current_way_tags').whereIn('way_id', wayIds),
        knex('current_node_tags').whereIn('node_id', nodeIds)
      ]));
    })
    .then(function (result) {

      var nodes = result[2];
      var waytags = result[3];
      var nodetags = result[4];

      // attach associated nodes to ways
      var ways = result[0];
      ways.forEach(function (way) {
        way.nodes = result[1].filter(function(waynode) {
          return waynode.way_id === way.id;
        });
      });

      var xmlDoc = XML.write({
        bbox: bbox,
        nodes: Node.withTags(nodes, nodetags, 'node_id'),
        ways: Node.withTags(ways, waytags, 'way_id')
      });

      var response = res(xmlDoc.toString());
      response.type('text/xml');
    })
    .catch(function (err) {
      console.log(err);
      res(Boom.wrap(err));
    });
  }
};
