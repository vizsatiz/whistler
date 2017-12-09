var mongoose = require('mongoose');
var dateTimeHooks = require('./../hooks/dateTime.js');

var userSchema = mongoose.Schema({
    name: String,
    password: String,
    version: String,
    createdAt: Date,
    updatedAt: Date
});

// configure date time hook
(new dateTimeHooks(userSchema)).configure();

userSchema.path('name').validate(function (email) {
   var emailRegex = /^[a-zA-Z0-9_!]*$/; //^[a-zA-Z0-9_!]*$
   return emailRegex.test(email.text); // Assuming email has a text attribute
}, 'The e-mail field cannot be empty.')

module.exports = userSchema;