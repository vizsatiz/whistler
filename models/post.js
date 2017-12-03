var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var ObjectId = mongoose.Schema.ObjectId;

var postSchema = mongoose.Schema({
    message: String,
    version: String,
    user: {type: ObjectId, ref: 'user'},
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(postSchema)).configure();

module.exports = postSchema;