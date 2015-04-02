var _ = require('lodash')
var Boom = require('boom')
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection'),
  debug: true
});
var Promise = require('bluebird');
var XML = require('../services/XML');



module.exports = {
    method: 'POST',
    path: '/changeset/{changeset_id}/upload',
    handler: function(req, res) {
        var changesetID = req.params.changeset_id;
        if (!changesetID || isNaN(changesetID)) {
            res(Boom.badRequest('Changeset ID must be a non-zero number'));
        }

        // Look for changeset in database

        // If it exists
        var actions = XML.readChanges(req.payload.xmlString);
        console.log(actions);
        res(200)
    }
}