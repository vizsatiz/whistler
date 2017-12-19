var ormManager = require('./../db/ormManager.js');
var logger = require('./../logger/logger.js');
var errorCodes = require('./../constants/errorConstants.js');

var userORMObject = ormManager.getORMObject('user');

var UserService = function(user) {

  this._user = user;
  this.TAG = "UserService";

  this.createUser = function(onSuccess, onFailure) {
    var scope = this;
    var userValidation = isValidUser(scope._user);
    if (!userValidation.status) {
      logger.error(scope.TAG, userValidation.errorMessage);
      onFailure({
          code: errorCodes.USER_INVALID,
          message: userValidation.errorMessage
      });
    } else {
      userORMObject.create({name: scope._user.name, password: scope._user.password}, function(user) {
        user.follows.push(user._id);
        userORMObject.save(user, function() {
          logger.info(scope.TAG, "Successfully created the user: "  + user.name);
          scope._user = user;
          onSuccess(user);
        }, function(error) {
          logger.error(scope.TAG, "Error while self reference for the user: "  + scope._user.name);
          onFailure(error);
        });
      }, function(error) {
        logger.error(scope.TAG, "Error while creating user with name: "  + scope._user.name);
        onFailure(error);
      });
    }
  };

  this.followUsers = function(idsOfUserToFollow, onSuccess, onFailure) {
    var scope = this;
    userORMObject.read({_id: {$in: idsOfUserToFollow}}, [], function(usersToFollow) {
      if (usersToFollow.length == 0) {
        logger.error(scope.TAG, "No user found for following (id) : "  + idsOfUserToFollow);
        onFailure({
          code: errorCodes.USER_NOT_FOUND_TO_FOLLOW,
          message: 'User trying to follow is not found'
        });
      } else {
        for (var i = 0; i < usersToFollow.length; i++) {
          scope._user.follows.push(usersToFollow[i]._id);
        }
        userORMObject.save(scope._user, function(savedUser) {
          onSuccess(savedUser);
        }, function(error) {
          logger.error(scope.TAG, "Error while trying to follow user with id " + idOfUserToFollow);
          onFailure(error);
        });
      }
    }, function(error) {
      logger.error(scope.TAG, "Error while reading user to follow (id) : "  + idOfUserToFollow);
      onFailure(error);
    });
  };

  var isValidUser = function(user) {
      if(!user) {
         return {
             status: false,
             errorMessage: 'User cannot empty/null user'
         }
      } else {
        if (!user.name || user.name === '' || !user.password || user.password === '') {
          return {
              status: false,
              errorMessage: 'Username/password cannot be null or empty'
          }
        }
        if (user.name.length < 4 || user.password.length < 4) {
          return {
              status: false,
              errorMessage: 'Username/password should have atleast length of 3'
          }
        }
        // TODO fix the regex for password
        if(!(/^[a-zA-Z0-9_@]*$/.test(user.name)) || !(/^[a-zA-Z0-9_@]*$/.test(user.password))) {
          return {
              status: false,
              errorMessage: 'Invalid format for username/password'
          }
        }
      }

      return {
         status: true
      };
  }

}

module.exports = UserService;
