var ormManager = require('./../db/ormManager.js');
var logger = require('./../logger/logger.js');

var userORMObject = ormManager.getORMObject('user');
var postORMObject = ormManager.getORMObject('post');
var hashTagORMObject = ormManager.getORMObject('hashTag');

var errorCodes = {
    INVALID_POST_USER: 'POSTS_1001',
    INVALID_POST_MESSAGE: 'POSTS_1002',
    INVALID_POST_HASHTAG: 'POSTS_1003',
    POST_ORM_CREATE_ERROR: 'POSTS_1004',
    POST_HASTAG_ORM_CREATE_ERROR: 'POSTS_1005',
    POST_HASTAG_ORM_UPSERT_ERROR: 'POSTS_1006',
    POST_USERTAG_ORM_CHECK_ERROR: 'POSTS_1007',
    POST_USERTAG_HASHTAG_ORM_CREATE_ERROR: 'POSTS_1008'
}

var FeedService = function(user) {

    // The current user for which feeds are going to be fetched.
    this._user = user;
    this.TAG = "FeedService";

    this.createPostForCurrentUser = function(post, onSuccess, onFailure)  {
        var scope = this;
        var userValidation = isValidUser(scope.user);
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
            if (post.hashTags) {
                var hashTags = post.hashTags;
                var userTags = post.userTags;
                var postToCommit = {message: post.message, user: scope.user.user_id};
                postORMObject.create(postToCommit, function(commitedPost) {
                   logger.info(scope.TAG, "Creating post ..");
                   var hashTagsToCommit = [];
                   for (var i = 0; i < hashTags; i++) {
                      var hashTagValidations = isValidatePostHashTag(hashTags[i]);
                      if (hashTagValidations.status) {
                         hashTagsToCommit.push({_id: hashTags[i], name: hashTags[i]});
                      }
                   }
                   hashTagORMObject.batchUpsert(hashTagsToCommit, function() {
                      userORMObject.batchRecordExistenceCheck(userTags, function() {
                         logger.info(scope.TAG, "All user tags and hash tags verified .. proceeding to create post.");
                         for (var i = 0; i < hashTagsToCommit; i++) {
                            commitedPost.hashTags.push(hashTagsToCommit[i]);
                         }
                         for (var i = 0; i < userTags; i++) {
                            commitedPost.userTags.push(userTags[i]);
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
