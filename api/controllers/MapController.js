var libxml = require('libxmljs');
var _ = require('lodash');

module.exports = {
  bbox: function(req, res) {

    // Creates a new bounding box object.
    // See api/services/BoundingBox.js.
    var bbox = BoundingBox.fromString(req.query.bbox);
    if (bbox.error) {
      return res.badRequest(bbox.error);
    }

    // Calculate the tiles within this bounding box.
    // See api/services/QuadTile.js.
    var tiles = _.map(QuadTile.tilesForArea(bbox), function(tile) {
      return '' + tile;
    });

    // Query the node table for nodes with this tile.
    Nodes.find({ tile: tiles }).exec(function nodeResp(err, nodes) {

      if (err) {
        return res.badRequest(err);
      }

      // If no nodes are found, just return an empty XML document.
      else if (!nodes.length) {
        res.set('Content-Type', 'text/xml');
        return res.send('<osm version="6" generator="DevelopmentSeed"></osm>');
      }

      else {

        // Create a list of node ID's.
        var nodeIDs = _.map(nodes, function(node) { return node.node_id; });

        // Query the way_nodes endpoint, returning every wayNode containing our nodes.
        Way_Nodes.find({ node_id: nodeIDs }).exec(function wayNodeResp(err, wayNodes) {

          // Create a list of way ID's.
          var wayIDs = _.map(wayNodes, function(wayNode) { return wayNode.way_id; });

          // Query the ways endpoint with a unique list of way ID's.
          ways = Ways.find({ way_id: _.uniq(wayIDs) }).exec(function wayResp(err, ways) {

            // For each way, attach every node it contains using the wayNodes server response.
            for (var j = 0, jj = ways.length; j < jj; ++j) {
              var way = ways[j];
              var nodesInWay = [];
              for (var i = 0, ii = wayNodes.length; i < ii; ++i) {
                var wayNode = wayNodes[i];
                if (wayNode.way_id === way.way_id) {
                  nodesInWay.push(wayNode);
                }
              }
              way.nodes = nodesInWay;
            }

            res.set('Content-Type', 'text/xml');
            var xmlDoc = XML.write({bbox: bbox, nodes: nodes, ways: ways});
            return res.send(xmlDoc.toString());
          });
        });

      }

    });
  }
};
