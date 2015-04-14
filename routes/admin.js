'use strict';

var Boom = require('boom');
var _ = require('lodash');

var getAdminBoundary = require('../services/admin-boundary.js');
var getSubregionFeatures = require('../services/admin-subregions.js').getFeatures;
var listSubregions = require('../services/admin-subregions.js').list;
var queryPolygon = require('../services/query-polygon.js');

module.exports = [
  {
    method: 'GET',
    path: '/subregions',
    handler: function (req, res) {
      return listSubregions()
      .then(function (subregions) {
        return res({ adminAreas: subregions });
      })
      .catch(function(err) {
        res(Boom.wrap(err));
      });
    }
  },
  {
    method: 'GET',
    path: '/subregions/{id}',
    handler: function (req, res) {

      var id = +(req.params.id || '');

      getAdminBoundary(id)
      .then(function (boundary) {
        return listSubregions(boundary.adminType, id, boundary)
        .then(function (subregions) {
          return res({
            meta: _.extend(boundary.properties, {
              id: id,
              name: boundary.name,
              type: boundary.adminType
            }),
            adminAreas: subregions
          });
        });
      })
      .catch(function (err) {
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
        return getSubregionFeatures(boundary.adminType, id, boundary)
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
