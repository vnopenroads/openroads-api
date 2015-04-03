var mocks = require('./helpers/changesets');

describe('ChangesetsController', function() {
  describe('#upload',function() {
    it('Creates 2 nodes and a way with 2 tags', function(done) {
      var options = {
        method: 'POST',
        url: '/changeset/1/upload',
        payload: {
          'xmlString': mocks.createWay
        }
      }
      server.injectThen(options)
      .then(function(res) {
        res.statusCode.should.eql(200);
        done()
      }).catch(function(err) {
        return done(err);
      })
    });
  })
})
