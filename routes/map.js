'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: false
});
var queryBbox = require('../services/query-bbox.js');

var XML = require('../services/XML.js');
var Node = require('../models/Node.js');
var BoundingBox = require('../services/BoundingBox.js');

module.exports = {
  method: 'GET',
  path: '/xml/map',
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
      var waytags = result[3];
      var nodetags = result[4];

      // attach associated nodes to ways
      var ways = result[0];
      ways.forEach(function (way) {
        way.nodes = result[1].filter(function(waynode) {
          return waynode.way_id === way.id;
        });
      });

      var xmlDoc = XML.write({
        bbox: bbox,
        nodes: Node.withTags(nodes, nodetags, 'node_id'),
        ways: Node.withTags(ways, waytags, 'way_id')
      });

      var response = res(xmlDoc.toString());
      response.type('text/xml');
    })
    .catch(function (err) {
      console.log(err);
      res(Boom.wrap(err));
    });
  }
};
