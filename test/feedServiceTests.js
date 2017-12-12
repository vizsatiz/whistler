var assert = require('assert');

var feedService = require('./../services/feedService.js');
var ormManager = require('./../db/ormManager.js');
var errorCodes = require('./../constants/errorConstants.js')

var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');

describe('Feed services tests', function() {
  describe('Feed service negative tests', function() {

    beforeEach(function() {
        userORMObject.drop(function () {
        }, function(error) {
          done(error);
        });
    });

    it('Create post without tag users and hash tags', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {"message": "New post created"};
          feedSvc.createPostForCurrentUser(post, function(){
             done('Should Fail as user tags are not sent');
          }, function(error) {
            assert.equal(errorCodes.POST_HASHTAGS_OR_USERTAGS_NOT_FOUND, error.code);
            done();
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post without user', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(null);
          var post = {"message": "New post created"};
          feedSvc.createPostForCurrentUser(post, function(){
             done('Should Fail as user tags are not sent');
          }, function(error) {
            assert.equal(errorCodes.INVALID_POST_USER, error.code);
            done();
          });
      }, function (error) {
          done(error);
      });
    });

  });

  describe('Feed service positive tests', function() {

    beforeEach(function() {
        userORMObject.drop(function () {
          postORMObject.drop(function () {
          }, function(error) {
            done(error);
          });
        }, function(error) {
          done(error);
        });
    });

    it('Create post without hashTags and userTags', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created', hashTags: [], userTags:[]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 0);
             assert.equal(committedPost.userTags.length, 0);
             done();
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post without userTags but with hashTags', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created', hashTags: ["#testHash"], userTags:[]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 1);
             assert.equal(committedPost.userTags.length, 0);
             done();
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post with userTags and with hashTags', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: ["#testHash"], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 1);
             assert.equal(committedPost.userTags.length, 1);
             done();
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post with userTags and without hashTags', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: [], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 0);
             assert.equal(committedPost.userTags.length, 1);
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
