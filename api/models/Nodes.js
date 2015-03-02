/**
* Node.js
*
* @description :: Represents nodes.
* For schema, see: http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
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
    latitude: 'float',
    longitude: 'float',
    changeset_id: 'integer',
    visible: {
      type: 'boolean',
    },
    timestamp: {
      type: 'datetime',
    },

    // OSM uses tile # to narrow down bbox queries.
    // Since we have far fewer nodes,
    // assume we can just do bbox queries on the entire node table.
    // TODO make sure this doesn't bog down for record size.
    // TODO do we need to include this?
    tile: {
      type: 'integer',
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

