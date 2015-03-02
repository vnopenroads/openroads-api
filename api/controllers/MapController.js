var libxml = require('libxmljs');
var _ = require('lodash');

module.exports = {
  bbox: function(req, res) {
    var bbox = BoundingBox.fromString(req.query.bbox);
    if (bbox.error) {
      return res.badRequest(bbox.error);
    }

    var tiles = _.map(QuadTile.tilesForArea(bbox), function(tile) {
      return '' + tile;
    });

    Nodes.find({ tile: tiles }).exec(function nodeResp(err, nodes) {
      if (err) {
        return res.badRequest(err);
      }
      else if (!nodes.length) {
        res.set('Content-Type', 'text/xml');
        return res.send('<osm version="6" generator="DevelopmentSeed"></osm>');
      }
      res.set('Content-Type', 'text/xml');
      var xmlDoc = XML.write({bbox: bbox, nodes: nodes});
      return res.send(xmlDoc.toString());
    });
  }
};
