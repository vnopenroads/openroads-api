'use strict';
var mocks = require('./helpers/changesets');
var knex = require('knex')({ 
  client: 'pg', 
  connection: require('../../connection'),
  debug: false
});

var serverShouldOk = function(mock, done) {
  var options = { 
    method: 'POST',
    url: '/changeset/1/upload',
    payload: {
      'xmlString': mock
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

describe('ChangesetsController', function() {
  describe('#upload',function() {
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
  });
});


