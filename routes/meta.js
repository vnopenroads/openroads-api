'use strict';
const Boom = require('boom');
const knex = require('../connection');

module.exports = [
 /**
  * @api {get} /meta/projects/types Get all project types in the database.
   * @apiGroup Meta
   * @apiName GetProjectTypes
   * @apiDescription This endpoint returns a unique list of project types.
   * @apiVersion 0.1.0
   *
   * @apiSuccess {Object} types Types of projects
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/meta/projects/types
   *
   * @apiSuccessExample {json} types
   * {
   *   "types": ["BUB", "TRIP", "TRIP Subproject"]
   * }
   */
  {
    method: 'GET',
    path: '/meta/projects/types',
    handler: function handler (req, res) {
      knex('projects')
      .distinct('type')
      .select()
      .then(function (types) {
        return res({
          types: types.map(d => d.type)
        });
      })
      .catch(function (err) {
        return res(Boom.wrap(err));
      });
    }
}];
