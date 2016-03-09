var Boom = require('boom');
var knex = require('../connection');

// knexResult is an array of measures
// for a single admin id
function serializeStats(knexResult) {
  var stat = {
    'stats': {
      'or_condition': {},
      'or_rdclass': {},
      'surface': {}
    }
  };

  knexResult.forEach(function (result) {
    var value = result.value;

    // Measure is in the format measure-category-subcategory
    var measureClass = result.measure.split('-');
    var measure = measureClass[0];
    var category = measureClass[1];
    var subCategory = measureClass[2];

    result[category][subCategory][measure] = value;
  });

  return stat;
}

module.exports = [
  {
    method: 'GET',
    path: '/admin/{id}/stats',
    handler: function (req, res) {
      var id = req.params.id;
      knex.select('admin_stats')
      .join('admin_boundaries', 'admin_stats.id', 'admin_boundaries.id')
      .where('id', id)
      .then(seralizeStats)
      .then(res)
    }
  },
  {
    method: 'GET',
    path: '/admin/stats',
    handler: function (req, res) {
      knex.select('admin_stats')
      .join('admin_boundaries', 'admin_stats.id', 'admin_boundaries.id')
      .where('id', '0')
      .then(serializeStats)
      .then(res);
    }
  }
]