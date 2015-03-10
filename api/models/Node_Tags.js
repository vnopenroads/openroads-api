/**
* Node_tags.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    node_id: {
        type: 'integer',
        primaryKey: true
    },
    k: {
        type: 'string'
    },
    v: {
        type: 'string'
    }
    version: {
        type: 'integer'
    }

  }
};

