var mongoose = require('mongoose');
var schemaManager = require('./schemaManager.js')

var ormManager = function(modelName){
    
    // init model
    this._model = mongoose.model(modelName, 
                                 schemaManager.getSchemaByName(modelName));
    
    // create a user record and save to db.
    this.create = function(record, onSuccess, onFailure) {
        (new this._model(record)).save(function (error, user) {
            if (error) onFailure(error);
            onSuccess(user);
        });
    }
    
    // update a user record and save to db.
    this.updateById = function(id, record, options, onSuccess, onFailure) {
        this._model.findByIdAndUpdate(id, record, options, function (error, user) {
            if (error) onFailure(error);
            onSuccess(user);
        });
    }
}

module.exports = ormManager;