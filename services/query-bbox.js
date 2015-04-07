'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var QuadTile = require('../services/QuadTile.js');

module.exports = function queryBbox(knex, bbox) {
  // Calculate the tiles within this bounding box.
  // See services/QuadTile.js.
  var tiles = QuadTile.tilesForArea(bbox);

  return knex('current_nodes')

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
  });
};
