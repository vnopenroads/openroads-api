/**
* Way.js
*
* @description :: Represents ways, or roads.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_ways
*
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    way_id: {
        type: 'integer',
        primaryKey: true,
        autoIncrement: true
    },
    changeset_id: {
        type: 'integer'
    },
    timestamp: {
        type: 'datetime'
    },
    visible: {
        type: 'boolean'
    },
    version: {
        type: 'integer'
    }
  }
};

