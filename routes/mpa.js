'use strict';
var Boom = require('boom');

var _ = require('lodash');
var inside = require('turf-inside');
var buffer = require('turf-buffer');
var point = require('turf-point');
var knex = require('../connection.js');
var queryWays = require('../services/query-ways.js');
var toGeoJSON = require('../services/osm-data-to-geojson.js');

var getMpasGeoJSON = function () {
  return knex('current_way_tags')
  .select('way_id')
  .where({
    k: 'protect_type',
    v: 'marine_area'
  })
  .then(function(resp) {
    var ids = _.pluck(resp, 'way_id');
    return queryWays(knex, ids);
   })
  .then(function (result) {
    var geoJSON = toGeoJSON(result, 'Polygon');
    // Keep the Id.
    _.forEach(geoJSON.features, function (o, i) {
      geoJSON.features[i].properties.id = +(result.ways[i].id);
    });
    return geoJSON;
  })
};

var getMpa = function (id) {
  return queryWays(knex, id)
  .then(function (resp) {
    if (!resp.ways.length) {
      throw Boom.notFound();
    }

    var hasTag = _.find(resp.ways[0].tags, {k: 'protect_type', v: 'marine_area'});
    if (!hasTag) {
      throw Boom.badRequest('Provided ID is not an MPA');
    }
    // Return only one feature.
    var feature = toGeoJSON(resp, 'Polygon').features[0];
    feature.properties.id = +(id);
    return feature;
  })
};

var coordsFromString = function (coordString) {
  var c = coordString.split(',').map(parseFloat);
  if (c.length != 2) {
    return null;
  }
  if (!isNaN(c[0]) && !isNaN(c[1]) && c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90) {
    return c;
  }
  return null;
};

module.exports = [
  {
    method: 'GET',
    path: '/mpas',
    handler: function (req, res) {

      getMpasGeoJSON()
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

      getMpa(mpaId)
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

      getMpa(mpaId)
      .then(function (feature) {
        console.log('resp', feature);
        var f = radius ? buffer(feature, radius, 'kilometers') : feature;
        if (inside(coordsPoint, f)) {
          return res(f);
        }
        else {
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

      getMpasGeoJSON()
      .then(function (geoJSON) {
        return res('NOT IMPLEMENTED');
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

      getMpasGeoJSON()
      .then(function (geoJSON) {

        geoJSON.features = _.filter(geoJSON.features, function (f) {
          // Buffer if radius is set.
          var f = radius ? buffer(f, radius, 'kilometers') : f;
          return inside(coordsPoint, f);
        });

        return res(geoJSON);
      })
      .catch(function (err) {
        console.log('err');
        res(Boom.wrap(err));
      });
    }
  },
];
