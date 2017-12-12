var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var ObjectId = mongoose.Schema.ObjectId;

var userSchema = mongoose.Schema({
    name: String,
    password: String,
    version: String,
    posts: [{type: ObjectId, ref: 'post'}],
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(userSchema)).configure();

module.exports = userSchema;
