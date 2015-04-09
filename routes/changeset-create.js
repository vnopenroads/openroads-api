'use strict';

var Boom = require('boom');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});

module.exports = {
  method: 'PUT',
  path: '/changeset/create',
  handler: function changesetCreate(req, res) {
    var now = new Date();
    var uid = req.payload.uid;
    var userName = req.payload.user;

    if (!uid || !userName) {
      return res(Boom.badRequest('A new changeset must include a user id and a username.'));
    }

    knex('users')
    .where('id', uid)
    .then(function (users) {
      if(users.length > 0)
        return uid;

      return knex('users')
      .insert({
        id: uid,
        display_name: userName,
        // TODO: we aren't using the following fields; they're just here to
        // cooperate w the database schema.
        email: uid + '@openroads.org',
        pass_crypt: '00000000000000000000000000000000',
        data_public: true,
        creation_time: new Date()
      });

    })
    .then(function () {
      return knex('changesets')
      .returning('id')
      .insert({
        user_id: uid,
        created_at: now,
        closed_at: now,
        num_changes: 0
      })
      .then(function (ids) {
        if(ids.length < 1) {
          throw new Error('Could not add changeset to database.');
        }

        return res({id: ids[0]});
      });
    })
    .catch(function (err) {
      console.log(err);
      return res(Boom.wrap(err));
    });
  } // request handler
};
