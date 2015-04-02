require('should');
server = require('../');

server.register(require('inject-then'), function (err) {
  if (err) throw err;
});

