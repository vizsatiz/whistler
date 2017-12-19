var assert = require('assert');

var userService = require('./../services/userService.js');
var ormManager = require('./../db/ormManager.js');
var errorCodes = require('./../constants/errorConstants.js');

describe('User services tests', function() {
  describe('User service negative tests', function() {
    it('Create user with empty user name', function(done) {
      var userSvc = new userService({
        name: ''
      });
      userSvc.createUser(function(user) {
        done('User created with empty user name');
      }, function(error) {
        assert.equal(errorCodes.USER_INVALID, error.code);
        assert.equal('Username/password cannot be null or empty', error.message);
        done();
      });
    });

    it('Create user with wrong user name length', function(done) {
      var userSvc = new userService({
        name: 'sc',
        password: 'sd'
      });
      userSvc.createUser(function(user) {
        done('User created with empty user name');
      }, function(error) {
        assert.equal(errorCodes.USER_INVALID, error.code);
        assert.equal('Username/password should have atleast length of 3', error.message);
        done();
      });
    });

    it('Create user with wrong password length', function(done) {
      var userSvc = new userService({
        name: 'sdec',
        password: 's'
      });
      userSvc.createUser(function(user) {
        done('User created with empty user name');
      }, function(error) {
        assert.equal(errorCodes.USER_INVALID, error.code);
        assert.equal('Username/password should have atleast length of 3', error.message);
        done();
      });
    });

    it('Create user with wrong name format', function(done) {
      var userSvc = new userService({
        name: 'sdecw 3e3',
        password: 'sdwdewf'
      });
      userSvc.createUser(function(user) {
        done('User created with empty user name');
      }, function(error) {
        assert.equal(errorCodes.USER_INVALID, error.code);
        assert.equal('Invalid format for username/password', error.message);
        done();
      });
    });

    it('Create user with wrong password format', function(done) {
      var userSvc = new userService({
        name: 'sdecw3e3',
        password: 'scde ecde'
      });
      userSvc.createUser(function(user) {
        done('User created with empty user name');
      }, function(error) {
        assert.equal(errorCodes.USER_INVALID, error.code);
        assert.equal('Invalid format for username/password', error.message);
        done();
      });
    });
  });

  describe('User service positive tests', function() {
    it('Create user with correct username and password', function(done) {
      var userSvc = new userService({
        name: 'sdecw3e3',
        password: 'scde2ecde'
      });
      userSvc.createUser(function(user) {
        assert.equal(user.name, 'sdecw3e3');
        assert.equal(user.follows.length , 1);
        assert.equal(user.follows[0] , user._id);
        done();
      }, function(error) {
        done(error);
      });
    });

    it('Create user with correct username and password and follow another user', function(done) {
      var userSvc = new userService({
        name: 'sdecw3e3',
        password: 'scde2ecde'
      });
      userSvc.createUser(function(user) {
        assert.equal(user.name, 'sdecw3e3');
        assert.equal(user.follows.length , 1);
        assert.equal(user.follows[0] , user._id);
        var userSvc2 = new userService({
          name: 'sdesdecw3e3',
          password: 'scdwde2ecde'
        });
        userSvc2.createUser(function(user2) {
          userSvc2.followUsers([user._id], function(savedUser) {
            assert.equal(user2.name, 'sdesdecw3e3');
            assert.equal(user2.follows.length , 2);
            done();
          }, function(error) {
            done(error);
          })
        }, function(error) {
          done(error);
        });
      }, function(error) {
        done(error);
      });
    });

  });
});
