'use strict';

var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});

var extent = require('turf-extent');
var clip = require('./clip.js');
var toGeoJSON = require('./osm-data-to-geojson.js');
var queryBbox = require('./query-bbox.js');
var BoundingBox = require('./bounding-box.js');

// Query the given GeoJSON Polygon Feature, returning a promise to be
// fulfilled with a GeoJSON FeatureCollection representing the (clipped)
// roads within that polygon.
module.exports = function(boundary) {
  var bbox = new BoundingBox.fromCoordinates(extent(boundary));

  return queryBbox(knex, bbox)
  .then(function (result) {
    var roads = toGeoJSON(result[0], result[1], result[2], result[3]);
    roads.features = clip(roads.features, boundary);
    roads.properties = boundary.properties;
    return roads;
  });
};
