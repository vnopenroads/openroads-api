'use strict';
var knex = require('../../connection.js');

var Node = require('./helpers/create-node.js');
var Way = require('./helpers/create-way.js');
var Relation = require('./helpers/create-relation.js');
var Change = require('./helpers/create-changeset.js');

function makeNodes(ii) {
  var nodes = [];
  for (var i = 0; i < ii; ++i) {
    nodes.push(new Node({ id: -(i+1) }));
  }
  return nodes;
}

describe('Relations endpoint', function() {

  var lockCondition = false;

  var offset = 0;
  var lock = function(done) {
    if (lockCondition) done();
    else setTimeout(function() {lock(done);}, 500);
  };

  before(function(done) {

    
    //Create a way with a relation
    var cs = new Change();
    var nodes = makeNodes(5);
    var way = new Way().nodes(nodes);
    var relation = new Relation()
                          .members('node', nodes)
                          .members('way', way)
                          .tags({k: 'test', v:'relation_endpoint'});
    cs.create('node', nodes)
      .create('way', way)
      .create('relation', relation);

    var options = {
      method: 'POST',
      url: '/changeset/1/upload',
      payload: {
        osmChange: cs.get()
      }
    };
    server.injectThen(options)
    .then(function() {
      knex('current_relations')
        .where('changeset_id', 1)
        .then(function(relations) {
          offset = relations.length - 1;
        }).then(function() {
            lockCondition = true;
        });
    });
    lock(done);
  });

  it('Should return a valid relation, tag test', function(done) {
    server.injectThen({
      method: 'GET',
      url: '/relations?test=relation_endpoint'
    }).then(function(res) {
      res.statusCode.should.eql(200);
      var payload = JSON.parse(res.payload);
      payload.should.be.instanceOf(Array);
      payload.should.not.have.lengthOf(0);
      var relation = JSON.parse(res.payload)[0]; // Get first relation
      relation.should.have
        .keys('changeset_id', 'tags', 'id', 'timestamp', 'version', 'visible');
      relation.tags.should.have.lengthOf(1);
      done();
    }).catch(done);
  });

  it('Should return a valid relation, way test', function(done) {
    knex('current_relations').where('changeset_id', 1)
    .then(function(relations) {
      knex('current_relation_members')
        .where('relation_id', relations[offset].id)
        .andWhere('member_type', 'Way')
        .then(function(ways) {
          server.injectThen({
            method: 'GET',
            url: '/relations?member='+ways[0].member_id
          }).then(function(res) {
            res.statusCode.should.eql(200);
            var payload = JSON.parse(res.payload);
            payload.should.be.instanceOf(Array);
            payload.should.not.have.lengthOf(0);
            var relation = JSON.parse(res.payload)[0]; // Get first relation
            relation.should.have
              .keys('changeset_id', 'tags', 'id', 'timestamp', 'version', 'visible');
            done();
          }).catch(done);
        });
    });
  });
  it('Should return a valid relation, id test', function(done) {
    knex('current_relations').where('changeset_id', 1)
    .then(function(relations) {
      server.injectThen({
        method: 'GET',
        url: '/relations/'+relations[offset].id
      }).then(function(res) {
        res.statusCode.should.eql(200);
        var payload = JSON.parse(res.payload);
        payload.should.be.instanceOf(Array);
        payload.should.not.have.lengthOf(0);
        var relation = JSON.parse(res.payload)[0]; // Get first relation
        relation.should.have
          .keys('changeset_id', 'tags', 'id', 'timestamp', 'version',
                'visible', 'members');
        relation.members.should.have.lengthOf(6);
        done();
      }).catch(done);
    });
  });
});