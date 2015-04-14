'use strict';
var _ = require('lodash');
var knex = require('../connection.js');

/**
For the OpenRoads project we constructed a custom ID of 10 or 11 characters.

| reg  | prov | munic  | baran |
| ---- | ---- | ------ | ----- |
| [00] | [00] | [0000] | [000] |
 *
 */

var bys = [1e9, 1e7, 1e3, 1];

module.exports = {
  getFeatures: getFeatures,
  list: list
};

function getIds(parentType, parentId) {
  var low, high, by;
  if(!parentType) {
    parentType = 0;
    low = 0;
    high = 1e11;
    by = bys[0];
  }
  else {
    by = bys[parentType];
    low = parentId + by;
    high = parentId + bys[parentType - 1];
  }

  var ids = [];
  for(var i = low; i < high; i += by) {
    ids.push(i);
  }

  return ids;
}

function list(parentType, parentId) {
  return knex('admin_boundaries')
    .whereIn('id', getIds(parentType, parentId))
    .andWhere('type', (parentType || 0) + 1)
    .select('name', 'id');
}

function getFeatures(parentType, parentId, parentRegion) {

  return knex('admin_boundaries')
  .whereIn('id', getIds(parentType, parentId))
  .then(function (data) {
    var subRegions = _.pluck(data, 'geo');
    // HACK: strip actual boundary data for larger regions, because they're
    // waaaaaay too big.
    if(parentType <= 2)
      subRegions.forEach(function (feat) {
        feat.geometry.coordinates = [];
      });
    return {
      type: 'FeatureCollection',
      properties: parentRegion ? parentRegion.properties : {},
      features: subRegions
    };
  });
}