'use strict';
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: require('../../connection.js'),
  debug: false
});
var mocks = require('./helpers/changesets.js');
var XML = require('../../services/xml.js');

var serverShouldOk = function(mock, done) {
  var options = {
    method: 'POST',
    url: '/changeset/1/upload',
    payload: {
      osmChange: XML.read(mock)
    }
  };
  server.injectThen(options)
  .then(function(res) {
    res.statusCode.should.eql(200);
    return done();
  }).catch(function(err) {
    return done(err);
  });
};

describe('jsonChangesetsController', function() {
  describe('#upload', function() {
    it('Creates a node', function(done) {
      serverShouldOk(mocks.createNode(-1), done);
    });

    it('Modifies a node', function(done) {
      knex('current_nodes').where('changeset_id', 1)
      .then(function(nodes) {
        serverShouldOk(mocks.modifyNode(nodes[0].id), done);
      });
    });

    it('Deletes a node', function(done) {
      knex('current_nodes').where('changeset_id', 1)
      .then(function(nodes) {
        serverShouldOk(mocks.deleteNode(nodes[0].id), done);
      });
    });

    it('Creates 3 nodes and a way', function(done) {
      serverShouldOk(mocks.createWay, done);
    });

    it('Modifies a way', function(done) {
      knex('current_nodes').where('changeset_id', 1)
      .then(function(nodes) {
        knex('current_ways').where('changeset_id', 1)
        .then(function(ways) {
          serverShouldOk(mocks.modifyWay(nodes[1].id,
            nodes[2].id, nodes[3].id, ways[0].id), done);
        });
      });
    });

    it('Creates a long way', function(done) {
      serverShouldOk(mocks.createLongWay(), done);
    });

    it('Modifies a long way', function(done) {
      knex('current_nodes').where('changeset_id', 1)
      .then(function(nodes) {
        knex('current_ways').where('changeset_id', 1)
        .then(function(ways) {
          serverShouldOk(
            mocks.modifyLongWay(_.pluck(nodes.slice(4), 'id'), ways[1].id),
            done);
        });
      });
    });
  });
});
