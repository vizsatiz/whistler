var mongoose = require('mongoose');
var schemaManager = require('./schemaManager.js');
var logger = require('./../logger/logger.js');

var ORMObject = function(modelName) {
    
    // init model
    this._model = mongoose.model(modelName, 
                                 schemaManager.getSchemaByName(modelName));
    this.TAG = "ORMObject";
    
    // create an object record and save to db.
    this.create = function(record, onSuccess, onFailure) {
        logger.info(this.TAG, "Create operation execution started on ORM Object: " 
                    + modelName + " with data: " + JSON.stringify(record));
        (new this._model(record)).save(function (error, record) {
            if (error){
              logger.error(this.TAG, "Error while ORM create: " + JSON.stringify(error));
              onFailure(error); 
              return;
            }
            onSuccess(record);
        });
    }
    
    // update an object record and save to db.
    this.update = function(query, record, options, onSuccess, onFailure) {
        logger.info(this.TAG, "Update operation execution started on ORM Object: " 
                    + modelName + " with data: " + JSON.stringify(record));
        this._model.findOneAndUpdate(query, record, options, function (error, record) {
            if (error){
              logger.error(this.TAG, "Error while ORM update: " + JSON.stringify(error));
              onFailure(error);  
              return;
            }
            onSuccess(record);
        });
    }  
    
    // read an object record from db
    this.read = function(query, populate, onSuccess, onFailure) {
        logger.info(this.TAG, "Read operation execution started on ORM Object: " 
                    + modelName + " with data: " + JSON.stringify(query));
        var queryObject = this._model.find(query);
        queryObject = queryObject.populate(populate);
        queryObject.exec(function(error, records) {
            if (error) {
                logger.error(this.TAG, "Error while ORM read: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            onSuccess(records);
        });
    }
    
    // delete an object record and save to db.
    this.deleteById = function(id, onSuccess, onFailure) {
        logger.info(this.TAG, "Delete operation execution started on ORM Object: " 
                    + modelName + " with id: " + id);
        this._model.findByIdAndRemove(id, function (error, record) {
            if (error) {
                logger.error(this.TAG, "Error while ORM delete: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            onSuccess(record);
        });
    }
    
    // delete all the records in a table
    this.drop = function(onSuccess, onFailure) {
        logger.info(this.TAG, "Drop operation execution started on ORM Object: "
                    + modelName);
        this._model.remove(function (error) {
            if (error) {
                logger.error(this.TAG, "Error while ORM drop: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            onSuccess();
        });
    }
    
    // save the current state of the object
    this.save = function(record, onSuccess, onFailure) {
        logger.info(this.TAG, "Save operation execution started on ORM Object: "
                    + modelName);
        record.save(function(error, record){
            if(error) {
                logger.error(this.TAG, "Error while ORM save: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
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