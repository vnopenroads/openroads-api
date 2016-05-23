'use strict';

describe('projects endpoint', function() {
  it('should respond with 404 for non existent admin area', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/123/projects'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('statusCode', 'error', 'message');
      obj.statusCode.should.equal(404);
      obj.message.should.equal('Area ID\'s boundary was not found in the database');
      done();
    })
    .catch(done);
  });

  it('should respond with empty results array', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13020029068/projects'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('projects', 'name', 'type', 'id');
      obj.projects.meta.total.should.equal(0);
      obj.projects.results.should.have.length(0);
      done();
    })
    .catch(done);
  });

  it('should respond correct results', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13581180010/projects'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('projects', 'name', 'type', 'id');
      obj.projects.meta.total.should.equal(2);
      obj.projects.results.should.have.length(2);
      obj.projects.results[0].project_code.should.equal('2015-IVB-25');
      obj.projects.results[1].project_code.should.equal('2015-IVB-26');
      done();
    })
    .catch(done);
  });

  it('should respect pagination limit', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13581180010/projects?limit=1'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('projects', 'name', 'type', 'id');
      obj.projects.meta.total.should.equal(2);
      obj.projects.results.should.have.length(1);
      obj.projects.results[0].project_code.should.equal('2015-IVB-25');
      done();
    })
    .catch(done);
  });

  it('should respect pagination limit and page', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/admin/13581180010/projects?limit=1&page=1'
    })
    .then(function (resp) {
      var obj = JSON.parse(resp.payload);
      obj.should.have.keys('projects', 'name', 'type', 'id');
      obj.projects.meta.total.should.equal(2);
      obj.projects.results.should.have.length(1);
      obj.projects.results[0].project_code.should.equal('2015-IVB-26');
      done();
    })
    .catch(done);
  });
});
