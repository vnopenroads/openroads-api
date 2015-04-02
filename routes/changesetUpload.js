var knex = require('knex');
var XML = require('../services/XML');


module.exports = {
    method: 'POST',
    path: '/changeset/{changeset_id}/upload',
    handler: function(req, res) {
        res(200);
    }
}