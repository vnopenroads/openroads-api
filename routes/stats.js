var Boom = require('boom');
var knex = require('../connection');

module.exports = [
  {
    method: 'GET',
    path: '/admin/{id}/stats',
    handler: function (req, res) {
      var id = req.params.id;
      knex.select('admin_stats')
      .where('id', id)
      .andWhere('measure', 'length')
      .then(res);
    }
  },
  {
    method: 'GET',
    path: '/admin/stats',
    handler: function (req, res) {
      knex.select(knex.raw('SUM(measure) as length'))
      .where('measure', 'length')
      .then(res);
    }
  }
]