'use strict';
var knex = require('../../connection.js');

var changesets = [];

describe('changeset create endpoint', function () {
  it('returns a numerical changeset id.', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: 99,
        user: 'openroads',
        comment: 'test comment'
      }
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var result = JSON.parse(res.payload);
      result.id.should.be.within(0, Number.MAX_VALUE);
      changesets.push(result.id);
      done();
    })
    .catch(function (err) {
      return done(err);
    });
  });

  it('creates a user with the given id if one does not exist', function (done) {
    server.injectThen({
      method: 'PUT',
      url: '/changeset/create',
      payload: {
        uid: Math.floor(Math.random() * 1000),
        user: Math.random().toString(36).substring(7),
        comment: 'test comment'
      }
    })
    .then(function (res) {
      res.statusCode.should.eql(200);
      var result = JSON.parse(res.payload);
      result.id.should.be.within(0, Number.MAX_VALUE);
      changesets.push(result.id);
      done();
    })
    .catch(function (err) {
      return done(err);
    });

  });

});
