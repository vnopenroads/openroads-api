'use strict';

var Boom = require('boom');
var getAdminBoundary = require('../services/admin-boundary.js');
var queryPolygon = require('../services/query-polygon.js');

// GET /admin/type/id
// type is `municipality`, etc.
// id is `ID_0:ID_1:ID_2`
module.exports = {
  method: 'GET',
  path: '/admin/{type}/{id}',
  handler: function (req, res) {
    
    if('municipality' !== req.params.type) {
      return res(Boom.badRequest('Admin type "' +
        req.params.type + '" not supported.'));
    }
    var ids = (req.params.id || '').split(':').map(Number);

    getAdminBoundary(req.params.type, ids)
    .then(queryPolygon)
    .then(res)
    .catch(function (err) {
      res(Boom.wrap(err));
    });
  }
};
