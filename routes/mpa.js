'use strict';
var Boom = require('boom');

var _ = require('lodash');
var inside = require('turf-inside');
var buffer = require('turf-buffer');
var point = require('turf-point');
var polyDistance = require('../services/polygon-distance.js');
var queryMPAs = require('../services/query-mpas.js');
var coordsFromString = require('../services/coords.js').fromString;

module.exports = [
  {
    method: 'GET',
    path: '/mpas',
    handler: function (req, res) {
      queryMPAs.getMpas()
      .then(function (geoJSON) {
        return res(geoJSON);
      })
      .catch(function (err) {
        console.log(err);
        res(Boom.wrap(err));
      });
    }
  },




  {
    method: 'GET',
    path: '/mpas/{mpaId}',
    handler: function (req, res) {
      var mpaId = parseInt(req.params.mpaId || '', 10);
      if (!mpaId || isNaN(mpaId) || mpaId < 0) {
        return res(Boom.badRequest('Mpa ID must be a non-zero number'));
      }

      queryMPAs.getMpa(mpaId)
      .then(function (feature) {
        res(feature);
      })
      .catch(function (err) {
        console.log(err);
        res(Boom.wrap(err));
      });
    }
  },




  {
    method: 'GET',
    path: '/mpas/{mpaId}/contain/{coords}', // radius=X',
    handler: function (req, res) {
      var mpaId = parseInt(req.params.mpaId || '', 10);
      if (!mpaId || isNaN(mpaId) || mpaId < 0) {
        return res(Boom.badRequest('Mpa ID must be a non-zero number'));
      }

      var coords = coordsFromString(req.params.coords);
      if (!coords) {
        return res(Boom.badRequest('Bad coordinates format. Use lng,lat'));
      }
      var coordsPoint = point(coords);

      var radius = parseFloat(req.query.radius);
      if (isNaN(radius) || radius <= 0) {
        radius = null;
      }

      queryMPAs.getMpa(mpaId)
      .then(function (feature) {
        console.log('resp', feature);
        var f = radius ? buffer(feature, radius, 'kilometers') : feature;
        if (inside(coordsPoint, f)) {
          return res(f);
        } else {
          return res({});
        }
      })
      .catch(function (err) {
        console.log(err);
        res(Boom.wrap(err));
      });
    }
  },




  {
    method: 'GET',
    path: '/mpas/near/{coords}', // limit=X
    handler: function (req, res) {
      var coords = coordsFromString(req.params.coords);
      if (!coords) {
        return res(Boom.badRequest('Bad coordinates format. Use lng,lat'));
      }
      var coordsPoint = point(coords);

      var limit = parseFloat(req.query.limit);
      if (isNaN(limit) || limit <= 0) {
        limit = null;
      }

      queryMPAs.getMpas()
      .then(function (geoJSON) {
        var f = _.chain(geoJSON.features)
          .map(function (o) {
            // When inside the distance becomes 0.
            if (inside(coordsPoint, o)) {
              o.properties.distance = 0;
            } else {
              o.properties.distance = polyDistance(o, coordsPoint);
            }
            return o;
          })
          .sortBy(function (o) {
            return o.properties.distance;
          });

        if (limit !== null) {
          f = f.take(limit);
        }

        geoJSON.features = f.value();
        return res(geoJSON);
      })
      .catch(function (err) {
        console.log(err);
        res(Boom.wrap(err));
      });
    }
  },




  {
    method: 'GET',
    path: '/mpas/contain/{coords}', // radius=X
    handler: function (req, res) {
      var coords = coordsFromString(req.params.coords);
      if (!coords) {
        return res(Boom.badRequest('Bad coordinates format. Use lng,lat'));
      }
      var coordsPoint = point(coords);

      var radius = parseFloat(req.query.radius);
      if (isNaN(radius) || radius <= 0) {
        radius = null;
      }

      queryMPAs.getMpas()
      .then(function (geoJSON) {
        geoJSON.features = _.filter(geoJSON.features, function (f) {
          // Buffer if radius is set.
          f = radius ? buffer(f, radius, 'kilometers') : f;
          return inside(coordsPoint, f);
        });

        return res(geoJSON);
      })
      .catch(function (err) {
        console.log('err');
        res(Boom.wrap(err));
      });
    }
  }
];
