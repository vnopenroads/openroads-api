'use strict';
var Boom = require('boom');
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});
var queryBbox = require('../services/query-bbox.js');
var BoundingBox = require('../services/BoundingBox.js');
var ratio = require('../services/Ratio.js');

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

      var nodes = result[2];
      //var waytags = result[3];
      //var nodetags = result[4];

      // attach associated nodes to ways
      var ways = result[0];
      ways.forEach(function (way) {
        way.nodes = result[1].filter(function(waynode) {
          return waynode.way_id === way.id;
        });
      });

      var wayFeatures = ways.map(function (way) {
        var nodeCoordinates = result[1].map(function (waynode) {
          var node = _.find(nodes, { 'id': waynode.node_id })
          return [node.longitude / ratio, node.latitude / ratio];
        });

        return {
          type: 'Feature',
          properties: {}, // <-- TODO: add tags?
          geometry: {
            type: 'LineString',
            coordinates: nodeCoordinates
          }
        };
      });

      res({
        type: 'FeatureCollection',
        properties: {},
        features: wayFeatures
      });

    })
    .catch(function (err) {
      console.log(err);
      res(Boom.wrap(err));
    });
  }
};
