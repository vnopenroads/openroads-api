'use strict';

var getAdminBoundary = require('../../services/admin-boundary.js');
var getSubregionFeatures = require('../../services/admin-subregions.js').getFeatures;
var queryPolygon = require('../../services/query-polygon.js');

describe('admin subregions endpoint', function() {
  this.slow(5000);

  it('responds with the right schema for the whole country', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/subregions'
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
      url: '/admin/13000000000/subregions'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('id', 'name', 'type', 'NAME_0', 'adminAreas', 'bbox');
      done();
    })
    .catch(done);
  });

  it('yields provinces for a region', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13000000000/subregions'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.id.should.equal(13000000000);
      obj.type.should.equal(1);
      obj.adminAreas.should.have.length(10);
      done();
    })
    .catch(done);
  });

  it('yields municipalities for a province', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13590000000/subregions'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.id.should.equal(13590000000);
      obj.type.should.equal(2);
      obj.adminAreas.should.have.length(23);
      done();
    })
    .catch(done);
  });

  it('yields barangays for a municipality', function(done) {
    // this also tests getAdminBoundary()
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204000/subregions'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.id.should.equal(13591204000);
      obj.name.should.equal('Dumaran');
      obj.type.should.equal(3);
      obj.adminAreas.should.have.length(16);
      done();
    })
    .catch(done);
  });

  it('responds with code 400 for region subregion boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13000000000/subregions?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.statusCode.should.equal(400);
      obj.message.should.equal('Request region is too large.');
      done();
    })
    .catch(done);
  });

  it('responds with code 400 for province subregion boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13590000000/subregions?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.statusCode.should.equal(400);
      obj.message.should.equal('Request region is too large.');
      done();
    })
    .catch(done);
  });

  it('responds with municipality subregion boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204000/subregions?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('type', 'properties', 'features');
      obj.properties.id.should.equal(13591204000);
      obj.properties.name.should.equal('Dumaran');
      obj.properties.type.should.equal(3);
      obj.features.should.have.length(16);
      done();
    })
    .catch(done);
  });

  it('responds no subregion boundaries for barangays', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204002/subregions?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('type', 'properties', 'features');
      obj.features.should.have.length(0);
      done();
    })
    .catch(done);
  });
});

describe('admin endpoint', function() {
  this.slow(5000);

  it('responds with the right schema for a municipality', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204000'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('id', 'name', 'type', 'NAME_0', 'NAME_1', 'NAME_2', 'ID_1_OR', 'ID_2_OR');
      done();
    })
    .catch(done);
  });

  it('fetches a boundary for a given municipality id', function(done) {
    getAdminBoundary(13030051003)
    .then(function (boundary) {
      boundary.name.should.equal('San Isidro');
      boundary.geometry.coordinates[0].should.have.length(29);
      done();
    })
    .catch(done);
  });

  it.skip('queries a polygon, clipping roads to within the poly', function(done) {
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

    queryPolygon(poly)
    .then(function (result) {
      result.should.have.property('features');
      result.features.length.should.be.greaterThan(0);
      var isclipped = result.features.some(function(feature) {
        return feature.properties.name &&
          feature.properties.name === 'shouldbeclipped';
      });
      isclipped.should.equal(true);
      done();
    })
    .catch(done);
  });

  it('responds with code 400 for region road network', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13000000000?roadNetwork=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.statusCode.should.equal(400);
      obj.message.should.equal('Request area is greater than maximum request area.');
      done();
    })
    .catch(done);
  });

  it('responds with code 400 for province road network', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13590000000?roadNetwork=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.statusCode.should.equal(400);
      obj.message.should.equal('Request area is greater than maximum request area.');
      done();
    })
    .catch(done);
  });

  it.skip('responds with barangays road network', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204002?roadNetwork=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('type', 'properties', 'features');
      obj.properties.id.should.equal(13591204002);
      obj.properties.name.should.equal('Bohol');
      obj.properties.type.should.equal(4);
      obj.features.should.have.length(1);
      obj.features[0].properties.should.have.keys('highway', 'or_responsibility', 'source');
      done();
    })
    .catch(done);
  });

  it('responds with region boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13000000000?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('type', 'properties', 'geometry');
      obj.properties.id.should.equal(13000000000);
      obj.properties.name.should.equal('Region IV-B (Mimaropa)');
      obj.properties.type.should.equal(1);
      done();
    })
    .catch(done);
  });

  it('responds with province boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13590000000?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.properties.id.should.equal(13590000000);
      obj.properties.name.should.equal('Palawan');
      obj.properties.type.should.equal(2);
      obj.should.have.keys('type', 'properties', 'geometry');
      done();
    })
    .catch(done);
  });

  it('responds with municipality boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204000?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('type', 'properties', 'geometry');
      obj.properties.id.should.equal(13591204000);
      obj.properties.name.should.equal('Dumaran');
      obj.properties.type.should.equal(3);
      done();
    })
    .catch(done);
  });

  it('responds with barangays boundaries', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13591204002?boundary=true'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.properties.id.should.equal(13591204002);
      obj.properties.name.should.equal('Bohol');
      obj.properties.type.should.equal(4);
      obj.should.have.keys('type', 'properties', 'geometry');
      done();
    })
    .catch(done);
  });

});

describe('admin search endpoint', function() {
  this.slow(5000);

  function sortIDs(a, b) {
    var idA = parseInt(a.id);
    var idB = parseInt(b.id);
    return (idA < idB) ? -1 : (idA > idB) ? 1 : 0;
  }

  it('responds with the right results for term quezon', function(done) {
    var expected = [
      {"id":13591210000,"type":3,"name":"Quezon","parent":{"id":13590000000,"name":"Palawan","type":2},"bbox":[117.76358795166027,9.01955986022972,118.36121368408203,9.55039024353033]},
      {"id":13300546012,"type":4,"name":"Quezon","parent":{"id":13300546000,"name":"Libjo","type":3},"bbox":[125.49250030517612,10.186739921569824,125.53472137451195,10.224089622497615]},
      {"id":13751497016,"type":4,"name":"Quezon","parent":{"id":13751497000,"name":"Del Carmen","type":3},"bbox":[126.01599884033226,9.820810317993278,126.03263092041027,9.83810043334961]},
      {"id":13751501012,"type":4,"name":"Quezon","parent":{"id":13751501000,"name":"Mainit","type":3},"bbox":[125.52903747558594,9.528791427612305,125.54736328125023,9.548560142517204]},
      {"id":13751511036,"type":4,"name":"Quezon","parent":{"id":13751511000,"name":"Surigao City","type":3},"bbox":[125.48372650146496,9.726699829101676,125.51569366455078,9.747839927673397]},
      {"id":13761530014,"type":4,"name":"Quezon","parent":{"id":13761530000,"name":"Tagbina","type":3},"bbox":[126.1268234252932,8.465009689331055,126.15695953369163,8.51272010803234]},
      {"id":13761532013,"type":4,"name":"Quezon","parent":{"id":13761532000,"name":"Tandag City","type":3},"bbox":[126.15045928955078,9.053370475769043,126.17285156250011,9.066610336303711]}
    ]
    
    server.injectThen({
      method: 'GET',
      url: '/admin/search/quezon'
    })
    .then(function (resp) {
      JSON.parse(resp.payload).sort(sortIDs).should.be.eql(expected.sort(sortIDs));
      done();
    })
    .catch(done);
  });

  it('responds with the right results when there is a shared parent', function(done) {
    var expected = [
      {"id":13020000000,"type":2,"name":"Agusan Del Norte","parent":{"id":13000000000,"name":"Region IV-B (Mimaropa)","type":1},"bbox":[125.19894409179685,8.644116401672349,125.76863861083987,9.473800659179688]},
      {"id":13030000000,"type":2,"name":"Agusan Del Sur","parent":{"id":13000000000,"name":"Region IV-B (Mimaropa)","type":1},"bbox":[125.24803161621094,7.925417423248291,126.37147521972656,9.177813529968262]},
      {"id":13020029002,"type":4,"name":"Agusan Pequeno","parent":{"id":13020029000,"name":"Butuan City","type":3},"bbox":[125.52469635009777,8.97002983093273,125.5399627685548,8.989430427551326]}
    ]

    server.injectThen({
      method: 'GET',
      url: '/admin/search/agusan'
    })
    .then(function (resp) {
      JSON.parse(resp.payload).sort(sortIDs).should.be.eql(expected.sort(sortIDs));
      done();
    })
    .catch(done);
  });

  it('responds with the right results for quezon - case insensitive', function(done) {
    var expected = [
      {"id":13591210000,"type":3,"name":"Quezon","parent":{"id":13590000000,"name":"Palawan","type":2},"bbox":[117.76358795166027,9.01955986022972,118.36121368408203,9.55039024353033]},
      {"id":13300546012,"type":4,"name":"Quezon","parent":{"id":13300546000,"name":"Libjo","type":3},"bbox":[125.49250030517612,10.186739921569824,125.53472137451195,10.224089622497615]},
      {"id":13751497016,"type":4,"name":"Quezon","parent":{"id":13751497000,"name":"Del Carmen","type":3},"bbox":[126.01599884033226,9.820810317993278,126.03263092041027,9.83810043334961]},
      {"id":13751501012,"type":4,"name":"Quezon","parent":{"id":13751501000,"name":"Mainit","type":3},"bbox":[125.52903747558594,9.528791427612305,125.54736328125023,9.548560142517204]},
      {"id":13751511036,"type":4,"name":"Quezon","parent":{"id":13751511000,"name":"Surigao City","type":3},"bbox":[125.48372650146496,9.726699829101676,125.51569366455078,9.747839927673397]},
      {"id":13761530014,"type":4,"name":"Quezon","parent":{"id":13761530000,"name":"Tagbina","type":3},"bbox":[126.1268234252932,8.465009689331055,126.15695953369163,8.51272010803234]},
      {"id":13761532013,"type":4,"name":"Quezon","parent":{"id":13761532000,"name":"Tandag City","type":3},"bbox":[126.15045928955078,9.053370475769043,126.17285156250011,9.066610336303711]}
    ]

    server.injectThen({
      method: 'GET',
      url: '/admin/search/QuEzOn'
    })
    .then(function (resp) {
      JSON.parse(resp.payload).sort(sortIDs).should.be.eql(expected.sort(sortIDs));
      done();
    })
    .catch(done);
  });

  it('responds with no results for term nothing', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/search/nothing'
    })
    .then(function (resp) {
      JSON.parse(resp.payload).should.be.empty;
      done();
    })
    .catch(done);
  });

  it('responds with a maximum of 10 results', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/search/a'
    })
    .then(function (resp) {
      JSON.parse(resp.payload).should.have.length(10);
      done();
    })
    .catch(done);
  });

});
