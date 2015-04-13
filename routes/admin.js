'use strict';

var Boom = require('boom');
var Promise = require('bluebird');

var getAdminBoundary = require('../services/admin-boundary.js');
var getSubregions = require('../services/admin-subregions.js');
var queryPolygon = require('../services/query-polygon.js');

module.exports = [
  {
    method: 'GET',
    path: '/admin',
    handler: function (req, res) {
      return getSubregions()
      .then(function (subregions) {
        res({subregions: subregions});
      })
      .catch(function(err) {
        console.error(err);
        res(Boom.wrap(err));
      });
    }
  },
  {
    method: 'GET',
    path: '/admin/{id}',
    handler: function (req, res) {

      var id = +(req.params.id || '');

      getAdminBoundary(id)
      .then(function (boundary) {
        return getSubregions(boundary.adminType, id, boundary)
        .then(function (subregions) {
          if(boundary.adminType <= 2)
            res({ subregions: subregions });
          else
            return queryPolygon(boundary)
            .then(function(roads) {
              res({
                subregions: subregions,
                roads: roads
              });
            });
        });
      })
      .catch(function (err) {
        res(Boom.wrap(err));
      });
    }
  }
];
