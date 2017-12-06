var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var userSchema = mongoose.Schema({
    name: String,
    version: String,
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(userSchema)).configure();

module.exports = userSchema;