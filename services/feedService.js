var ormManager = require('./../db/ormManager.js');
var logger = require('./../logger/logger.js');

var postORMObject = ormManager.getORMObject('post');
var hashTagORMObject = ormManager.getORMObject('hashTag');

var errorCodes = {
    INVALID_POST_USER: 'POSTS_1001',
    INVALID_POST_MESSAGE: 'POSTS_1002',
    INVALID_POST_HASHTAG: 'POSTS_1003',
    POST_ORM_CREATE_ERROR: 'POSTS_1004', 
    POST_HASTAG_ORM_CREATE_ERROR: 'POSTS_1005',
    POST_HASTAG_ORM_UPSERT_ERROR: 'POSTS_1006'
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
                var postToCommit = {message: post.message, user: scope.user.user_id};
                postORMObject.create(postToCommit, function(commitedPost) {
                   var hashTagsToCommit = [];
                   for (var i = 0; i < hashTags; i++) {
                      var hashTagValidations = isValidatePostHashTag(hashTags[i]);
                      if (hashTagValidations.status) {
                         hashTagsToCommit.push({_id: hashTags[i], name: hashTags[i]});
                      }    
                   }
                   hashTagORMObject.batchUpsert(hashTagsToCommit, function() {
                       
                   }, function() {
                       onFailure({
                           code: errorCodes.POST_HASTAG_ORM_UPSERT_ERROR,
                           message: 'ORM error while creating post'
                       });
                   });
                    
                    
                    
                   // TODO push tagged users
                   postORMObject.save(commitedPost, function(postRecord) {
                       onSuccess(postRecord);
                   }, function() {
                       onFailure({
                           code: errorCodes.POST_HASTAG_ORM_CREATE_ERROR,
                           message: 'ORM error while creating post'
                       });
                   });
                }, function(){
                   onFailure({
                       code: errorCodes.POST_ORM_CREATE_ERROR,
                       message: 'ORM error while creating post'
                   });
                });
            }
        } else {
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