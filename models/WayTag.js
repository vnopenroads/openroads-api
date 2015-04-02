/**
 * WayTag.js
 *
 */

module.exports = {

  tableName: 'current_way_tags',

  attributes: {
    way_id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true,
      model: 'ways'
    },
    k: {
      type: 'string',
      truthy: true
    },
    v: {
      type: 'string',
      truthy: true
    },
  },

  //Translate the entity from the XML parser into a proper model
  fromJXEntity: function(entityAttr) {
    return {
      way_id: Number(entityAttr.id),
      k: entityAttr.k,
      v: entityAttr.v,
    }
  },
};
