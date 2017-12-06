var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var hashTagSchema = mongoose.Schema({
    name: String,
    version: String,
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(hashTagSchema)).configure();

module.exports = hashTagSchema;