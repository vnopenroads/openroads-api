'use strict';
var Boom = require('boom');
var Promise = require('bluebird');

var knex = require('../connection.js');
var XML = require('../services/xml.js');
var Node = require('../models/node-model.js');

module.exports = {
  method: 'GET',
  path: '/xml/node/{nodeId}',
  handler: function (req, res) {
    var nodeId = parseInt(req.params.nodeId || '', 10);
    if (!nodeId || isNaN(nodeId)) {
      return res(Boom.badRequest('Node ID must be a non-zero number'));
    }

    Promise.all([
      knex('current_nodes').where('id', nodeId),
      knex('current_node_tags').where('node_id', nodeId)
    ])
    .then(function (result) {
      var xmlDoc = XML.write({
        nodes: Node.withTags(result[0], result[1], 'node_id'),
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
