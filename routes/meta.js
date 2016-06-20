'use strict';
const Boom = require('boom');
const knex = require('../connection');

module.exports = [
 /**
  * @api {get} /meta/projects Get all project meta information.
   * @apiGroup Meta
   * @apiName GetProjectMeta
   * @apiDescription This endpoint returns a list of project meta information.
   * @apiVersion 0.1.0
   *
   * @apiSuccess {Object} type Types of projects
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/meta/projects
   *
   * @apiSuccessExample {json}
   * {
   *   "type": ["BUB", "TRIP", "TRIP Subproject"]
   * }
   */
  {
    method: 'GET',
    path: '/meta/projects',
    handler: function handler (req, res) {
      knex('projects')
      .distinct('type')
      .select()
      .then(function (types) {
        return res({
          type: types.map(d => d.type)
        });
      })
      .catch(function (err) {
        return res(Boom.wrap(err));
      });
    }
}];
