'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var QuadTile = require('../services/QuadTile.js');

module.exports = function queryBbox(knex, bbox) {

  // helper to make raw queries, because knex version of these
  // simple selects was MUCH slower
  function select(table, key, ids) {
    return knex.raw('select * from '+table +
      ' where '+key+' in ('+ ids.join(',') + ')')
      .then(function (resp) {
        return resp.rows;
      });
  }

  // Calculate the tiles within this bounding box.
  // See services/QuadTile.js.
  var tiles = QuadTile.tilesForArea(bbox);

  // Find the nodes in the bounding box using the quadtile index.
  var containedNodes = knex('current_nodes')
    .whereIn('tile', tiles)
    .where('visible',true)
    .select('id');

  var containedWayIds = knex('current_way_nodes')
    .whereIn('node_id', containedNodes)
    .select('way_id');

    // Grab the unique ways associated with these way_nodes.  This is a
    // list of ways that intersect the bounding box by at least 1 node.
    // (note that `ways` is still an array of waynode objects.)

    // Also query any additional way_nodes that are in those ways, which gets us
    // the way_nodes that we need from outside the bounding box.

  return Promise.all([
    knex('current_ways').whereIn('id', containedWayIds),
    knex('current_way_nodes')
      .orderBy('sequence_id', 'asc')
      .whereIn('way_id', containedWayIds),
  ])
  .then(function (result) {

    // Now we have all the ways and nodes that we need, so fetch
    // the associated tags.

    var wayIds = _.pluck(result[0], 'id');
    var nodeIds = _(result[1])
      .unique('node_id')
      .pluck('node_id')
      .value();

    require('fs').writeFileSync('/Users/anand/Desktop/nodes.txt',
      nodeIds.join(','));
    // pass along [ways, waynodes, nodes, waytags, nodetags], the last
    // three of which are promises.
    return Promise.all(result.concat([
      select('current_nodes', 'id', nodeIds),
      select('current_way_tags', 'way_id', wayIds),
      select('current_node_tags', 'node_id', nodeIds)
    ]));
  });

};

