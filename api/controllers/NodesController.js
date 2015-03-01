/**
 * NodeController
 *
 * @description :: Server-side logic for managing nodes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var lxml = require('libxmljs');

module.exports = {
  read: function(req, res) {
    var nodes = sails.models.Node.find({ id: { '<' : 100 }, limit: 10 });
    res.end(JSON.stringify(nodes));
  },
};

