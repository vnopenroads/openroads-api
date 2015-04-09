'use strict';
var libxml = require('libxmljs');
var _ = require('lodash');
var mock = require('./helpers/xml.readChanges.js');
var XML = require('../../services/xml.js');

var log = require('../../services/log.js');
var docJson = require('./helpers/changesets.js').json.json.osmChange;
var docXml = require('./helpers/changesets.js').json.xml;

var Node = require('../../models/node-model.js');
var Way = require('../../models/way.js');

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

describe('XML', function() {
  describe('#read', function() {

    it('Encodes the right number of way nodes', function() {
      var parsed = XML.read(docXml);
      (parsed.modify.way[0].nd.length).should.eql(docJson.modify.way[0].nd.length);
    });

    it('Encodes the right number of tags', function() {
      var parsed = XML.read(docXml);
      (parsed.modify.way[0].tag.length).should.eql(docJson.modify.way[0].tag.length);
    });

    it('Creates comparable nodes using Node#fromEntity', function() {
      var parsed = XML.read(docXml);
      var parsedNode = parsed.modify.node[0];
      var entity = Node.fromEntity(parsedNode);
      (entity).should.eql(Node.fromEntity(docJson.modify.node[0]));
    });

    it('Creates comparable ways using Way#fromEntity', function() {
      var parsed = XML.read(docXml);
      var parsedWay = parsed.modify.way[0];
      var entity = Way.fromEntity(parsedWay);
      (entity).should.eql(Way.fromEntity(docJson.modify.way[0]));
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
