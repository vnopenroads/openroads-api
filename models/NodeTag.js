/**
 * NodeTag.js
 *
 */

module.exports = {
  tableName: 'current_node_tags',

  attributes: {
    node_id: {
      type: 'integer',
      primaryKey: true,
      model: 'nodes'
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
    'use strict';
    return {
      node_id: Number(entityAttr.id),
      k: entityAttr.k,
      v: entityAttr.v,
    };
  }
};
