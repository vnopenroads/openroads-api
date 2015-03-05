/**
* Nodes.js
*
* @description :: Represents nodes.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
*
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    node_id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
    },
    latitude: {
      type: 'integer'
    },
    longitude: {
      type: 'integer'
    },
    changeset_id: {
      type: 'integer'
    },
    visible: {
      type: 'boolean',
    },
    timestamp: {
      type: 'datetime',
    },
    tile: {
      type: 'integer',
      index: true
    },
    version: {
      type: 'integer',
    },

    // Foreign keys
    //changeset_id_fkey: {
      //model: 'changeset'
    //},
  }
};

