var libxml = require('libxmljs');
var info = require('./GeoInfo');

module.exports = {
  readChanges: function(xmlString) {
    var entities = [];
    var currEntity = {};
    var sequence_id = 0;
    var entity_id = 0;
    var lastElem;
    var mode = 'create'
    var parser = new libxml.SaxParser();
    parser.on('startElementNS', function(elem, attrs, prefix, uri, namespace) {
      if (elem === 'create' || elem === 'modify' || elem === 'destroy') {
        mode = elem;
      } 
      if (elem === 'node' || elem === 'way' || elem === 'nd' || elem === 'tag') {
        currEntity = {
          action: mode,
          model: elem,
          attributes: _.chain(attrs)
            .map(function (kvArray) { return [kvArray[0], kvArray[3]] })
            .zipObject()
            .value()
        }
      }
      if (elem === 'node' || elem === 'way') {
        lastElem = elem;
        entity_id = currEntity.attributes.id;
      }
      if (elem === 'nd') { //way_node
        currEntity.model = 'way_node';
        currEntity.attributes['node_id'] = currEntity.attributes['ref']; // rename attribute
        delete currEntity.attributes.ref;
        currEntity.attributes['way_id'] = entity_id;
        currEntity.attributes['sequence_id'] = sequence_id;
        sequence_id += 1;
      }
      if (elem === 'tag') {
        currEntity.model = lastElem + '_tag';
        currEntity.attributes[lastElem + '_id'] = entity_id;
      }
      if (_.has(currEntity, 'model')) {
        entities.push(currEntity); currEntity = {};
      }
    });
    parser.on('endElementNS', function(elem, attrs, prefix, uri, namespace) {
      if (elem === 'way') {
        sequence_id = 0;
      }
    })
    parser.parseString(xmlString);
    return entities
  },

  write: function(obj) {
    var obj = obj || {},
      nodes = obj.nodes,
      ways = obj.ways,
      bbox = obj.bbox;

    var doc = new libxml.Document();
    doc.node('osm').attr({ version: 6, generator: 'DevelopmentSeed' });
    var root = doc.root();

    if (bbox) {
      root.node('bounds').attr({
        minlat: bbox.minLat,
        minlon: bbox.minLon,
        maxlat: bbox.maxLat,
        maxlon: bbox.maxLon
      });
    }

    if (nodes) {
      for (var i = 0, ii = nodes.length; i < ii; ++i) {
        var node = nodes[i];
        root.node('node').attr({
          id: node.node_id,
          visible: node.visible,
          version: node.version,
          changeset: node.changeset_id,
          timestamp: node.timestamp,
          user: 'DevelopmentSeed',
          uid: 1,
          lat: node.latitude / info.ratio,
          lon: node.longitude / info.ratio
        });
      }
    }

    if (ways) {
      for (var i = 0, ii = ways.length; i < ii; ++i) {
        var way = ways[i];
        var wayEl = root.node('way').attr({
          id: way.way_id,
          visible: way.visible,
          version: way.version,
          changeset: way.changeset_id,
          timestamp: way.timestamp,
          user: 'DevelopmentSeed',
          uid: 1
        });

        // Use the sequence ID to make sure nodes are ordered correctly.
        var wayNodes = way.nodes;
        var orderedNodes = [];
        for (var j = 0, jj = wayNodes.length; j < jj; ++j) {
          var wayNode = wayNodes[j];
          orderedNodes[parseInt(wayNode.sequence_id, 10)] = wayNode.node_id;
        }

        // Attach a node ref for each node, as long as it exists and it's id isn't '0'.
        for(var k = 0, kk = orderedNodes.length; k < kk; ++k) {
          var wayNode = orderedNodes[k];
          if (wayNode && wayNode !== '0') {
            wayEl.node('nd').attr({ ref: wayNode });
          }
        }
      }
    }

    return doc;
  }
};
