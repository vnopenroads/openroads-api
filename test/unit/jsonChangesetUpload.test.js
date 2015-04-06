'use strict';
var knex = require('knex')({
  client: 'pg',
  connection: require('../../connection'),
  debug: false
});
var mocks = require('./helpers/changesets');
var _ = require('lodash');

var serverShouldOk = function(mock, done) {
  var options = {
    method: 'POST',
    url: '/changeset/json/1/upload',
    payload: {
      osmChange: mock
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
    it('Modifies a long way in json', function(done) {
      serverShouldOk(mocks.json.json.osmChange, done);
    });
  });
});
