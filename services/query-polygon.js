'use strict';

var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});

var extent = require('turf-extent');
var clip = require('../services/clip.js');
var toGeoJSON = require('../services/osm-data-to-geojson.js');
var queryBbox = require('../services/query-bbox.js');
var BoundingBox = require('../services/BoundingBox.js');

// Query the given GeoJSON Polygon Feature, returning a promise to be
// fulfilled with a GeoJSON FeatureCollection representing the (clipped)
// roads within that polygon.
module.exports = function(boundary) {
  var bbox = new BoundingBox.fromCoordinates(extent(boundary));

  queryBbox(knex, bbox)
  .then(function (result) {
    var roads = toGeoJSON(result[0], result[1], result[2], result[3]);
    roads.features = clip(roads.features, boundary);
    return roads;
  });
};
