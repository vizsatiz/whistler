var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var postSchema = mongoose.Schema({
    name: String,
    version: String,
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(postSchema)).configure();

module.exports = postSchema;