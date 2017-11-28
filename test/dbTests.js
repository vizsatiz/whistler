var assert = require('assert');
var db = require('./../db/dbConnectionHandler.js');
var user = require('./../models/user.js');

db.connect({isMock: false});

describe('Mongoose db CRUD tests', function() {
  describe('[No relationship] Mongoose db user create test', function() {
    it('Create user through models ..', function(done) {
      user.create({"name": "testName"}, function (user) {
          assert.equal("testName", user.name);
          done();
      }, function (error) {
          done(error);
      });
    });
  });
});