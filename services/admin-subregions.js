'use strict';
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});

module.exports = function getSubregions(parentId, parentRegion) {
  var low = parentId + 1;
  var high = (''+parentId).split('');
  for(var i = high.length - 1; high[i] === '0'; i--)
    high[i] = '9';
  high = +high.join('');
  return knex('admin_boundaries')
  .whereBetween('id', [low, high])
  .then(function (data) {
    var subRegions = _.pluck(data, 'geo');
    return {
      type: 'FeatureCollection',
      properties: parentRegion.properties,
      features: subRegions
    };
  });
};
