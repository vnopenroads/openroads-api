'use strict';

const Boom = require('boom');
const knex = require('../connection');
const _ = require('lodash');


module.exports = [
 /**
   * @api {get} /admin/:id/projecttasks Get project tasks within an admin area.
   * @apiGroup Administrative areas
   * @apiName GetAdminProjectTasks
   * @apiDescription This endpoint returns project tasks within the given admin area.
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} ID ID of the region, province, municipality, city or
   * barangay. Use `0` for the country as a whole.
   *
   * @apiSuccess {String} name Name of admin area
   * @apiSuccess {Number} type Type of admin area
   * @apiSuccess {Number} id ID of admin area
   * @apiSuccess {Object} meta Object containting pagination metadata
   * @apiSuccess {Number} meta.page Page number of results (zero-indexed)
   * @apiSuccess {Number} meta.limit Number of results to display at a time
   * @apiSuccess {Number} meta.total Total number of results for the admin area
   * @apiSuccess {Array} results Contains all projecttasks objects
   * @apiSuccess {String} project.id Project ID
   * @apiSuccess {String} project.type Type of project, one of TRIP, TRIP Subproject, GAA FRM Access, GAA FMR, PRDP Access, PRDP, BUB, PRMF, or Kalsada
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/0/projecttasks
   *
   * @apiSuccessExample {json} projecttasks
   * {
   *   "projecttasks": {
   *     "meta": {
   *       "page": 0,
   *       "limit": 20,
   *       "total": 3388
   *     },
   *     "results": [
   *       {
   *         "id": "trip_projecttasks.13",
   *         "type": "TRIP"
   *       },
   *       {
   *         "id": "BUB.92",
   *         "type": "BUB"
   *       }
   *     ]
   *   },
   *   "name": "Philippines",
   *   "type": 0,
   *   "id": 0
   * }
   */
  {
    method: 'GET',
    path: '/admin/{id}/projecttasks',
    handler: function handler (req, res) {
      // Knex doesn't support array data types, so have to use raw SQL for the query
      // Therefore, should cast `id` to avoid SQL injection
      let id = req.params.id ? Number(req.params.id) : 0;

      let query = knex('admin_boundaries')
        .select([
          'projecttasks.*',
          'admin_boundaries.name AS adminName',
          'admin_boundaries.type AS adminType',
          'admin_boundaries.id AS adminID'
        ])
        .where('admin_boundaries.id', id)
        .orderBy('projecttasks.id')
        .leftJoin('projecttasks', knex.raw(`${id} = ANY(projecttasks.adminids)`));

      query
        .then(function (knexResult) {
          if (knexResult.length === 0) {
            // If no results were returned, the area doesn't exist
            return Boom.notFound("Area ID's boundary was not found in the database");
          }

          let meta = knexResult[0];
          let page = Number(req.query.page) || 0;
          let limit = Number(req.query.limit) || 20;
          // There are no projecttasks, but because of the join the values are still there.
          let hasProjecttasks = knexResult.length > 1 && knexResult[0].id !== null;

          let results = [];
          if (hasProjecttasks) {
            results = knexResult.map(o => _.pick(o, ['id', 'type']))
          }

          let projecttasks = {
            meta: {
              page: page,
              limit: limit,
              total: results.length
            },
            results: results.slice(limit * page, limit * (page + 1))
          };

          let response = {
            projecttasks: projecttasks,
            name: meta.adminName,
            type: meta.adminType,
            id: +meta.adminID
          };

          return response;
        })
        .then(res)
        .catch(function (err) {
          res(Boom.wrap(err));
        });
    }
  }
];
