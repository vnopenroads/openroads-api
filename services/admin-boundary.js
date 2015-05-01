'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var knex = require('../connection');

module.exports = function getAdminBoundary(id) {
  return knex('admin_boundaries')
  .where('id', id)
  .then(function (data) {
    var boundary;
    if(data.length > 0) {
      boundary = data[0].geo;
    }
    if(!boundary) {
      throw new Error('Could not find admin region with id '+id);
    }
    // Tack on the id because it's otherwise buried in some
    // property, with different keys for different admin levels
    // (ID_1_OR, ID_2_OR, etc.)
    boundary.id = id;
    // Same with name and admin type
    boundary.adminType = data[0].type;
    boundary.name = data[0].name;
    return boundary;
  });
};
