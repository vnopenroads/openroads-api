#!/usr/bin/env node

/**
 * Update the `type` column for admin boundaries
 *
 * Usage: ./update-admin-types.js < phi-admin-areas.csv
 *
 */

'use strict';

// jshint maxlen: false
var split = require('split');
var through = require('through2');
var knex = require('../connection.js');

var startAfter = process.argv[2];
var count = 0;

var first = true;
process.stdin
.pipe(split())
.pipe(through.obj(function write(line, enc, next) {

  console.log(line)
  if(first) {
    first = false;
    return next();
  }

  var values = line.split(',');

  if(values.length < 3) return next();

  var id = +values[0];
  var type = values[1];
  var name = values.slice(2).join(',');
  if(/^".*"$/.test(name)) { name = name.slice(1,-1); }


  if(startAfter) {
    if(id !== +startAfter) { return next(); }
    else startAfter = false;
  }

  console.log(id, 'updating', type, name);
  knex('admin_boundaries')
    .debug(true)
    .where('id', id)
    .update({
      type: type,
      name: name
    })
    .then(function() { console.log(id, 'done'); count++; next(); })
    .catch(next);

}, function end() {
  console.log('Updated ' + count + ' entries.');
  this.push(null);
}))
.on('error', console.error.bind(console));
