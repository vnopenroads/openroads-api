'use strict';

var Boom = require('boom');

var getAdminBoundary = require('../services/admin-boundary.js');
var getSubregions = require('../services/admin-subregions.js');
var queryPolygon = require('../services/query-polygon.js');

// GET /admin/id
module.exports = {
  method: 'GET',
  path: '/admin/{id}',
  handler: function (req, res) {

    var id = +(req.params.id || '');


    getAdminBoundary(id)
    .then(queryPolygon)
    .then(function (adminAreaRoads) {
      // expecting a FeatureCollection whose properties === metadata for from
      // admin area's GeoJSON boundary feature and features === roads clipped
      // to within the admin area.
      return getSubregions(id, adminAreaRoads)
      .then(function(subregions) {
        res({
          roads: adminAreaRoads,
          subregions: subregions
        });
      });
    })
    .catch(function (err) {
      res(Boom.wrap(err));
    });
  }
};
