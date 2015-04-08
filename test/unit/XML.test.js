'use strict';
var libxml = require('libxmljs');
var mock = require('./helpers/XML.readChanges');
var _ = require('lodash');
var XML = require('../../services/XML');

var log = require('../../services/Logger');
var docJson = require('./helpers/changesets').json.json.osmChange;
var docXml = require('./helpers/changesets').json.xml;

var Node = require('../../models/Node');
var Way = require('../../models/Way');

function rmTimestamps(actionArray) {
  return actionArray.map(function(action) {
    var timestamps = ['timestamp', 'created_at', 'closed_at'];
    _.each(timestamps, function(attribute) {
      if (_.has(action.attributes, attribute) ) {
        action.attributes = _.omit(action.attributes, attribute);
      }
    });
    return action;
  });
}

function jsonRmTimes(entity) {
  entity.timestamp = ''
  return entity;
}

describe.only('XML', function() {
  describe('#parseDoc', function() {

    it('Encodes the right number of way nodes', function() {
      var parsed = XML.parseDoc(docXml);
      (parsed.modify.way[0].nd.length).should.eql(docJson.modify.way[0].nd.length);
    });

    it('Encodes the right number of tags', function() {
      var parsed = XML.parseDoc(docXml);
      (parsed.modify.way[0].tag.length).should.eql(docJson.modify.way[0].tag.length);
    });

    it('Creates comparable nodes using Node#fromEntity', function() {
      var parsed = XML.parseDoc(docXml);
      var parsedNode = parsed.modify.node[0];
      var entity = Node.fromEntity(parsedNode);

      (jsonRmTimes(entity)).should.eql(
        jsonRmTimes(Node.fromEntity(docJson.modify.node[0])));
    });

    it('Creates comparable ways using Way#fromEntity', function() {
      var parsed = XML.parseDoc(docXml);
      var parsedWay = parsed.modify.way[0];
      var entity = Way.fromEntity(parsedWay);
      // console.log(entity)
      // console.log(parsed)
      // console.log(parsedWay)
      (jsonRmTimes (entity)).should.eql(
        jsonRmTimes(Way.fromEntity(docJson.modify.way[0])));
    });
  });

  describe('#readChanges', function() {

    // -----------
    // Simple strings
    // ------------
    function simpleChangeset(mode) {
      return function() {
        return _.chain(XML.readChanges(mock.simple[mode]))
        .pluck('action')
        .uniq().value()
        .should.be.eql([mode])
        .and.have.lengthOf(1);
      };
    }

    it('Should translate a creation changeset', simpleChangeset('create'));
    it('Should translate a modification changeset', simpleChangeset('modify'));
    it('Should translate a deletion changeset', simpleChangeset('delete'));

    // -----------
    // Exactly translated
    // -----------

    it('Should translate a single node modify', function() {
      rmTimestamps(XML.readChanges(mock.modify.xml))
      .should.be.eql(rmTimestamps(mock.modify.json));
    });

    it('Should translate a way creation', function() {
      rmTimestamps(XML.readChanges(mock.create.xml))
      .should.be.eql(rmTimestamps(mock.create.json));
    });
  });

  describe('#write', function() {
    it('Should correctly write tags to nodes', function() {
      var nodes = [{
        tags: [{ k: 1, v: 1 }]
      }];
      var xml = XML.write({ nodes: nodes }).toString();
      var doc = libxml.parseXmlString(xml);
      var tag = doc.find('//tag');
      doc.get('//tag').toString().should.eql('<tag k="1" v="1"/>');
    });
    it('Should correctly write tags to ways', function() {
      var ways = [{
        tags: [{ k: 1, v: 1 }],
        nodes: []
      }];
      var xml = XML.write({ ways: ways }).toString();
      var doc = libxml.parseXmlString(xml);
      var tag = doc.find('//tag');
      doc.get('//tag').toString().should.eql('<tag k="1" v="1"/>');
    });
  });
});
