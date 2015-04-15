'use strict';

var Boom = require('boom');
var _ = require('lodash');

var getAdminBoundary = require('../services/admin-boundary.js');
var getSubregionFeatures = require('../services/admin-subregions.js').getFeatures;
var listSubregions = require('../services/admin-subregions.js').list;
var queryPolygon = require('../services/query-polygon.js');
var knex = require('../connection');

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

          var response = {
            meta: {
              id: id,
              name: boundary.name,
              type: boundary.adminType
            },
            adminAreas: subregions
          };

          // Some dirty work to strip what we don't need
          // just to make it cleaner.
          var keysToKeep;
          switch(boundary.adminType) {
            case 1:
              keysToKeep = ['NAME_0', 'NAME_1', 'ID_1_OR'];
            break;
            case 2:
              keysToKeep = ['NAME_0', 'NAME_1', 'ID_1_OR', 'NAME_2', 'ID_2_OR'];
            break;
            case 3:
              keysToKeep = ['NAME_0', 'NAME_2', 'ID_2_OR', 'NAME_3', 'ID_3_OR'];
            break;
            case 4:
              keysToKeep = ['NAME_0', 'NAME_2', 'NAME_3', 'NAME_4', 'ID_4_OR'];
            break;
          }

          _.forEach(keysToKeep, function(key) {
            response.meta[key] = boundary.properties[key];
          });

          // In the case of municipalities and barangay the region is not on the
          // data. We need a new query.
          switch(boundary.adminType) {
            case 4:
              // Barangays don't have the ids in the response, but they can be
              // easily computed.
              response.meta.ID_2_OR = parseInt((id + '').slice(0, -7) + '0000000', 10);
              response.meta.ID_3_OR = parseInt((id + '').slice(0, -3) + '000', 10);
            case 3:
              response.meta.ID_1_OR = parseInt((id + '').slice(0, -9) + '000000000', 10);
              // Get the region name both for municipalities and barangay. 
              getAdminBoundary(response.meta.ID_1_OR).then(function (reg) {
                response.meta.NAME_1 = reg.properties.NAME_1;
                return res(response);
              });
            break;
            default:
              return res(response);
            break;
          }

        });
      })
      .catch(function (err) {
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
  },
  {
    method: 'GET',
    path: '/admin/search/{name}',
    handler: function (req, res) {

      var name = '%' + req.params.name + '%';

      knex.select('id', 'name', 'type')
        .from('admin_boundaries')
        .where('name', 'like', name)
        .orderBy('name')
        .limit(10)
        .then(function (data) {
          console.log(data);
          res(data);
        });
    }
  }
];
