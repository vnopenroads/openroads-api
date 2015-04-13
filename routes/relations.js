'use strict';
var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});
var log = require('../services/log.js');

module.exports = {
  method: 'GET',
  path: '/relations',
  handler: function (req, res) {

    function badRequest(err) {
      log.error('Bad request', err);
      return res(Boom.badRequest(err));
    }

    // List
    var options = {
      limit: 20,
      member: null,
      tag: null
    };
    var query = req.query;

    // Query the relation by it's member iD.
    // This asks, what projects is this road a part of?
    if (query.member) {
    }

    // Query the relation by the type of tag it has.
    // This asks, what projects are status: in progress?
    else if (query.id) {

    }

  }

};
