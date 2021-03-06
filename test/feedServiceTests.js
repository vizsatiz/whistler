var assert = require('assert');

var feedService = require('./../services/feedService.js');
var ormManager = require('./../db/ormManager.js');
var errorCodes = require('./../constants/errorConstants.js')

var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');
var hashTagORMObject = ormManager.getORMObject('hashTag');


describe('Feed services tests', function() {
  describe('Feed service negative tests', function() {

    beforeEach(function() {
        userORMObject.drop(function () {
          hashTagORMObject.drop(function () {
          }, function(error) {
            done(error);
          });
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

    it('Create post with userTags and with hashTags and query by getFeedsByHashTag with wrong hashTag', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: ["#testHash"], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 1);
             assert.equal(committedPost.userTags.length, 1);
             feedSvc.getFeedsByHashTag('#sdeffrf', function(posts) {
               done('Returned posts for wrong hashTag');
             }, function(error) {
               assert.equal(errorCodes.POST_HASH_TAG_NOT_FOUND, error.code);
               done();
             });
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

  });

  describe.only('Feed service positive tests', function() {

    beforeEach(function() {
        userORMObject.drop(function () {
          postORMObject.drop(function () {
            hashTagORMObject.drop(function () {
            }, function(error) {
              done(error);
            });
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
             userORMObject.read({_id: user._id}, [], function (readUser) {
                assert.equal(readUser[0].taggedPosts.length, 1);
                hashTagORMObject.read({_id: '#testHash'}, [], function (readHashTags) {
                   assert.equal(readHashTags[0].posts.length,  1);
                   done();
                }, function(error) {
                    done(error);
                });
             }, function(error) {
                done(error);
             });
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

    it('Create post and test getFeedsCreatedByCurrentUser', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: [], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 0);
             assert.equal(committedPost.userTags.length, 1);
             feedSvc.getFeedsCreatedByCurrentUser(function(posts) {
                assert.equal(posts.length, 1);
                done();
             }, function(error) {
               done(error);
             });
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post and test getFeedsWhereCurrentUserIsTagged', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: [], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 0);
             assert.equal(committedPost.userTags.length, 1);
             feedSvc.getFeedsWhereCurrentUserIsTagged(function(posts) {
                assert.equal(posts.length, 1);
                done();
             }, function(error) {
               done(error);
             });
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post with userTags and with hashTags and query by getFeedsByHashTag', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: ["#testHash"], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 1);
             assert.equal(committedPost.userTags.length, 1);
             feedSvc.getFeedsByHashTag('#testHash', function(posts) {
               assert.equal(posts.length, 1);
               assert.equal(posts[0].message, 'New post created');
               done();
             }, function(error) {
               done(error);
             });
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

    it('Create post with userTags and with hashTags and then update', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          var feedSvc = new feedService(user);
          var post = {message: 'New post created',
            hashTags: ["#testHash"], userTags:[{_id: user._id.toHexString(), name:'testName'}]};
          feedSvc.createPostForCurrentUser(post, function(committedPost){
             assert.equal(committedPost.message, 'New post created');
             assert.equal(committedPost.hashTags.length, 1);
             assert.equal(committedPost.hashTags[0], '#testHash');
             assert.equal(committedPost.userTags.length, 1);
             feedSvc.updateFeedForCurrentUser({
               _id: committedPost._id.toHexString(),
               message: 'Updated Message',
               hashTags: ["#testHashUpdate"],
               userTags: []
             }, function(savedPost) {
               assert.equal(savedPost.message, 'Updated Message');
               assert.equal(savedPost.hashTags.length, 1);
               assert.equal(savedPost.hashTags[0], '#testHashUpdate');
               assert.equal(savedPost.userTags.length, 0);
               feedSvc.updateFeedForCurrentUser({
                 _id: committedPost._id.toHexString(),
                 userTags: [{_id: user._id.toHexString(), name:'testName'}]
               }, function(savedPost) {
                 assert.equal(savedPost.message, 'Updated Message');
                 assert.equal(savedPost.hashTags.length, 1);
                 assert.equal(savedPost.hashTags[0], '#testHashUpdate');
                 assert.equal(savedPost.userTags.length, 1);
                 done();
               }, function (error) {
                 done(error);
               });
             }, function (error) {
               done(error);
             });
          }, function(error) {
            done(error);
          });
      }, function (error) {
          done(error);
      });
    });

  });
});
