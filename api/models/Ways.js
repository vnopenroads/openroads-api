/**
* Way.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
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

