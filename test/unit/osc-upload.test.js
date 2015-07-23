'use strict';
var fs = require('fs');
var XML = require('../../services/xml.js');
var upload = require('../../routes/changeset-upload').handler;

var serverShouldStatus= function(mock, done, status) {
  var options = {
    method: 'POST',
    url: '/upload/1',
    payload: mock
  };
  server.injectThen(options)
  .then(function(res) {
    res.statusCode.should.eql(status);
    return done();
  }).catch(function(err) {
    return done(err);
  });
};

describe('OScUploadController', function() {
  describe('#upload', function() {
    var data = fs.readFileSync(
      require.resolve('./fixtures/osc-malvar-road.xml'));
    it('Should ok when uploading a valid file', function(done) {
      serverShouldStatus(data, done, 200);
    });

    it.only('Should break when uploading a malformed file', function(done) {
      data[0] = 0;
      serverShouldStatus(data, done, 400);
    });

    /*
    it.only('Does not hang on a big upload', function(done) {

      var data = fs.readFileSync(
        require.resolve('./fixtures/palawan.osm'), 'utf-8');

      it('Should ok when uploading a large file', function(done) {
        serverShouldStatus(data, done, 200);
      });

    });
    */
  });
});
