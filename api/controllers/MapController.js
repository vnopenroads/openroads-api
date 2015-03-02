var lxml = require('libxmljs');

module.exports = {
  bbox: function(req, res) {
    var bbox = BoundingBox.fromString(req.query.bbox);
    return res.json(bbox.toArray());
  }
};
