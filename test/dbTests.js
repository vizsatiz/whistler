var assert = require('assert');
var db = require('./../db/dbConnectionHandler.js');
var ormManager = require('./../db/ormManager.js');

db.connect({isMock: false});

describe('Mongoose db CRUD tests', function() {
  describe('[No relationship] Mongoose db user create test', function() {
    
    // create
    it('Create user through models ..', function(done) {
      (new ormManager('user')).create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          done();
      }, function (error) {
          done(error);
      });
    });
      
    // update
    // create
    it('Update user through models ..', function(done) {
      (new ormManager('user')).create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          (new ormManager('user')).updateById(user._id, {name: "updateTestName"}, {new: true}, function (user) {
              assert.equal('updateTestName', user.name);
              done();
          }, function(error) {
              done(error);
          });
      }, function (error) {
          done(error);
      });
    });
      
  });
});