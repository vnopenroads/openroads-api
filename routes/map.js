'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});
var queryBbox = require('../services/query-bbox.js');

var XML = require('../services/xml.js');
var Node = require('../models/node-model.js');
var BoundingBox = require('../services/bounding-box.js');

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
      var xmlDoc = XML.write({
        bbox: bbox,
        nodes: Node.withTags(result.nodes, result.nodetags, 'node_id'),
        ways: Node.withTags(result.ways, result.waytags, 'way_id'),
        relations: result.relations
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
