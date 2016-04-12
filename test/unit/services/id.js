'use strict';

var ID = require('../../../services/id');
var assert = require('should');

var national = 0;
var region = 1000000000;
var province = 1340000000;
var municipality = 1340589000;
var barangay = 1340589001;

describe('ID helper', function () {
  it('should throw on bad id input', function () {
    assert.throws(function () {
      var id = new ID(44);
    });
    assert.throws(function () {
      var id = new ID('hello world');
    });
    assert.throws(function () {
      var id = new ID(undefined);
    });
    assert.doesNotThrow(function () {
      var id = new ID(0);
    });
  });

  it('returns string and number types', function () {
    var id = new ID(national);
    id.num().should.type('number');
    id.string().should.type('string');
  });

  it('knows type, child type, and parent type', function () {
    var id = new ID(municipality);
    id.type().should.eql('m')
    id.level().should.eql(3);
    id.childType().should.eql('b');
  });

  it('knows how to display itself', function () {
    var id = new ID(municipality);
    id.getDisplayType().should.eql('Municipality');
    id.getDisplayType(true).should.eql('Municipalities');
    id.getChildDisplayType().should.eql('Barangay');
    id.getChildDisplayType(true).should.eql('Barangays');
  });

  it('knows parent ids', function () {
    var id = new ID(barangay);
    id.directParentID().should.eql(String(municipality));
    id.parentID('m').should.eql(String(municipality));
    id.parentID('p').should.eql(String(province));
    id.parentID(2).should.eql(String(province));
    id.parentID(1).should.eql(String(region));
    id.parentID(0).should.eql(String(national));

    var nationalID = new ID(national);
    nationalID.parentID('b').should.eql(String(national));
    nationalID.parentID('n').should.eql(String(national));
  });

});
