var assert = require('assert');
var DBManager = require('./../db/dbManager.js');
var ormManager = require('./../db/ormManager.js');

var dbManager = DBManager.getInstance().connect({isMock: false});
var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');
var commentORMObject = ormManager.getORMObject('comment');

describe('Mongoose db CRUD tests', function() {
  describe('[No relationship] Mongoose db object tests for CRUD validation', function() {
      
    beforeEach(function() {
        userORMObject.drop(function () {
        }, function(error) {
          done(error);
        });
    });
      
    it('Invalid model creation test ..', function(done) {
        try{
            ormManager.getORMObject('Invalid');
            done('Invalid object creation success');
        } catch(e) {
            done();
        }
    });
    
    // create
    it('Create user through models ..', function(done) {
      userORMObject.create({name: "testName"}, function (user) {
          assert.equal('testName', user.name);
          userORMObject.deleteById(user._id, function () {
              done();
          }, function(error) {
              done(error);
          });
      }, function (error) {
          done(error);
      });
    });
      
    // update
    it('Create and Update user through models ..', function(done) {
      userORMObject.create({name: "testName", value: "Ross"}, function (user) {
          assert.equal('testName', user.name);
          userORMObject.update({_id: user._id}, {name: "updateTestName"}, {new: true}, function (user) {
              assert.equal('updateTestName', user.name);
              done();
          }, function(error) {
              done(error);
          });
      }, function (error) {
          done(error);
      });
    });
      
    // read
    it('Create, Read and Delete user through models ..', function(done) {
      userORMObject.create({name: "testName11"}, function (user1) {
          assert.equal('testName11', user1.name);
          userORMObject.create({name: "testName21"}, function (user2) {
              assert.equal('testName21', user2.name);
              userORMObject.read({name: "testName21"}, [], function (readusers1) {
                  assert.equal(1, readusers1.length);
                  assert.equal("testName21", readusers1[0].name);
                  userORMObject.read({}, [], function (readusers2) {
                      assert.equal(2, readusers2.length);
                      assert.equal("testName11", readusers2[0].name);
                      assert.equal("testName21", readusers2[1].name);
                      userORMObject.deleteById(readusers2[0]._id, function () {
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
          }, function(error) {
              done(error);
          });
      }, function (error) {
          done(error);
      });
    });
      
  });
    
  describe('[No relationship] Mongoose db object tests for pre, post hooks for CRUD', function() {
    it('Pre hook test for create (save) and update (findOneAndUpdate) ..', function(done) {
      userORMObject.create({name: "testName", version: "Ross"}, function (user) {
          assert.equal('testName', user.name);
          assert.equal('Ross', user.version);
          assert.notEqual(user.createdAt, undefined);
          assert.notEqual(user.updatedAt, undefined);
          userORMObject.update({_id: user._id}, {name: "updateTestName"}, {new: true}, function (user) {
              assert.equal('updateTestName', user.name);
              assert.equal('Ross', user.version);
              assert.notEqual(user.createdAt, undefined);
              assert.notEqual(user.updatedAt, undefined);
              done();
          }, function(error) {
              done(error);
          });
      }, function (error) {
          done(error);
      });
    });
  });
    
  describe('[1-Many] Mongoose db object tests for post to user relations', function() {
     it('Create a user and a post for that user and delete post ..', function(done) {
          userORMObject.create({name: "testName"}, function (user) {
              assert.equal('testName', user.name);
              postORMObject.create({message: "testMessage", user: user._id}, function (post) {
                 assert.equal("testMessage", post.message);
                 assert.equal(user._id, post.user);
                 postORMObject.deleteById(post._id, function () {
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
      
     it('Read one to many post records without populate and query by user ..', function(done) {
         userORMObject.create({name: "testName"}, function (user) {
              assert.equal('testName', user.name);
              postORMObject.create({message: "testMessage", user: user._id}, function (post) {
                 assert.equal("testMessage", post.message);
                 assert.equal(user._id, post.user);
                 postORMObject.read({"user": user._id}, [], function (postByUser) {
                    assert.equal(1, postByUser.length);
                    assert.equal("testMessage", postByUser[0].message);
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
      
    it('Read one to many post records with populate comment and query by user ..', function(done) {
         userORMObject.create({name: "testName"}, function (user) {
              assert.equal('testName', user.name);
              postORMObject.create({message: "testMessage", user: user._id}, function (post) {
                 assert.equal("testMessage", post.message);
                 assert.equal(user._id, post.user);
                 commentORMObject.create({message: 'testComment', user: user._id}, function(comment) {
                    assert.equal("testComment", comment.message);
                    post.comments.push(comment);
                    postORMObject.save(post, function() {
                        postORMObject.read({"user": user._id}, {path: 'comments'}, function (postByUser) {
                           assert.equal(1, postByUser.length);
                           assert.equal("testMessage", postByUser[0].message);
                           assert.equal(1, postByUser[0].comments.length);
                           assert.equal("testComment", postByUser[0].comments[0].message);
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
              }, function(error) {
                 done(error); 
              });
          }, function (error) {
              done(error);
          });
     });
      
    it('Read one to many post records with populate comment with commented user ..', function(done) {
         userORMObject.create({name: "testName"}, function (user) {
              assert.equal('testName', user.name);
              postORMObject.create({message: "testMessage", user: user._id}, function (post) {
                 assert.equal("testMessage", post.message);
                 assert.equal(user._id, post.user);
                 commentORMObject.create({message: 'testComment', user: user._id}, function(comment) {
                    assert.equal("testComment", comment.message);
                    post.comments.push(comment);
                    postORMObject.save(post, function() {
                        postORMObject.read({"user": user._id}, {path: 'comments', 
                                                                 populate: {path: 'user'}}, function(postByUser) {
                           assert.equal(1, postByUser.length);
                           assert.equal("testMessage", postByUser[0].message);
                           assert.equal(1, postByUser[0].comments.length);
                           assert.equal("testComment", postByUser[0].comments[0].message);
                           assert.equal("testName", postByUser[0].comments[0].user.name);
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
              }, function(error) {
                 done(error); 
              });
          }, function (error) {
              done(error);
          });
      });
  });
    
});