var userSchema = require('./../models/user.js');
var postSchema = require('./../models/post.js');

var schemaManager = {
    
    getSchemaByName: function(objectName) {
        var schema = eval(objectName + 'Schema');
        if (!schema) {
            throw {errorMessage: 'Schema not found.'};
        } 
        return schema;
    }
    
};

module.exports = schemaManager;