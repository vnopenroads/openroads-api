'use strict';
const Boom = require('boom');
const knex = require('../connection');
const _ = require('lodash');


module.exports = [
 /**
   * @api {get} /admin/:id/projects Get projects within an admin area.
   * @apiGroup Administrative areas
   * @apiName GetAdminProjects
   * @apiDescription This endpoint returns projects within the given admin area.
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
   * @apiSuccess {Array} results Contains all projects objects
   * @apiSuccess {String} project.id Project ID
   * @apiSuccess {String} project.code Project code, available for some types of projects
   * @apiSuccess {String} project.type Type of project, one of TRIP, TRIP Subproject, GAA FRM Access, GAA FMR, PRDP Access, PRDP, BUB, PRMF, or Kalsada
   * @apiSuccess {String} project.name Name of project
   * @apiSuccess {String} project.scope Scope of project
   * @apiSuccess {Number} project.year Year of project
   * @apiSuccess {Number} project.length Length of road in kilometers, if geometry available
   * @apiSuccess {Number} project.cost Cost of project
   * @apiSuccess {Array} project.bbox Bounding box of project, in decimal degrees
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/13000000000/projects
   *
   * @apiSuccessExample {json} projects
   * {
   *   "projects": {
   *     "meta": {
   *       "page": 0,
   *       "limit": 20,
   *       "total": 47
   *     },
   *     "results": [
   *       {
   *         "id": "trip_projects.13",
   *         "code": "2013-IVB-01",
   *         "type": "TRIP",
   *         "name": "Bacungan-Talaudyong Road, Puerto Princesa City, Palawan",
   *         "scope": "Upgrading (Gravel to Concrete)",
   *         "year": 2012,
   *         "length": 16,
   *         "cost": 413100
   *         "bbox": [122.7859008,14.280860769999997,122.7859008,14.280860769999997]
   *       },
   *       {
   *         "id": "BUB.92",
   *         "code": "73846",
   *         "type": "BUB",
   *         "name": "Concreting of brgy Road, Sitio Landing",
   *         "scope": "Transport",
   *         "year": 2014,
   *         "length": 0,
   *         "cost": null,
   *         "bbox": [122.7859008, 14.280860769999997, 122.7859008, 14.280860769999997]
   *       }
   *     ]
   *   },
   *   "name": "Region IV-B (Mimaropa)",
   *   "type": 1,
   *   "id": 13000000000
   * }
   */
  {
    method: 'GET',
    path: '/admin/{id}/projects',
    handler: function handler (req, res) {
      // Knex doesn't support array data types, so have to use raw SQL for the query
      // Therefore, should cast `id` to avoid SQL injection
      let id = req.params.id ? Number(req.params.id) : 0;

      let query = knex('admin_boundaries')
        .select([
          'projects.*',
          'admin_boundaries.name AS adminName',
          'admin_boundaries.type AS adminType',
          'admin_boundaries.id AS adminID'
        ])
        .where('admin_boundaries.id', id)
        .orderBy('projects.id')
        .leftJoin('projects', knex.raw(`${id} = ANY(projects.adminids)`));

      query
        .then(function (knexResult) {
          if (knexResult.length === 0) {
            // If no results were returned, the area doesn't exist
            return Boom.notFound("Area ID's boundary was not found in the database");
          }

          let meta = knexResult[0];
          let page = Number(req.query.page) || 0;
          let limit = Number(req.query.limit) || 20;
          // There are no projects, but because of the join the values are still there.
          let hasProjects = knexResult.length > 1 && knexResult[0].id !== null;

          let results = [];
          if (hasProjects) {
            results = knexResult.map(o => _.pick(o, ['id', 'code', 'type', 'name', 'scope', 'year', 'length', 'cost', 'bbox']))
          }

          let projects = {
            meta: {
              page: page,
              limit: limit,
              total: results.length
            },
            results: results.slice(limit * page, limit * (page + 1))
          };

          let response = {
            projects: projects,
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
