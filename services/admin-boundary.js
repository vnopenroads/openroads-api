'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var readFile = Promise.promisify(require('fs').readFile);
var files = {
  municipality: require.resolve('../data/municipality.json')
}; 

module.exports = function getAdminBoundary(type, ids) {
  // TODO: could switch this to use JSONStream if the data files are big.
  return readFile(files[type], {encoding: 'utf-8'})
  .then(function (data) {
    var featureCollection = JSON.parse(data);      

    var boundary = _.find(featureCollection.features, {
      properties: {
        ID_0: ids[0],
        ID_1: ids[1],
        ID_2: ids[2]
      }
    });

    if(!boundary) {
      throw new Error('Could not find ' + type +
          ' with id ' + ids.join(':')); 
    }
    return boundary;
  });
};
