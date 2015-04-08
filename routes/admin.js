'use strict';

var fs = require('fs');
var _ = require('lodash');
var Boom = require('boom');
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

var municpalityFile = require.resolve('../data/municipality.json');

module.exports = {
  method: 'GET',
  path: '/admin/{type}/{id}',
  handler: function (req, res) {
    
    if('municipality' !== req.params.type) {
      return res(Boom.badRequest('Admin type "' +
        req.params.type + '" not supported.'));
    }
    
    // TODO: could switch this to use JSONStream if the data files are big.
    fs.readFile(municpalityFile, {encoding: 'utf-8'}, function (err, data) {
      if(err) return Boom.wrap(err);
      var municipalities = JSON.parse(data);      

      var ids = (req.params.id || '').split(':').map(Number);
      var boundary = _.find(municipalities.features, {
        properties: {
          ID_0: ids[0],
          ID_1: ids[1],
          ID_2: ids[2]
        }
      });
      
      if(!boundary) {
        return res(Boom.badRequest('Could not find ' + req.params.type +
          ' with id ' + req.params.id));
      }

      var bbox = new BoundingBox.fromCoordinates(extent(boundary));

      queryBbox(knex, bbox)
      .then(function (result) {
        var roads = toGeoJSON(result[0], result[1], result[2], result[3]);
        roads.features = clip(roads.features, boundary);
        res(roads);
      })
      .catch(function (err) {
        res(Boom.wrap(err));
      });

    });

  }
};
