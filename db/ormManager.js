var mongoose = require('mongoose');
var schemaManager = require('./schemaManager.js');

var ORMObject = function(modelName) {
    
    // init model
    this._model = mongoose.model(modelName, 
                                 schemaManager.getSchemaByName(modelName));
    
    // create an object record and save to db.
    this.create = function(record, onSuccess, onFailure) {
        (new this._model(record)).save(function (error, record) {
            if (error) onFailure(error);
            onSuccess(record);
        });
    }
    
    // update an object record and save to db.
    this.update = function(query, record, options, onSuccess, onFailure) {
        this._model.findOneAndUpdate(query, record, options, function (error, record) {
            if (error) onFailure(error);
            onSuccess(record);
        });
    }  
    
    // read an object record from db
    this.read = function(query, options, onSuccess, onFailure) {
        var queryObject = this._model.find(query);
        for (var i = 0; i < options.length; i++) {
           queryObject = queryObject.populate(options[i].path);
        }
        queryObject.exec(function(error, records) {
            if (error) onFailure(error);
            onSuccess(records);
        });
    }
    
    // delete an object record and save to db.
    this.deleteById = function(id, onSuccess, onFailure) {
        this._model.findByIdAndRemove(id, function (error, record) {
            if (error) onFailure(error);
            onSuccess(record);
        });
    }
    
    // delete all the records in a table
    this.drop = function(onSuccess, onFailure) {
        this._model.remove(function (error) {
            if (error) onFailure(error);
            onSuccess();
        });
    }
    
    // save the current state of the object
    this.save = function(record, onSuccess, onFailure) {
        record.save(function(error, record){
            if(error) onFailure(error);
            onSuccess(record);
        }) ;
    }
}

var ormManager = {
    // return orm object
    getORMObject: function(objectName) {
        return new ORMObject(objectName);
    }
    
}

module.exports = ormManager;