var libxml = require('libxmljs');

module.exports = {
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
      for(var i = 0, ii = nodes.length; i < ii; ++i) {
        var node = nodes[i];
        var attr = {
          id: node.node_id,
          visible: node.visible,
          version: node.version,
          changeset: node.changeset_id,
          timestamp: node.timestamp,
          user: 'DevelopmentSeed',
          uid: 1,
          lat: node.latitude,
          lon: node.longitude
        };
        root.node('node').attr(attr);
      }
    }

    return doc;
  }
};
