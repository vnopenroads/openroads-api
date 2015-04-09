'use strict';
var libxml = require('libxmljs');
var _ = require('lodash');
var XML = require('../../services/xml.js');

var jsonChangeset = require('./fixtures/xml-read.js').osmChange;
var xmlChangeset = require('./fixtures/xml-read.xml');

var Node = require('../../models/node-model.js');
var Way = require('../../models/way.js');

function jsonRmTimes(entity) {
  entity.timestamp = ''
  return entity;
}

describe('XML', function() {
  describe('#read', function() {

    it('Encodes the right number of way nodes', function() {
      var parsed = XML.read(xmlChangeset);
      (parsed.modify.way[0].nd.length).should.eql(jsonChangeset.modify.way[0].nd.length);
    });

    it('Encodes the right number of tags', function() {
      var parsed = XML.read(xmlChangeset);
      (parsed.modify.way[0].tag.length).should.eql(jsonChangeset.modify.way[0].tag.length);
    });

    it('Creates comparable nodes using Node#fromEntity', function() {
      var parsed = XML.read(xmlChangeset);
      var parsedNode = parsed.modify.node[0];
      var entity = Node.fromEntity(parsedNode);

      (jsonRmTimes(entity)).should.eql(
        jsonRmTimes(Node.fromEntity(jsonChangeset.modify.node[0])));
    });

    it('Creates comparable ways using Way#fromEntity', function() {
      var parsed = XML.read(xmlChangeset);
      var parsedWay = parsed.modify.way[0];
      var entity = Way.fromEntity(parsedWay);
      (jsonRmTimes (entity)).should.eql(
        jsonRmTimes(Way.fromEntity(jsonChangeset.modify.way[0])));
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
