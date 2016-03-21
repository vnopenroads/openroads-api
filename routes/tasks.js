'use strict';

const Boom = require('boom');
const knex = require('../connection');

function serializeTasks(knexResult, queryString) {
  let meta = knexResult[0];
  let hasTasks;

  if (knexResult.length === 0) {
    // If no results were returned, the area doesn't exist
    return Boom.notFound("Area's ID was not found in the `admin_boundaries` database");
  } else if (knexResult.length === 1 && !meta.id && !meta.type) {
    // If one result with no task information was returned, then the area is legitimate
    hasTasks = false;
  } else {
    hasTasks = true;
  }

  let page = Number(queryString.page) || 0;
  let limit = Number(queryString.limit) || 20;

  let tasks = {
    meta: {
      page: page,
      limit: limit,
      total: hasTasks ? knexResult.length : 0
    },
    results: []
  };
  if (hasTasks) {
    knexResult.slice(
      limit * page,
      limit * (page + 1)
    ).forEach(function (task) {
      tasks.results.push({
        id: Number(task.id),
        type: task.type,
        details: task.details
      });
    });
  }

  let response = {
    tasks: tasks
  };
  if (!meta.adminID) {
    response.name = 'Philippines';
    response.type = 0;
    response.id = 0;
  } else {
    response.name = meta.adminName;
    response.type = meta.adminType;
    response.id = meta.adminID;
  }

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

function handleAdminTasks (req, res) {
  // Knex doesn't support array data types, so have to use raw SQL for the query
  // Therefore, should cast `id` to avoid SQL injection
  let id = Number(req.params.id);

  let query;
  if (id === 0) {
    // National level doesn't have 
    query = knex('admin_tasks')
      .select()
      .where(knex.raw(`${id} = ANY(admin_tasks.adminids)`));
  }
  else {
    query = knex('admin_tasks')
      .select([
        'admin_tasks.*',
        'admin_boundaries.name AS adminName',
        'admin_boundaries.type AS adminType',
        'admin_boundaries.id AS adminID'
      ])
      .whereRaw(`${id} = ANY(admin_tasks.adminids)`)
      .innerJoin('admin_boundaries', 'admin_boundaries.id', knex.raw(`${id}`));
  }

  query
  .then(function (knexResult) {
    if (knexResult.length === 0) {
      return handleZeroTasks(knexResult, id);
    } else {
      return knexResult;
    }
  })
  .then(function (knexResult) {
    return serializeTasks(knexResult, req.query);
  })
  .then(res)
  .catch(function (err) {
    res(Boom.wrap(err));
  });
};

module.exports = [
  /**
   * @api {get} /admin/:id/tasks Get to-fix tasks within an admin area.
   * @apiGroup Administrative areas
   * @apiName GetAdminTasks
   * @apiDescription This endpoint returns uncompleted taks within the given admin area. This currently includes all roads that are missing required properties.
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} ID ID of the region, province, municipality, city or
   * barangay. Use `0` for the country as a whole.
   *
   * @apiSuccess {Object} tasks Object containing all tasks, and metadata
   * @apiSuccess {Object} tasks.meta Object containting pagination metadata
   * @apiSuccess {Number} tasks.meta.page Page number of results (zero-indexed)
   * @apiSuccess {Number} tasks.meta.limit Number of results to display at a time
   * @apiSuccess {Number} tasks.meta.total Total number of results for the admin area
   * @apiSuccess {Array} tasks.results Array of all task objects
   * @apiSuccess {Number} task.id ID of road that has an assigned task
   * @apiSuccess {String} task.type Category of the task
   * @apiSuccess {String} task.details Plain-text description of the issue that needs to be fixed
   * @apiSuccess {String} name Name of admin area
   * @apiSuccess {Number} type Type of admin area
   * @apiSuccess {Number} id ID of admin area
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/7150213015/tasks
   *
   * @apiSuccessExample {json} tasks
   * {
   *   "tasks": [
   *     {
   *       "id": 38,
   *       "type": "missing-prop",
   *       "details": "Some properties are missing: surface, or_condition"
   *     }
   *   ],
   *   "name": "Santo Rosario",
   *   "type": 4,
   *   "id": 7150213015
   * }
   */
  {
    method: 'GET',
    path: '/admin/{id}/tasks',
    handler: function handler (req, res) {
      return handleAdminTasks(req, res);
    }
  }
];
