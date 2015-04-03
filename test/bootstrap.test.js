require('should');
server = require('../');

server.register(require('inject-then'), function (err) {
  'use strict';
  if (err) throw err;
});


after(function (done) {
  'use strict';
  var knex = require('knex')({ 
    client: 'pg', 
    connection: require('../connection'),
    debug: false
  });
  knex.transaction(function(transaction) {
    var nodeIds = knex.select('id').from('current_nodes')
                      .where('changeset_id', 1);
    var wayIds = knex.select('id').from('current_ways')
                     .where('changeset_id', 1);
    return transaction('current_way_nodes')
    .whereIn('node_id', nodeIds).del()
    .then(function() { return transaction('current_way_tags').whereIn('way_id', wayIds).del(); })
    .then(function() { return transaction('current_node_tags').whereIn('node_id', nodeIds).del(); })
    .then(function() { return transaction('current_ways').where('changeset_id', 1).del(); } )
    .then(function() { return transaction('current_nodes').where('changeset_id', 1).del(); } );
  })
  .then(function() {
    console.log('Cleaned up tests');
    return done();
  })
  .catch(function(err) {
    return done(err);
  });
});