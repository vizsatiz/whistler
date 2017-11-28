var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String
});

module.exports = userSchema;