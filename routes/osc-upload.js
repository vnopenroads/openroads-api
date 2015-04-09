'use strict';
var XML = require('../services/xml');
var create = require('./changeset-create').handler;
var upload = require('./changeset-upload').handler;
var Boom = require('boom');
/*
  This route combines changeset id creation,
  XML reading and changeset upload
*/

function oscUpload(req, res) {
  try {
    var json = XML.read(req.payload.toString());
  } catch(e) {
    if (e) {
      return res(Boom.badRequest('Could not parse XML file'));
    }
  }
  var uploadParams = {
    params: {
      changesetID: req.params.changesetID
    },
    payload: {
      osmChange: json
    }
  };
  if (!req.params.changesetID) {
    create({payload: {uid: 99, user: 'openroads'}},
      function(fromCreate) {
        if (fromCreate.isBoom) {

          //Couldn't create a changeset
          res(fromCreate);
        } else {
          uploadParams.params.changesetID = parseInt(fromCreate.id, 10);
          upload(uploadParams, res);
        }
      });
  } else {
    upload(uploadParams, res);
  }
}

module.exports = {
  method: 'POST',
  path: '/upload/{changesetID?}',
  config: {
    payload: {
      parse: false
    }
  },
  handler: oscUpload
};