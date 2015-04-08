'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});
var toGeoJSON = require('../services/osm-data-to-geojson.js');
var queryBbox = require('../services/query-bbox.js');
var BoundingBox = require('../services/BoundingBox.js');

module.exports = {
  method: 'GET',
  path: '/map',
  handler: function (req, res) {
    // parse and validate bbox parameter from query
    // See services/BoundingBox.js.
    var paramString = req.query.bbox || '';
    var bbox = new BoundingBox.fromCoordinates(paramString.split(','));
    if (bbox.error) {
      // TODO: log error on server
      return res(Boom.badRequest(bbox.error));
    }
    
    queryBbox(knex, bbox)
    .then(function (result) {
      res(toGeoJSON(result[0], result[1], result[2], result[3]));
    })
    .catch(function (err) {
      console.log(err);
      res(Boom.wrap(err));
    });
  }
};
