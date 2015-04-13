#!/usr/bin/env node

/**
 * Update the `type` column for admin boundaries
 */

'use strict';

// jshint maxlen: false
var split = require('split');
var through = require('through2');
var knex = require('../connection.js');

var idProp = process.argv[2];
var count = 0;

var first = true;
process.stdin
.pipe(split())
.pipe(through.obj(function write(line, enc, next) {

  if(first) {
    first = false;
    return next();
  }

  var values = line.split(',');

  if(values.length !== 3) return this.push(null);

  var id = +values[0];
  var type = values[1];
  var name = values[2];
  console.log('updating: ' + id, type, name);
  knex('admin_boundaries')
    .where('id', id)
    .update({
      type: type,
      name: name
    })
    .then(function() { count++; next(); })
    .catch(next);

}, function end() {
  console.log('Updated ' + count + ' entries.');
  this.push(null);
}));
