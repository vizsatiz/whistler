var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    name: String
});

var userModel = mongoose.model('user', userSchema);

var user = {
    // create a user record and save to db.
    create: function(record, onSuccess, onFailure) {
        (new userModel(record)).save(function (error, user) {
            if (error) onFailure(error);
            onSuccess(user);
        });
    },
    
    // update a user record and save to db.
    updateById: function(id, record, onSuccess, onFailure) {
        userModel.findByIdAndUpdate(id, record, function (error, user) {
            if (error) onFailure(error);
            onSuccess(user);
        });
    }
}

module.exports = user;