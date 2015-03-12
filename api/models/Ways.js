/**
* Way.js
*
* @description :: Represents ways, or roads.
* Schema : : http://chrisnatali.github.io/osm_notes/osm_schema.html#current_ways
*
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'current_ways',

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
      autoIncrement: true,
      index: true
    },
    changeset_id: {
      type: 'integer',
      model: 'changesets'
    },
    timestamp: {
      type: 'datetime',
      index: true
    },
    visible: {
      type: 'boolean'
    },
    version: {
      type: 'integer'
    },
  },


  //Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entity, create) {
    var model = {
      changeset_id: parseInt(entity.changeset, 10),
      timestamp: new Date(),
      version: parseInt(entity.version, 10) || 0,
      visible: (entity.visible !== 'false' && entity.visible !== false),
    };

    // Don't include an id if we're trying to create a new way.
    if (!create && entity.id) {
      model.id = parseInt(entity.id, 10)
    }
    return model;
  },

  configureIDs: function(id) {
    console.log(id);
  },
};

