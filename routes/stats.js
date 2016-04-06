var Boom = require('boom');
var knex = require('../connection');

// knexResult is an array of measures
// for a single admin id
function serializeStats(knexResult) {
  if (knexResult.length === 0) {
    return Boom.notFound();
  }
  var meta = knexResult[0];
  var stat = {};

  knexResult.forEach(function (result) {
    var value = result.value;

    // Measure is in the format measure-category-subcategory
    // Except in some cases, such as totals (measure-total)
    var measureClass = result.measure.split('-');
    var measure = measureClass[0];
    var category = measureClass[1];
    var subCategory = measureClass[2];

    if (!(category in stat)) { stat[category] = {}; }
    if (typeof subCategory === 'undefined') {
      stat[category][measure] = value;
    } else {
      if (!(subCategory in stat[category])) { stat[category][subCategory] = {}; }
      stat[category][subCategory][measure] = value;
    }
  });

  return {
    stats: stat,
    name: meta.name,
    type: meta.type,
    id: meta.id
  };
}

function handleNationalStats (req, res) {
  return res.redirect('/admin/0/stats');
}

function handleAdminStats (req, res) {
  var id = req.params.id;
  var query = knex('admin_stats')
    .select()
    .where('admin_stats.id', id)
    .join('admin_boundaries', 'admin_stats.id', 'admin_boundaries.id');

  query
  .then(serializeStats)
  .then(res)
  .catch(function (err) {
    res(Boom.wrap(err));
  });
}


module.exports = [
  /**
   * @api {get} /admin/:id/stats Get stats about an admin area.
   * @apiGroup Administrative areas
   * @apiName GetAdminStats
   * @apiDescription This endpoint returns stats about the given admin area. Stats are grouped by surface, road condition, and road responsibility.
   * @apiVersion 0.1.0
   *
   * @apiParam {Number} ID ID of the region, province, municipality, city or
   * barangay.
   *
   * @apiSuccess {Object} stats Stats object
   * @apiSuccess {Object} stats.totalLength totalLength Stats object.
   * @apiSuccess {Number} stats.totalLength.length total length of roads in area.
   * @apiSuccess {Object} stats.group Contains stats grouped by `group`
   * @apiSuccess {Object} stats.group.type Contains stats for that group type (e.g: 'poor' for road condition group)
   * @apiSuccess {Number} stats.group.type.metric total `metric` for all roads of that type in administrative areas
   * @apiSuccess {String} name Name of admin area
   * @apiSuccess {Number} type Type of admin area
   * @apiSuccess {String} id ID of admin area
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/13591204000/stats
   *
   * @apiSuccessExample {json} stats
   * {
   *   "stats": {
   *     "totalLength": {
   *       "length": 128.37
   *     },
   *   "surface": {
   *     "roadTypeUndefined": {
   *       "length": 128.37
   *     }
   *   },
   *   "or_condition": {
   *     "roadTypeUndefined": {
   *       "length": 128.37
   *     }
   *   },
   *   "or_responsibility": {
   *      "roadTypeUndefined": {
   *        "length": 25.2738
   *      },
   *      "barangay": {
   *        "length": 25.1974
   *      },
   *      "provincial": {
   *        "length": 15.0454
   *      },
   *      "private": {
   *        "length": 29.0484
   *      },
   *      "municipal": {
   *        "length": 5.33835
   *      },"national": {
   *        "length": 28.4666
   *      }
   *     }
   *   },
   *   "name": "Batangas",
   *   "type": 2,
   *   "id": "4120000000"
   * }
   */
  {
    method: 'GET',
    path: '/admin/{id}/stats',
    handler: function handler (req, res) {
      var id = req.params.id;
      return handleAdminStats(req, res);
    }
  },
  /**
   * @api {get} /admin/stats Get stats for the country.
   * @apiGroup Administrative areas
   * @apiName GetAdminStatsCountry
   * @apiDescription This endpoint returns stats for the country. It redirects to `/admin/0/stats`, view the documentation for GetAdminStats to see the response format. 
   * admin area.
   * @apiVersion 0.1.0
   *
   * @apiExample {curl} Example Usage:
   *    curl http://localhost:4000/admin/stats
   *
   */
  {
    method: 'GET',
    path: '/admin/stats',
    handler: handleNationalStats
  }
]
