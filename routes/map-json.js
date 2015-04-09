'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});
var toGeoJSON = require('../services/osm-data-to-geojson.js');
var queryBbox = require('../services/query-bbox.js');
var BoundingBox = require('../services/bounding-box.js');
var log = require('../services/log.js');

module.exports = {
  method: 'GET',
  path: '/map',
  handler: function (req, res) {
    // parse and validate bbox parameter from query
    // See services/BoundingBox.js.
    var paramString = req.query.bbox || '';
    var bbox = new BoundingBox.fromCoordinates(paramString.split(','));
    if (bbox.error) {
      log.error('Could not create bounding box for map-json', bbox);
      return res(Boom.badRequest(bbox.error));
    }

    queryBbox(knex, bbox)
    .then(function (result) {
      res(toGeoJSON(result));
    })
    .catch(function (err) {
      console.log(err);
      res(Boom.wrap(err));
    });
  }
};
