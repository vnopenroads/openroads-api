#!/usr/bin/env node

/**
 * WARNING: JSONStream assumes that the input is utf-8, but in some
 * cases ogr2ogr produces GeoJSON files in ISO-8859-1 (extended
 * ascii), which can cause parsing errors.
 *
 * Double check on linux/mac with:
 * file --mime-encoding yourfile.json
 *
 * And if necessary, convert to UTF-8 with:
 * iconv -f ISO-8859-1 -t UTF-8 yourfile.json > output.json
 */

'use strict';

// jshint maxlen: false
var JSONStream = require('JSONStream');
var through = require('through2');
var knex = require('knex')({
  client: 'pg',
  connection: require('../connection.js'),
  debug: false
});

if (process.argv.length < 3) {
  
  console.log('usage: cat file.json | ', process.argv[0], process.argv[1], 'ID_PROPERTY');
  process.exit();
}

var idProp = process.argv[2];
var count = 0;

process.stdin
.pipe(JSONStream.parse('features.*'))
.pipe(through.obj(function write(feat, enc, next) {

  console.log('inserting: ' + feat.properties[idProp]);
  knex('admin_boundaries')
    .insert({
      id: +feat.properties[idProp],
      geo: feat
    })
    .then(function() { count++; next(); })
    .catch(next);

}, function end() {
  console.log('Inserted ' + count + ' features.');
  this.push(null);
}));
