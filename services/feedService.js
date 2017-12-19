var ormManager = require('./../db/ormManager.js');
var logger = require('./../logger/logger.js');
var errorCodes = require('./../constants/errorConstants.js');
var dbUtils = require('./../utils/dbUtils');

var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');
var hashTagORMObject = ormManager.getORMObject('hashTag');

var FeedService = function(user) {

    // The current user for which feeds are going to be fetched.
    this._user = user;
    this.TAG = "FeedService";

    this.getPostsForCurrentUsersFeed = function(onSuccess, onFailure) {
      var scope = this;
      var userValidation = isValidUser(scope._user);
      if (!userValidation.status) {
          logger.error(scope.TAG, "Post feed cannot be queried for null/empty user");
          onFailure({
              code: errorCodes.INVALID_POST_USER,
              message: userValidation.errorMessage
          });
      } else {
        var usersCurrentUserFollows = scope._user.follows;
        userORMObject.read({_id: scope._user._id}, [{path: 'follows', populate: {path: 'createdPosts', populate: 'comments'}}], function(users) {
           logger.info(scope.TAG, "Successfully fetched all the posts of all users who follow: " + scope._user.name);
           // TODO maybe sorting ??
           onSuccess(users[0].follows);
        }, function(error) {
          logger.error(scope.TAG, "Error while fetching feed for the user: " + scope._user.name);
          onFailure({
              code: errorCodes.POST_FEED_READ_ERROR,
              message: 'ORM Error while reading the feed for user: ' + scope._user.name
          });
        });
      }
    };

    // method creates post for current user and adds hash tags and users to the same
    this.createPostForCurrentUser = function(post, onSuccess, onFailure)  {
        var scope = this;
        var userValidation = isValidUser(scope._user);
        if (!userValidation.status) {
            logger.error(scope.TAG, "Post cannot be created for null/empty user");
            onFailure({
                code: errorCodes.INVALID_POST_USER,
                message: userValidation.errorMessage
            });
        } else {
          var messageValidations = isValidatePostMessage(post.message);
          if (messageValidations.status) {
              if (post.hashTags && post.userTags) {
                  var hashTags = post.hashTags;
                  var userTags = post.userTags;
                  var postToCommit = {message: post.message, user: scope._user._id};
                  postORMObject.create(postToCommit, function(commitedPost) {
                     logger.info(scope.TAG, "Created post .. going ahead to create hashTags and userTags");
                     var hashTagsToCommit = [];
                     for (var i = 0; i < hashTags.length; i++) {
                        var hashTagValidations = isValidatePostHashTag(hashTags[i]);
                        if (hashTagValidations.status) {
                           hashTagsToCommit.push({
                             record: {_id: hashTags[i], name: hashTags[i]},
                             fks: [{fieldName: 'posts', value: commitedPost._id}]
                           });
                        }
                     }
                     var userTagsToCommit = [];
                     for (var i = 0; i < userTags.length; i++) {
                        if (!userTags[i]._id) {
                          logger.error('User tag found without id: ' + JSON.stringify(userTags[i]));
                        }
                        userTagsToCommit.push({
                          query: {_id: dbUtils.stringToObjectId(userTags[i]._id)},
                          fks: [{fieldName: 'taggedPosts', value: commitedPost._id}]
                        });
                     }
                     logger.info(scope.TAG, "Hash tags to commit: " + JSON.stringify(hashTagsToCommit));
                     hashTagORMObject.batchUpsert(hashTagsToCommit, function() {
                        userORMObject.batchRecordExistenceCheck(userTagsToCommit, function() {
                           logger.info(scope.TAG, "All user tags and hash tags verified .. proceeding to create post.");
                           for (var i = 0; i < hashTagsToCommit.length; i++) {
                              commitedPost.hashTags.push(hashTagsToCommit[i].record._id);
                           }
                           for (var i = 0; i < userTagsToCommit.length; i++) {
                              commitedPost.userTags.push(userTagsToCommit[i].query._id);
                           }
                           postORMObject.save(commitedPost, function(savedPost) {
                              scope._user.createdPosts.push(commitedPost);
                              userORMObject.save(scope._user, function(savedUser){
                                onSuccess(savedPost);
                              }, function(error) {
                                logger.error(scope.TAG, "Error while creating post: " + JSON.stringify(error));
                                onFailure({
                                    code: errorCodes.POST_CREATED_USER_PUSH_ERROR,
                                    message: 'ORM error saving post to user created post'
                                });
                              })
                           }, function (error) {
                             logger.error(scope.TAG, "Error while creating post: " + JSON.stringify(error));
                             onFailure({
                                 code: errorCodes.POST_USERTAG_HASHTAG_ORM_CREATE_ERROR,
                                 message: 'ORM error saving user tags and hash tags'
                             });
                           });
                        }, function(error) {
                            logger.error(scope.TAG, "Error while user batch check: " + JSON.stringify(error));
                            onFailure({
                                code: errorCodes.POST_USERTAG_ORM_CHECK_ERROR,
                                message: 'ORM error checking for user tag existence'
                            });
                        });
                     }, function(error) {
                         logger.error(scope.TAG, "Error while creating post with hash tags: " + JSON.stringify(error));
                         onFailure({
                             code: errorCodes.POST_HASTAG_ORM_UPSERT_ERROR,
                             message: 'ORM error while creating post'
                         });
                     });
                  }, function(error){
                     logger.error(scope.TAG, "Error while creating posts: " + JSON.stringify(error));
                     onFailure({
                         code: errorCodes.POST_ORM_CREATE_ERROR,
                         message: 'ORM error while creating post'
                     });
                  });
              } else {
                logger.error(scope.TAG, "HashTags/UserTags key not found");
                onFailure({
                    code: errorCodes.POST_HASHTAGS_OR_USERTAGS_NOT_FOUND,
                    message: 'HashTags/UserTags key not found'
                });
              }
          } else {
              logger.error(scope.TAG, "Error while post validation: " + messageValidations.errorMessage);
              onFailure({
                  code: errorCodes.INVALID_POST_MESSAGE,
                  message: messageValidations.errorMessage
              });
          }
        }
    };

    this.getFeedsWhereCurrentUserIsTagged = function(onSuccess, onFailure) {
        var scope = this;
        userORMObject.read({_id: scope._user._id}, [{path: 'taggedPosts'}], function(user){
           logger.info(scope.TAG, "Success fetching posts in which current user is tagged in : " +  JSON.stringify(user.taggedPosts));
           onSuccess(user[0].taggedPosts);
        }, function(error){
          logger.error(scope.TAG, "getFeedsWhereCurrentUserIsTagged: Error while reading tagged posts: " + JSON.stringify(error));
           onFailure({
              code: errorCodes.POST_TAGGED_POST_READ_ERROR,
              message: 'ORM error while reading tagged posts'
           });
        });
    };

    this.getFeedsCreatedByCurrentUser = function(onSuccess, onFailure) {
      var scope = this;
      postORMObject.read({user: scope._user._id}, [{path: 'comments'}], function(posts) {
        logger.info(scope.TAG, "Success fetching posts which are created by current user");
        onSuccess(posts);
      }, function(error) {
        logger.error(scope.TAG, "getFeedsCreatedByCurrentUser: Error while reading posts: " + JSON.stringify(error));
         onFailure({
            code: errorCodes.POST_TAGGED_POST_READ_ERROR,
            message: 'ORM error while reading posts'
         });
      });
    };

    this.getFeedsByHashTag = function(hashTag, onSuccess, onFailure) {
      var scope = this;
      hashTagORMObject.read({_id: hashTag}, [{path: 'posts'}], function(hashTags) {
        if(!hashTags || hashTags.length == 0) {
          logger.error(scope.TAG, "No hashtag found: " + hashTag);
          onFailure({
             code: errorCodes.POST_HASH_TAG_NOT_FOUND,
             message: 'No hashtags named: ' + hashTag
          });
        } else {
          logger.info(scope.TAG, "Success reading posts for hashtag: " + hashTag);
          var hashTaggedPosts = hashTags[0].posts;
          onSuccess(hashTaggedPosts);
        }
      }, function(error) {
        logger.error(scope.TAG, "No hashtag found: " + hashTag);
        onFailure({
           code: errorCodes.POST_HASH_TAGGED_POSTS,
           message: 'ORM error while reading posts for given hashTag'
        });
      });
    }

    this.updateFeedForCurrentUser = function(post, onSuccess, onFailure) {
      var scope = this;
      postORMObject.read({_id: dbUtils.stringToObjectId(post._id)}, [], function(posts) {
        if (!posts || posts.length === 0) {
          logger.error(scope.TAG, "Post to update not found");
          onFailure({
             code: errorCodes.POST_TO_UPDATE_NOT_FOUND,
             message: 'The post to update is not found'
          });
        } else {
          var postToUpdate = posts[0];
          var hashTags = post.hashTags;
          var userTags = post.userTags;
          if (post.message) {
            postToUpdate.message = post.message;
          }
          var hashTagsToCommit = [];
          if (hashTags) {
            postToUpdate.hashTags = [];
            for (var i = 0; i < hashTags.length; i++) {
               var hashTagValidations = isValidatePostHashTag(hashTags[i]);
               if (hashTagValidations.status) {
                  hashTagsToCommit.push({
                    record: {_id: hashTags[i], name: hashTags[i]},
                    fks: [{fieldName: 'posts', value: postToUpdate._id}]
                  });
               }
            }
          }
          var userTagsToCommit = [];
          if (userTags) {
            postToUpdate.userTags = [];
            for (var i = 0; i < userTags.length; i++) {
               if (!userTags[i]._id) {
                 logger.error('User tag found without id: ' + JSON.stringify(userTags[i]));
               }
               userTagsToCommit.push({
                 query: {_id: dbUtils.stringToObjectId(userTags[i]._id)},
                 fks: [{fieldName: 'taggedPosts', value: postToUpdate._id}]
               });
            }
          }
          hashTagORMObject.batchUpsert(hashTagsToCommit, function() {
             userORMObject.batchRecordExistenceCheck(userTagsToCommit, function() {
                logger.info(scope.TAG, "All user tags and hash tags verified .. proceeding to update post.");
                for (var i = 0; i < hashTagsToCommit.length; i++) {
                   postToUpdate.hashTags.push(hashTagsToCommit[i].record._id);
                }
                for (var i = 0; i < userTagsToCommit.length; i++) {
                   postToUpdate.userTags.push(userTagsToCommit[i].query._id);
                }
                postORMObject.save(postToUpdate, function(savedPost) {
                   onSuccess(savedPost);
                }, function (error) {
                  logger.error(scope.TAG, "Error while updating post: " + JSON.stringify(error));
                  onFailure({
                      code: errorCodes.POST_USERTAG_HASHTAG_ORM_UPDATE_ERROR,
                      message: 'ORM error updating user tags and hash tags'
                  });
                });
             }, function(error) {
                 logger.error(scope.TAG, "Error while user batch check: " + JSON.stringify(error));
                 onFailure({
                     code: errorCodes.POST_USERTAG_ORM_CHECK_ERROR,
                     message: 'ORM error checking for user tag existence'
                 });
             });
          }, function(error) {
              logger.error(scope.TAG, "Error while creating post with hash tags: " + JSON.stringify(error));
              onFailure({
                  code: errorCodes.POST_HASTAG_ORM_UPSERT_ERROR,
                  message: 'ORM error while creating post'
              });
          });
        }
      }, function(error) {
        logger.error(scope.TAG, "Error while fetching post for updating");
        onFailure({
           code: errorCodes.POST_READ_TO_UPDATE_POST_FAILED,
           message: 'ORM error while reading posts for updating'
        });
      });
    }

    var isValidatePostMessage = function(message) {
       if (!message) {
           return {
               status: false,
               errorMessage: 'Message cannot be empty/null'
           }
       } else {
           if (message.length == 0 || typeof message !== 'string') {
              return {
                status: false,
                errorMessage: 'Message must a non empty string'
              }
           }
       }

       return {
           status: true
       };
    }

    var isValidatePostHashTag = function(hashTag) {
       if (!hashTag || hashTag.length == 0) {
           return {
               status: false,
               errorMessage: 'Hash Tag cannot be empty/null'
           }
       }
       return {
           status: true
       };
    }

    var isValidUser = function(user) {
        if(!user) {
           return {
               status: false,
               errorMessage: 'Post cannot be created for empty/null user'
           }
        }

        return {
           status: true
        };
    }
}

module.exports = FeedService;
