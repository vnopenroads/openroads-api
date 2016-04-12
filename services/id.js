'use strict';
var _ = require('lodash');

/**
 * | reg  | prov | munic  | baran |
 * | ---- | ---- | ------ | ----- |
 * | [00] | [00] | [0000] | [000] |
 */

// Modulus by these to determine the type of admin area.
var r = 1000000000;
var p = 10000000;
var m = 1000;

// Used to calculate the parent ids.
// Take into account the id length
var offsets = {
  10: {
    r: 0,
    p: 2,
    m: 6
  },
  11: {
    r: 1,
    p: 3,
    m: 7
  }
};

var ID = function (id) {
  this.id = id;
  this.id = parseInt(_.trim(this.id), 10);
  this.verify();
  this._type = this.identify();
};

// Check that ID to make sure it's valid.
ID.prototype.verify = function () {
  // IDs are numerical, so enforce this.
  if (isNaN(this.id, 10)) {
    throw new TypeError('this.ID must be parse-able as a number');
  }
  // IDs are a maximum of 11 characters, or 0 in the case of the country ID.
  var id = '' + this.id;
  var length = id.length;
  if ((length > 11 || length < 10) && this.id !== 0) {
    throw new Error('ID must be between 10 and 11 characters');
  }
  return this;
};

ID.prototype.identify = function () {
  if (this.id === 0) {
    return 'n';
  } else if (this.id % r === 0) {
    return 'r';
  } else if (this.id % p === 0) {
    return 'p';
  } else if (this.id % m === 0) {
    return 'm';
  } else {
    return 'b';
  }
};

ID.prototype.type = function () {
  return this._type;
};

ID.prototype.getLevel = function (type) {
  return {
    'n': 0,
    'r': 1,
    'p': 2,
    'm': 3,
    'b': 4
  }[type];
};

ID.prototype.level = function () {
  return this.getLevel(this._type);
};

ID.prototype.num = function () {
  return this.id;
};

ID.prototype.string = function () {
  return '' + this.id;
};

ID.prototype.childType = function () {
  var order = ['n', 'r', 'p', 'm', 'b'];
  return order[order.indexOf(this._type) + 1];
};

ID.prototype.display = {
  n: {
    display: 'Country'
  },
  r: {
    parent: 'Country',
    display: 'Region',
    plural: 'Regions'
  },
  p: {
    parent: 'Region',
    display: 'Province',
    plural: 'Provinces'
  },
  m: {
    parent: 'Province',
    display: 'Municipality',
    plural: 'Municipalities'
  },
  b: {
    parent: 'Municipality',
    display: 'Barangay',
    plural: 'Barangays'
  }
};

// parent can be both the type (n, r, p, m, b)
// or the level (0, 1, 2, 3, 4)
ID.prototype.parentID = function (parent) {
  var id = this.string();
  if (!isNaN(parseInt(parent, 10))) {
    parent = ['n', 'r', 'p', 'm', 'b'][parent];
  }
  if (this.level() <= this.getLevel(parent)) {
    console.log('Can\'t return the parent of a smaller admin region; returning current admin level instead');
    return id;
  }
  else if (parent === 'n') {
    return 0;
  }
  var offset = offsets[id.length][parent];
  var parentID = _.map(id.split(''), function (letter, i) {
    return i > offset ? '0' : letter;
  });
  return parentID.join('');
};

ID.prototype.directParentID = function () {
  return this.parentID(this.level() - 1);
};

ID.prototype.getDisplayType = function (plural) {
  return plural ? this.display[this.type()].plural : this.display[this.type()].display;
};

ID.prototype.getChildDisplayType = function (plural) {
  return plural ? this.display[this.childType()].plural : this.display[this.childType()].display;
};

module.exports = ID;
