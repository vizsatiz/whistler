var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');
var primaryKeysHooks = require('./../hooks/primaryKeys.js');

var ObjectId = mongoose.Schema.ObjectId;

var hashTagSchema = mongoose.Schema({
    _id: String,
    name: String,
    version: String,
    posts: [{type: ObjectId, ref: 'post'}],
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(hashTagSchema)).configure();

(new primaryKeysHooks(hashTagSchema)).configure();

module.exports = hashTagSchema;
