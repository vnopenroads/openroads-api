/**
* Node.js
*
* @description :: Represents nodes.
* For schema, see: http://chrisnatali.github.io/osm_notes/osm_schema.html#current_nodes
*
*
*
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      autoIncrement: true,
      unique: true,
      primaryKey: true,
    },
    latitude: 'float'
    longitude: 'float',
    changeset_id: 'integer',
    visible: {
      type: 'boolean',
    },
    timestamp: {
      type: 'datetime',
    },

    // OSM uses tile # to narrow down bbox queries.
    // No plans to implement that at the moment, since we have far fewer nodes.
    // TODO make sure this doesn't bog down for our db size.
    tile: {
      type: 'integer',
      unique: true,
    },
    version: {
      type: 'integer',
    },

    // Foreign keys
    changeset_id_fkey: {
      model: 'changeset'
    },
  }
};

