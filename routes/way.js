'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});
var queryWays = require('../services/query-ways.js');

var XML = require('../services/xml.js');
var Node = require('../models/node-model.js');

module.exports = {
  method: 'GET',
  path: '/xml/full',
  handler: function (req, res) {
    var wayId = parseInt(req.query.way_id || '', 10);
    if (!wayId || isNaN(wayId)) {
      return res(Boom.badRequest('Way ID must be a non-zero number'));
    }

    queryWays(knex, wayId)
    .then(function (result) {
      var xmlDoc = XML.write({
        nodes: Node.withTags(result.nodes, result.nodetags, 'node_id'),
        ways: Node.withTags(result.ways, result.waytags, 'way_id')
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
