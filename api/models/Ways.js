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
        type: 'integer',
        model: 'changesets'
    },
    timestamp: {
        type: 'datetime'
    },
    visible: {
        type: 'boolean'
    },
    version: {
        type: 'integer'
    },

    //Foreign Keys
    ways_changeset_id_fkey: {
        model: 'changesets'
    }
  },

  //Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entityAttr) {
    return {
      way_id: Number(entityAttr.id),
      changeset_id: Number(entityAttr.changeset),
      timestamp: new Date(),
      version: entityAttr.version || 0,
      visible: (typeof entityAttr.visible === 'undefined') || (entityAttr.visible === 'true')
    }
  }
};

