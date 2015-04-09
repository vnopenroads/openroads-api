'use strict';
var _ = require('lodash');
var knex = require('knex')({
  client: 'pg',
  connection: require('../../connection.js'),
  debug: false
});
var mocks = require('./fixtures/changesets.js');
var XML = require('../../services/xml.js');

var Node = require('./helpers/create-node.js');
var Way = require('./helpers/create-way.js');
var Change = require('./helpers/create-changeset.js');

var log = require('../../services/log.js');

var test = function(mock, done) {
  var options = {
    method: 'POST',
    url: '/changeset/1/upload',
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

describe('changeset upload endpoint', function() {

  var cs = new Change();

  beforeEach(function() {
    cs.wipe();
  });

  it('Creates 1 node', function(done) {
    cs.create('node', new Node());
    test(cs.get(), done);
  });

  it('Creates 500 nodes', function(done) {
    var nodes = [];
    for (var i = 0; i < 500; ++i) {
      nodes.push(new Node({ id: -(i+1) }));
    }
    cs.create('node', nodes);
    test(cs.get(), done);
  });

  it('Creates 1 node and 1 node tag', function(done) {
    cs.create('node', new Node().tags({k: 'howdy', v: 'test'}));
    test(cs.get(), done);
  });

  it('Creates 1 way with 500 nodes and 50 tags', function(done) {
    var nodes = [];
    for (var i = 0; i < 500; ++i) {
      nodes.push(new Node({ id: -(i+1) }));
    }
    var way = new Way().nodes(nodes);
    for (var i = 0; i < 50; ++i) {
      way.tags({ k: 'happy' + i, v: 'testing' + i });
    }
    cs.create('node', nodes);
    cs.create('way', way);
    test(cs.get(), done);
  });

  it('Creates 5 ways with 500 nodes', function(done) {
    var nodes = [];
    for (var i = 0; i < 500; ++i) {
      nodes.push(new Node({ id: -(i+1) }));
    }
    var ways = [
      new Way({ id: -1 }).nodes(nodes.slice(0,100)),
      new Way({ id: -2 }).nodes(nodes.slice(101,200)),
      new Way({ id: -3 }).nodes(nodes.slice(201,300)),
      new Way({ id: -4 }).nodes(nodes.slice(301,400)),
      new Way({ id: -5 }).nodes(nodes.slice(401,499))
    ];
    cs.create('node', nodes);
    cs.create('way', ways);

    log.debug('here');
    log.debug(JSON.stringify(cs.get()));

    test(cs.get(), done);
  });


  it('Modifies 1 node', function(done) {
    knex('current_nodes').where('changeset_id', 1).then(function(nodes) {
      cs.modify('node', new Node(nodes[0]));
      test(cs.get(), done);
    });
  });

  it('Modifies up to 50 nodes', function(done) {
    knex('current_nodes').where('changeset_id', 1).then(function(nodes) {
      var newNodes = [];
      var modified = 0;
      nodes = nodes.slice(0,50);
      nodes.forEach(function(node) {
        if (node) {
          modified += 1;
          newNodes.push(new Node(node));
        }
      });
      log.info('Modifying ' + modified + ' nodes');
      cs.modify('node', newNodes);
      test(cs.get(), done);
    });
  });

  it('Creates 500 nodes, Modifies a way with 500 nodes', function(done) {
    knex('current_ways').where('changeset_id', 1).then(function(ways) {
      var way = new Way(ways[0]);
      var nodes = [];
      for (var i = 0; i < 500; ++i) {
        nodes.push(new Node({ id: -(i+1) }));
      }
      way.nodes(nodes);
      cs.create('node', nodes);
      cs.modify('way', way);
      test(cs.get(), done);
    });
  });

  it('Creates 500 nodes, modifies up to 10 ways', function(done) {
    knex('current_ways').where('changeset_id', 1).then(function(ways) {
      var nodes = [];
      for (var i = 0; i < 500; ++i) {
        nodes.push(new Node({ id: -(i+1) }));
      }
      cs.create('node', nodes);
      ways = ways.slice(0,10);
      var newWays = [];
      var modified = 0;
      ways.forEach(function(way) {
        if (way) {
          modified += 1;
          newWays.push(new Way(way).nodes(nodes));
        }
      });
      log.info('Modifying ' + modified + ' ways');
      cs.modify('way', newWays);
      test(cs.get(), done);
    });
  });


  it('Deletes 1 node', function(done) {
    knex('current_nodes').where('changeset_id', 1).then(function(nodes) {
      cs.delete('node', new Node(nodes[0]));
      test(cs.get(), done);
    });
  });


  it('Deletes 1 way', function(done) {
    knex('current_ways').where('changeset_id', 1).then(function(ways) {
      cs.delete('node', new Way(ways[0]));
      test(cs.get(), done);
    });
  });

  it('Deletes up to 500 nodes', function(done) {
    knex('current_nodes').where('changeset_id', 1).then(function(nodes) {
      nodes = nodes.slice(0, 500);
      cs.delete('node', nodes);
      test(cs.get(), done);
    });
  });

});
