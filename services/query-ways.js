'use strict';
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = function queryWays(knex, wayIds) {

  // helper to make raw queries, because knex version of these
  // simple selects was MUCH slower
  function select(table, key, ids) {
    if(ids.length === 0)
      return Promise.resolve([]);
    return knex.raw('select * from '+table +
      ' where '+key+' in ('+ ids.join(',') + ')')
      .then(function (resp) {
        return resp.rows;
      });
  }

  // Query the desired ways and any way_nodes that are in those ways

  return Promise.all([
    knex('current_ways').whereIn('id', wayIds),
    knex('current_way_nodes')
      .orderBy('sequence_id', 'asc')
      .whereIn('way_id', wayIds),
  ])
  .then(function (result) {

    // Now we have all the ways and nodes that we need, so fetch
    // the associated tags.

    var wayIds = _.pluck(result[0], 'id');
    var nodeIds = _(result[1])
      .unique('node_id')
      .pluck('node_id')
      .value();

    return Promise.all(result.concat([
      select('current_nodes', 'id', nodeIds),
      select('current_way_tags', 'way_id', wayIds),
      select('current_node_tags', 'node_id', nodeIds)
    ]));
  })
  .then(function (resultArr) {
    var result = {
      ways: resultArr[0],
      waynodes: resultArr[1],
      nodes: resultArr[2],
      waytags: resultArr[3],
      nodetags: resultArr[4]
    };

    // attach associated nodes and tags to ways
    result.ways.forEach(function (way) {
      way.nodes = result.waynodes.filter(function(waynode) {
        return waynode.way_id === way.id;
      });
      way.tags = result.waytags.filter(function(tag) {
        return tag.way_id === way.id;
      });
    });

    return result;

  });

};

