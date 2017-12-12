var ormManager = require('./../db/ormManager.js');
var logger = require('./../logger/logger.js');
var errorCodes = require('./../constants/errorConstants.js')
var dbUtils = require('./../utils/dbUtils');

var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');
var hashTagORMObject = ormManager.getORMObject('hashTag');

var FeedService = function(user) {

    // The current user for which feeds are going to be fetched.
    this._user = user;
    this.TAG = "FeedService";

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
            return -1;
        }
        var messageValidations = isValidatePostMessage(post.message);
        if (messageValidations.status) {
            if (post.hashTags && post.userTags) {
                var hashTags = post.hashTags;
                var userTags = post.userTags;
                var postToCommit = {message: post.message, user: scope._user.user_id};
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
                      userTagsToCommit.push({_id: dbUtils.stringToObjectId(userTags[i]._id)});
                   }
                   logger.info(scope.TAG, "Hash tags to commit: " + JSON.stringify(hashTagsToCommit));
                   hashTagORMObject.batchUpsert(hashTagsToCommit, function() {
                      userORMObject.batchRecordExistenceCheck(userTagsToCommit, function() {
                         logger.info(scope.TAG, "All user tags and hash tags verified .. proceeding to create post.");
                         for (var i = 0; i < hashTagsToCommit.length; i++) {
                            commitedPost.hashTags.push(hashTagsToCommit[i].record._id);
                         }
                         for (var i = 0; i < userTagsToCommit.length; i++) {
                            commitedPost.userTags.push(userTagsToCommit[i]);
                         }
                         postORMObject.save(commitedPost, function(savedPost) {
                            onSuccess(savedPost);
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

    this.getFeedsWhereCurrentUserIsTagged = function() {
        // TODO
    };

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
