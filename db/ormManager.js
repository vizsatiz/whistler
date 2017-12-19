var async = require('async');
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
        var scope = this;
        logger.info(this.TAG, "Create operation execution started on ORM Object: "
                    + modelName + " with data: " + JSON.stringify(record));
        (new this._model(record)).save(function (error, record) {
            if (error){
              logger.error(scope.TAG, "Error while ORM create: " + JSON.stringify(error));
              onFailure(error);
              return;
            }
            logger.info(scope.TAG, "Record created successfully: " + JSON.stringify(record));
            onSuccess(record);
        });
    }

    // update an object record and save to db.
    this.update = function(query, record, options, onSuccess, onFailure) {
        var scope = this;
        logger.info(this.TAG, "Update operation execution started on ORM Object: "
                    + modelName + " with data: " + JSON.stringify(record));
        this._model.findOneAndUpdate(query, record, options, function (error, record) {
            if (error){
              logger.error(scope.TAG, "Error while ORM update: " + JSON.stringify(error));
              onFailure(error);
              return;
            }
            logger.info(scope.TAG, "Record updated successfully: " + JSON.stringify(record));
            onSuccess(record);
        });
    }

    // read an object record from db
    this.read = function(query, populate, onSuccess, onFailure) {
        var scope = this;
        logger.info(this.TAG, "Read operation execution started on ORM Object: "
                    + modelName + " with data: " + JSON.stringify(query));
        var queryObject = this._model.find(query);
        queryObject = queryObject.populate(populate);
        queryObject.exec(function(error, records) {
            if (error) {
                logger.error(scope.TAG, "Error while ORM read: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            logger.info(scope.TAG, "Record read successfully: " + JSON.stringify(records));
            onSuccess(records);
        });
    }

    // delete an object record and save to db.
    this.deleteById = function(id, onSuccess, onFailure) {
        var scope = this;
        logger.info(this.TAG, "Delete operation execution started on ORM Object: "
                    + modelName + " with id: " + id);
        this._model.findByIdAndRemove(id, function (error, record) {
            if (error) {
                logger.error(scope.TAG, "Error while ORM delete: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            logger.info(scope.TAG, "Record deleted successfully: " + JSON.stringify(record));
            onSuccess(record);
        });
    }

    // delete all the records in a table
    this.drop = function(onSuccess, onFailure) {
        var scope = this;
        logger.info(this.TAG, "Drop operation execution started on ORM Object: "
                    + modelName);
        this._model.remove(function (error) {
            if (error) {
                logger.error(scope.TAG, "Error while ORM drop: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            onSuccess();
        });
    }

    // save the current state of the object
    this.save = function(record, onSuccess, onFailure) {
        var scope = this;
        logger.info(this.TAG, "Save operation execution started on ORM Object: "
                    + modelName);
        record.save(function(error, record){
            if(error) {
                logger.error(scope.TAG, "Error while ORM save: " + JSON.stringify(error));
                onFailure(error);
                return;
            }
            logger.info(scope.TAG, "Record saved successfully: " + JSON.stringify(record));
            onSuccess(record);
        }) ;
    }

    // batch upsert records
    this.batchUpsert = function(records, onSuccess, onFailure) {
        var scope = this;
        async.each(records, function(record, callback) {
            scope._model.findOneAndUpdate(record.record, record.record, {upsert:true, new: true}, function(err, doc){
                if(err){
                 return callback(err);
                }
                logger.info(scope.TAG, "Updating the batch upsert record: " + JSON.stringify(doc));
                var fks = record.fks;
                if (fks && fks.length > 0) {
                  for (var i = 0; i < fks.length; i++) {
                    (doc[fks[i].fieldName]).push(fks[i].value);
                  }
                  scope.save(doc, function(rec) {
                     return callback();
                  }, function(error) {
                     logger.error(scope.TAG, "Error while ORM bulk upsert while saving with pk: " + JSON.stringify(err));
                     return callback(error);
                  });
                } else {
                  return callback();
                }
            });
        }, function(err){
            if(err){
                logger.error(scope.TAG, "Error while ORM bulk upsert: " + JSON.stringify(err));
                onFailure(err);
            } else {
                logger.info(scope.TAG, "Bulk upsert success for model: " + modelName);
                onSuccess();
            }
        });
    }

    // batch check records for existance
    this.batchRecordExistenceCheck = function(queries, onSuccess, onFailure) {
        var scope = this;
        async.each(queries, function(query, callback) {
            scope._model.findOne(query.query, function(err, doc){
                if(err){
                    return callback(err);
                }
                if (!doc) {
                    logger.error(scope.TAG, 'Record not found in db, query: ' + JSON.stringify(query));
                    return callback('Record not found in db, query: ' + JSON.stringify(query));
                }
                logger.info(scope.TAG, "Read the batch existence check record: " + JSON.stringify(doc));
                var fks = query.fks;
                if (fks && fks.length > 0) {
                  for (var i = 0; i < fks.length; i++) {
                    (doc[fks[i].fieldName]).push(fks[i].value);
                  }
                  scope.save(doc, function(rec) {
                     return callback();
                  }, function(error) {
                     logger.error(scope.TAG, "Error while ORM bulk upsert while saving with pk: " + JSON.stringify(err));
                     return callback(error);
                  });
                } else {
                  return callback();
                }
            });
        }, function(err){
            if(err){
                logger.error(scope.TAG, "Error while ORM bulk batch record existence check: " + JSON.stringify(err));
                onFailure(err);
            } else {
                logger.info(scope.TAG, "Bulk existence check success for model: " + modelName);
                onSuccess();
            }
        });
    }
}

var ormManager = {
    // return orm object
    getORMObject: function(objectName) {
        return new ORMObject(objectName);
    }

}

module.exports = ormManager;
