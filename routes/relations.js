'use strict';
var Boom = require('boom');
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: true
});
var log = require('../services/log.js');

module.exports = {
  method: 'GET',
  path: '/relations',
  handler: function (req, res) {

    var query = req.query;

    // Query the relation by it's member iD.
    // This asks, what projects is this road a part of?
    if (query.member) {
    }

    // Query the relation by the type of tag it has.
    else {
      var tagKeys = Object.keys(query);
      if(tagKeys.length === 0) {
        return res(Boom.badRequest('Relations endpoint needs member or tags.'));
      }

      var q = knex('current_relation_tags');
      tagKeys.forEach(function(key) {
        q = q.where(function () {
          this
            .where('k', key)
            .andWhere('v', query[key]);
        });
      });
      q.select('relation_id')
      .then(function (rows) {
        var ids = _.pluck(rows, 'relation_id');
        console.log(ids)
        return queryRelations(ids);
      })
      .then(res);
    }

  }

};

function queryRelations(relationIds) {
  return knex('current_relations')
    .whereIn('id', relationIds)
    .then(function (rels) {
      console.log('rels', rels)
      knex('current_relation_tags')
      .whereIn('relation_id', relationIds)
      .then(function (tags) {
        console.log('tags', tags)
        rels.forEach(function (rel) {
          rel.tags = tags.filter(function (t) {
            return t.relation_id === rel.id;
          });
        });
        return rels;
      });
    });
}
