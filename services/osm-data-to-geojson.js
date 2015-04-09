'use strict';
/* jshint camelcase: false */

var _ = require('lodash');
var ratio = require('../services/ratio.js');

/*
 * Takes the given way/waynode/node models and returns a FeatureCollection
 * of LineString features--one for each way.
 */
module.exports = function toGeoJSON(ways, waynodes, nodes, waytags) {

  // attach associated nodes to ways
  ways.forEach(function (way) {
    way.nodes = waynodes.filter(function(waynode) {
      return waynode.way_id === way.id;
    });
    way.tags = waytags.filter(function(tag) {
      return tag.way_id === way.id;
    });
  });


  var idToNode = {}; // TODO:this should be a real hashmap
  nodes.forEach(function (n) { idToNode[n.id] = n; });

  var wayFeatures = ways.map(function (way) {
    var nodeCoordinates = way.nodes.map(function (waynode) {
      var node = idToNode[waynode.node_id];
      return [node.longitude / ratio, node.latitude / ratio];
    });

    var properties = _.zipObject(way.tags.map(function (t) {
      return [t.k, t.v];
    }));

    return {
      type: 'Feature',
      properties: properties,
      geometry: {
        type: 'LineString',
        coordinates: nodeCoordinates
      }
    };
  });

  return {
    type: 'FeatureCollection',
    properties: {},
    features: wayFeatures
  };
};
