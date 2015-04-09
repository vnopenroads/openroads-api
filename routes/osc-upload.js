'use strict';
var XML = require('../services/XML');
var create = require('./changeset-create').handler;
var upload = require('./changeset-upload').handler;
/*
  This route combines changeset id creation,
  XML reading and changeset upload
*/

function oscUpload(req, res) {
  create({payload: {uid: 99, user: 'openroads'}}, function(fromCreate) {
    if (fromCreate.isBoom) {
      res(fromCreate);
    } else {
      var json = XML.read(req.payload.toString());
      upload({
        params: {
          changesetID: parseInt(fromCreate.id, 10)
        },
        payload: {osmChange: json}
      }, res);
    }
  });
}

module.exports = {
  method: 'POST',
  path: '/upload',
  config: {
    payload: {
      parse: false
    }
  },
  handler: oscUpload
};