'use strict';

const Boom = require('boom');
const knex = require('../connection');

function serializeAdminWaytasks (knexResult, queryString) {
  let meta = knexResult[0];
  let hasTasks;

  if (knexResult.length === 0) {
    // If no results were returned, the area doesn't exist
    return Boom.notFound("Area ID's boundary was not found in the database");
  } else if (knexResult.length === 1 && !meta.id && !meta.type) {
    // If one result with no task information was returned, then the area is legitimate
    hasTasks = false;
  } else {
    hasTasks = true;
  }

  let page = Number(queryString.page) || 0;
  let limit = Number(queryString.limit) || 20;

  let results = [];
  if (hasTasks) {
    // Group tasks by way for the `results`
    let resultsByWay = {};
    knexResult.forEach(function (task) {
      if (!(task.way_id in resultsByWay)) { resultsByWay[task.way_id] = []; }
      resultsByWay[task.way_id].push({
        type: task.type,
        details: task.details
      });
    });
    Object.keys(resultsByWay).forEach(function (way_id) {
      results.push({
        way_id: Number(way_id),
        tasks: resultsByWay[way_id]
      });
    });

    // Ensure a consistent ordering
    // Can't sort earlier since `way_id` was a string instead of a number then
    results.sort(function (taskSetA, taskSetB) {
      return taskSetA.way_id - taskSetB.way_id;
    });
  }

  let tasks = {
    meta: {
      page: page,
      limit: limit,
      total: results.length
    },
    results: results.slice(limit * page, limit * (page + 1))
  };

  let response = {
    tasks: tasks,
    name: meta.adminName,
    type: meta.adminType,
    id: +meta.adminID
  };

  return response;
};

function serializeWaytasks (knexResult, way_id) {
  let tasks = [];
  knexResult.forEach(function (task) {
    tasks.push({
      type: task.type,
      details: task.details
    });
  });

  let response = {
    way_id: way_id,
    tasks: tasks
  };
  return response;
};

function handleZeroTasks (knexResult, areaID) {
  let query = knex('admin_boundaries')
    .select([
      'name AS adminName',
      'type AS adminType',
      'id AS adminID'
    ])
    .where('id', areaID);
  return query;
};

function handleAdminWaytasks (req, res) {
  // Knex doesn't support array data types, so have to use raw SQL for the query
  // Therefore, should cast `id` to avoid SQL injection
  let id = req.params.id ? Number(req.params.id) : 0;

  let query;

  query = knex('waytasks')
    .select([
      'waytasks.*',
      'admin_boundaries.name AS adminName',
      'admin_boundaries.type AS adminType',
      'admin_boundaries.id AS adminID'
    ])
    .whereRaw(`${id} = ANY(waytasks.adminids)`)
    .innerJoin('admin_boundaries', 'admin_boundaries.id', knex.raw(`${id}`));

  query
    .then(function (knexResult) {
      if (knexResult.length === 0) {
        return handleZeroTasks(knexResult, id);
      } else {
        return knexResult;
      }
    })
    .then(function (knexResult) {
      return serializeAdminWaytasks(knexResult, req.query);
    })
    .then(res)
    .catch(function (err) {
      res(Boom.wrap(err));
    });
};

function handleWaytaks (req, res) {
  let way_id = Number(req.params.way_id);
  let query = knex('waytasks')
    .select()
    .where('way_id', way_id);

  query
    .then(function (knexResult) {
      return serializeWaytasks(knexResult, way_id);
    })
    .then(res)
    .catch(err => { res(Boom.wrap(err))});
};

module.exports = [
 /**
   * @api {get} /admin/:id/waytasks Get to-fix tasks within an admin area.
   * @apiGroup Administrative areas
   * @apiName GetAdminWaytasks
   * @apiDescription This endpoint returns uncompleted tasks within the given admin area. This currently includes all roads that are missing required properties.
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
   * @apiSuccess {Array} results Contains all task objects, grouped by `way_id` of the affected road
   * @apiSuccess {String} task.type Category of the task
   * @apiSuccess {String} task.details Plain-text description of the issue that needs to be fixed
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/7150213015/waytasks
   *
   * @apiSuccessExample {json} waytasks
   * {
   *   "name": "Santo Rosario",
   *   "type": 4,
   *   "id": 7150213015,
   *   "meta": {
   *     "page": 0,
   *     "limit": 20,
   *     "total": 3
   *   },
   *   "results": [
   *     {
   *       "way_id": 5,
   *       "tasks": [
   *         {
   *           "type": "missing-prop",
   *           "details": "Some properties are missing: surface, or_condition"
   *         },
   *         {
   *           "type": "some-other-type",
   *           "details": "Details on this other issue with road 5"
   *         }
   *       ]
   *     },
   *     {
   *       "way_id": 128,
   *       "tasks": [
   *         {
   *           "type": "missing-prop",
   *           "details": "Some properties are missing: surface"
   *         }
   *       ]
   *     }
   *   ]
   * }
   */
  {
    method: 'GET',
    path: '/admin/{id}/waytasks',
    handler: function handler (req, res) {
      return handleAdminWaytasks(req, res);
    }
  },
  /**
   * @api {get} /admin/waytasks Get the to-fix tasks for the country.
   * @apiGroup Administrative areas
   * @apiName GetAdminWaytasksCountry
   * @apiDescription This endpoint returns the tasks for the country. See the 
   * documentation for `admin/:id/waytasks` for more info.
   * @apiVersion 0.1.0
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/waytasks
   *
   */
  {
    method: 'GET',
    path: '/admin/waytasks',
    handler: function handler (req, res) {
      return handleAdminWaytasks(req, res);
    }
  },
 /**
   * @api {get} /way/:way_id/waytasks Get to-fix tasks for a particular road
   * @apiGroup Features
   * @apiName GetWaytasks
   * @apiDescription This endpoint returns uncompleted tasks for a particular road.
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} way_id ID of the road
   *
   * @apiSuccess {Number} way_id ID of the road
   * @apiSuccess {Array} bounds Bounding box of the road
   * @apiSuccess {Array} tasks Contains all task objects
   * @apiSuccess {String} task.type Category of the task
   * @apiSuccess {String} task.details Plain-text description of the issue that needs to be fixed
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/waytasks/5
   *
   * @apiSuccessExample {json} waytasks
   * {
   *   "way_id": 5,
   *   "bounds": [100.0, 0.0, 105.0, 1.0],
   *   "tasks": [
   *     {
   *       "type": "missing-prop",
   *       "details": "Some properties are missing: surface, or_condition"
   *     },
   *     {
   *       "type": "some-other-type",
   *       "details": "Details on this other issue with road 5"
   *     }
   *   ]
   *   
   * }
   */
  {
    method: 'GET',
    path: '/way/{way_id}/waytasks',
    handler: function handler (req, res) {
      return handleWaytaks(req, res);
    }
  }
];
