var knex = require('knex');

module.exports = {
    method: 'GET',
    path: '/changeset/{changeset_id}/upload',
    handler: function(req, res) {
        res(200);
    }
}