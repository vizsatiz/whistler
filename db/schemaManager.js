var userSchema = require('./../models/user.js');
var postSchema = require('./../models/post.js');
var commentSchema = require('./../models/comment.js');
var hashTagSchema = require('./../models/hashTag.js');

var schemaManager = {
    
    getSchemaByName: function(objectName) {
        try {
            var schema = eval(objectName + 'Schema');
        } catch(e){
            throw {message: 'Schema not found'};
        }
        return schema;
    }
    
};

module.exports = schemaManager;