'use strict';
var _ = require('lodash');
var readFile = require('bluebird').promisify(require('fs').readFile);

var file = require.resolve('../data/barangay.json');

module.exports = function getSubregions(parentRegion) {
  return readFile(file, {encoding: 'utf-8'})
  .then(function (data) {
    var featureCollection = JSON.parse(data);

    var subRegions = featureCollection.features.filter(function (feat) {
      return feat.properties.NAME_2 === parentRegion.properties.NAME_2;
    });

    return {
      type: 'FeatureCollection',
      properties: parentRegion.properties,
      features: subRegions
    };
  });
};
