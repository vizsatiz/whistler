var userSchema = require('./../models/user.js');

var schemaManager = {
    
    getSchemaByName: function(objectName) {
        if (objectName == 'user') return userSchema;
    }
    
};

module.exports = schemaManager;