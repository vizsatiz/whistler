var dateTimeHooks = function (schema) {
    
    this._schema = schema;
    
    var preSaveHook = function(schemaToHook) {
        // on every save, add the date
        schemaToHook.pre('save', true, function(next, done) {
          // trigger next middleware in parellel
          next();
          var currentDateTime = (new Date()).toISOString();
          if (!this.updatedAt)
            this.updatedAt = new Date(currentDateTime);

          if (!this.createdAt)
            this.createdAt = new Date(currentDateTime);

          done();
        });
    }

    var preUpdateHook = function(schemaToHook) {
        schemaToHook.pre('findOneAndUpdate', true, function (next, done) {
            next();
            this._update.updatedAt = (new Date()).toISOString();
            done();
        });   
    }
    
    this.configure = function() {
        preSaveHook(this._schema);
        preUpdateHook(this._schema);
    }
}

module.exports = dateTimeHooks;