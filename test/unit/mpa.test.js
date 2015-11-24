'use strict';
var knex = require('../../connection');
var log = require('../../services/log');

var Area = require('./helpers/create-area');
var Way = require('./helpers/create-way');
var Node = require('./helpers/create-node');
var Change = require('./helpers/create-changeset');
var test = require('./helpers/server-test');

function makeNodes(ii) {
  var nodes = [];
  for (var i = 0; i < ii; ++i) {
    nodes.push(new Node({ id: -(i+1) }));
  }
  return nodes;
}

function get(url) {
  return server.injectThen({
    method: 'GET',
    url: '/openroads/mpa' + url
  });
}

describe('Upload', function () {
  it('Creates a way tagged as an mpa', function (done) {
    var nodes = makeNodes(10);
    var mpa = new Area().nodes(nodes).tags({k: 'protect_type', v: 'marine_area'});
    var cs = new Change();
    cs.create('node', nodes).create('way', mpa);
    test(cs.get(), null, function (res) {
      var created = res.result.created;
      created.way.should.have.property('-1');
      done();
    });
  });
});

describe('Area retrieval endpoint', function () {
  /*
   * TODO finish the endpoint so this test passes
  it('Returns all MPAs', function (done) {
    get('').then(function (res) {
      res.statusCode.should.equal(200);
      done();
    });
  });
  */
});
