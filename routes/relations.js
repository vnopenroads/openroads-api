'use strict';
var Boom = require('boom');
var knex = require('../connection.js');
var log = require('../services/log.js');

module.exports = [
  {
    method: 'GET',
    path: '/relations/{id}',
    handler: function (req, res) {
      if(!req.params.id)
        return res(Boom.badRequest('Valid relation id required.'));

      queryRelations([req.params.id], true)
      .then(res);
    }
  },
  {
    method: 'GET',
    path: '/relations',
    handler: function (req, res) {

      var query = req.query;

      var q;
      // Query the relation by it's member iD.
      // This asks, what projects is this road a part of?
      if (query.member) {
        q = knex('current_relation_members')
        .where('member_type', 'Way')
        .andWhere('member_id', +query.member)
        .select('relation_id');

      }

      // Query the relation by the type of tag it has.
      else {
        var tagKeys = Object.keys(query);
        if(tagKeys.length === 0) {
          return res(Boom.badRequest('Relations endpoint needs member or tags.'));
        }

        q = knex('current_relation_tags');
        tagKeys.forEach(function(key) {
          q = q.where(function () {
            this
            .where('k', key)
            .andWhere('v', query[key]);
          });
        });
        q = q.select('relation_id');
      }
      queryRelations(q).then(res);

    }

  }];

function queryRelations(relationIds, full) {
  return knex('current_relations')
    .whereIn('id', relationIds)
    .then(function (rels) {
      return Promise.all([
        knex('current_relation_tags')
          .whereIn('relation_id', relationIds),
        full ? knex('current_relation_members')
          .whereIn('relation_id', relationIds) : []
      ])
      .then(function (result) {
        var tags = result[0];
        var members = result[1];
        rels.forEach(function (rel) {
          rel.tags = tags.filter(function (t) {
            return t.relation_id === rel.id;
          });
          if(full) {
            rel.members = members.filter(function (m) {
              return m.relation_id === rel.id;
            });
          }
        });
        return rels;
      });
    });
}
