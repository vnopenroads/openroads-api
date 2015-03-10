/**
 * WaysController
 *
 * @description :: Server-side logic for managing ways
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  full: function(req, res) {
    var wayId = req.param('way_id');

    // ill-formed way id
    if (!wayId || isNaN(wayId)) {
      return res.badRequest('Way ID must be a non-zero number');
    }

    // Query both the way and it's associated nodes
    async.parallel({
      ways: function(cb) {
        Ways.find({ way_id: wayId }).exec(cb);
      },
      wayNodes: function(cb) {
        Way_Nodes.find({ way_id: wayId }).exec(cb);
      }
    }, function wayResp(err, resp) {
      var ways = resp.ways.length ? Ways.attachNodeIDs(resp.ways, resp.wayNodes) : [{}];
      var nodeIDs = _(resp.wayNodes).pluck('node_id').uniq().value();

      // If the way is not found, or isn't visible
      if (!ways[0].visible) {
        res.set('Content-Type', 'text/xml');
        return res.send('<osm version="' + Api.version + '" generator="'
                        + Api.generator + '"></osm>');
      }

      // All ways must have nodes, so don't bother checking wayNodes.length
      Nodes.find({ node_id: nodeIDs }).exec(function nodeResp(err, nodes) {
        var xmlDoc = XML.write ({ nodes: nodes, ways: ways });
        res.set('Content-Type', 'text/xml');
        return res.send(xmlDoc.toString());
      });
    });
  },
};

