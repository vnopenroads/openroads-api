'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});

module.exports = function getAdminBoundary(id) {
  return knex('admin_boundaries')
  .where('id', id)
  .then(function (data) {
    var boundary;
    if(data.length > 0) {
      boundary = data[0].geo;
    }
    if(!boundary) {
      throw new Error('Coule not find admin region with id '+id);
    }
    // Tack on the id because it's otherwise buried in some
    // property, with different keys for different admin levels
    // (ID_1_OR, ID_2_OR, etc.)
    boundary.id = id;
    if(boundary.properties.ID_4_OR) boundary.adminType = 4;
    else if(boundary.properties.ID_3_OR) boundary.adminType = 3;
    else if(boundary.properties.ID_2_OR) boundary.adminType = 2;
    else if(boundary.properties.ID_1_OR) boundary.adminType = 1;
    return boundary;
  });
};
