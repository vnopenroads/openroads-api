'use strict';
/**
* Nodes.js
*
* @description :: Represents nodes.
* Schema: http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
*
*/
var RATIO = require('../services/Ratio');
var QuadTile = require('../services/QuadTile');
var knex = require('knex')({ 
    client: 'pg', 
    connection: require('../connection'),
    debug: false
  });
var _ = require('lodash');


module.exports = {

  tableName: 'current_nodes',

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
      index: true
    },
    latitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    longitude: {
      type: 'integer',
      required: true,
      numeric: true,
      truthy: true
    },
    changeset_id: {
      type: 'integer',
      numeric: true,
      model: 'changesets'
    },
    visible: {
      type: 'boolean',
      boolean: true
    },
    timestamp: {
      type: 'datetime',
      datetime: true
    },
    tile: {
      type: 'integer',
      index: true,
      numeric: true,
      required: true
    },
    version: {
      type: 'integer',
      numeric: true,
      required: true
    },
  },

  //Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entity) {
    var lat = parseFloat(entity.lat);
    var lon = parseFloat(entity.lon);

    var model = {
      latitude: lat * RATIO | 0,
      longitude: lon * RATIO | 0,
      tile: QuadTile.xy2tile(QuadTile.lon2x(lon), QuadTile.lat2y(lat)),
      changeset_id: parseInt(entity.changeset, 10),
      visible: (entity.visible !== 'false' && entity.visible !== false),
      version: parseInt(entity.version, 10) || 1,
      timestamp: new Date()
    };
    return model;
  },

  canBeDeleted: function(nodeId) {
    // No need to call parseInt on node_id, as that's already handled upstream.
    return knex('current_way_nodes')
    .where('node_id', nodeId)
    .then(function wayNodeResp(wayNodes) {
      // If this node belongs to a way, check to see if
      // any of those ways are visible, aka not deleted yet.
      // Return false if this node is still part of an existing way.
      if (wayNodes) {
        return knex('current_ways').whereIn('id',_.pluck(wayNodes, 'way_id'))
        .then(function(ways) {
          var visible = _.chain(ways)
          .pluck('visible')
          .reduce(function(curr, val) { return curr && val; }, true)
          .value();
          return visible;
        });
      } else {
        return true;
      }
    })
    .catch(function(err) {
      throw new Error(err);
    });
  },

  // Attach a list of tags to a list of entities
  // by creating a mapping of entities by their id.
  withTags: function(entities, tags, accessor) {
    if (!tags.length) {
      return entities;
    }
    var map = {};
    for(var i = 0, ii = entities.length; i < ii; ++i) {
      var entity = entities[i];
      map[entity.id] = entity;
    }
    for(i = 0, ii = tags.length; i < ii; ++i) {
      var tag = tags[i];
      var entity = map[tag[accessor]];
      if (entity) {
        if (entity.tags === undefined) {
          entity.tags = [];
        }
        entity.tags.push(tag);
      }
    }
    return entities;
  }

};