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
    var measureClass = result.measure.split('-');
    var measure = measureClass[0];
    var category = measureClass[1];
    var subCategory = measureClass[2];

    if (!(category in stat)) {
      stat[category] = {}
    }

    if (!(subCategory in stat[category])) {
      stat[category][subCategory] = {}
    }
    stat[category][subCategory][measure] = value;
  });

  if (meta.id !== '0') {
    return {'stats': stat, 'name': meta.name, 'type': meta.type};
  } else {
    // Processing national
    return {'stats': stat, 'name': 'National', 'type': 0}
  }
}

function handleNationalStats (req, res) {
  return knex.table('admin_stats')
  .where('id', '0')
  .select()
  .then(serializeStats)
  .then(res);
}

function handleAdminStats (req, res) {
  var id = req.params.id;
  return knex('admin_stats')
  .join('admin_boundaries', 'admin_stats.id', 'admin_boundaries.id')
  .select()
  .where('admin_stats.id', id)
  .then(serializeStats)
  .then(res)
  .catch(function (err) {
    console.log(err);
  })
}


module.exports = [
  {
    method: 'GET',
    path: '/admin/{id}/stats',
    handler: function handler (req, res) {
      var id = req.params.id;
      if (id == 0) {
        return handleNationalStats(req, res);
      } else {
        return handleAdminStats(req, res);
      }
    }
  },
  {
    method: 'GET',
    path: '/admin/stats',
    handler: handleNationalStats
  }
]