var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var ObjectId = mongoose.Schema.ObjectId;

var userSchema = mongoose.Schema({
    name: String,
    password: String,
    version: String,
    taggedPosts: [{type: ObjectId, ref: 'post'}],
    createdPosts: [{type: ObjectId, ref: 'post'}],
    follows: [{type: ObjectId, ref: 'user'}],
    followers: [{type: ObjectId, ref: 'user'}],
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(userSchema)).configure();

module.exports = userSchema;
