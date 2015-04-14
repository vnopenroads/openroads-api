'use strict';

var getAdminBoundary = require('../../services/admin-boundary.js');
var getSubregionFeatures = require('../../services/admin-subregions.js')
  .getFeatures;
var queryPolygon = require('../../services/query-polygon.js');


describe('subregions endpoint', function() {

  it('responds with the right schema for the whole country', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/subregions'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('adminAreas'); // <-- TODO
      done();
    })
    .catch(done);
  });

  it('responds with the right schema for a particular region', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/subregions/7150000000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('meta', 'adminAreas');
      done();
    })
    .catch(done);
  });

  it('yields provinces for a region', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/subregions/7000000000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.meta.id.should.equal(7000000000);
      obj.meta.type.should.equal(1);
      obj.adminAreas.should.have.length(4);
      done();
    })
    .catch(done);
  });

  it('yields municipalities for a province', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/subregions/7150000000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.meta.id.should.equal(7150000000);
      obj.adminAreas.should.have.length(48);
      done();
    })
    .catch(done);
  });

  it('yields barangays for a municipality', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/subregions/7150210000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.meta.id.should.equal(7150210000);
      obj.meta.name.should.equal('Albuquerque');
      obj.adminAreas.should.have.length(11);
      done();
    })
    .catch(done);
  });
});

describe('admin endpoint', function() {

  it('responds with the right schema for a municipality', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/7150216000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('roads', 'subregions');
      done();
    })
    .catch(done);
  });

  it('gets the barangays for a municipality', function (done) {
    getAdminBoundary(7150216000)
    .then(function(admin) {
      return getSubregionFeatures(3, admin.id, admin);
    })
    .then(function (subregions) {
      subregions.features.should.have.length(15);
      done();
    })
    .catch(done);
  });

  it('fetches a boundary for a given municipality id', function(done) {
    getAdminBoundary(7150216000)
    .then(function (boundary) {
      boundary.properties.NAME_3.should.equal('Batuan');
      boundary.geometry.coordinates[0].should.have.length(311);
      done();
    })
    .catch(done);
  });

  it('queries a polygon, clipping roads to within the poly', function(done) {
    var poly = {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [124.7445, 9.5411],
            [124.7445, 9.5261],
            [124.7650, 9.5261],
            [124.7650, 9.5411],
            [124.7445, 9.5411]
          ]
        ]
      }
    };

    // jshint maxlen: false
    var expected = '{"type":"FeatureCollection","properties":{},"features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[124.7463826,9.5306962],[124.7589139,9.5306539],[124.7589139,9.537891]]},"properties":{"or_condition":"bad","highway":"motorway"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[124.746447,9.5298921],[124.7594504,9.5298286],[124.7594718,9.5372139]]},"properties":{"or_condition":"good","highway":"motorway"}},{"type":"Feature","geometry":{"type":"LineString","coordinates":[[124.7461466,9.5265485],[124.7493867,9.5280087],[124.751275,9.5264427],[124.7595147,9.5264427]]},"properties":{"name":"shouldbeclipped","or_condition":"fair","highway":"motorway"}}]}';

    queryPolygon(poly)
    .then(function (result) {
      JSON.stringify(result).should.equal(expected);
      done();
    })
    .catch(done);
  });

});
