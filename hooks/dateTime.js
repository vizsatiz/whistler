var dateTimeHooks = function (schema) {
    
    this._schema = schema;
    
    var preSaveHook = function(schemaToHook) {
        // on every save, add the date
        schemaToHook.pre('save', function(next) {
          var currentDateTime = (new Date()).toISOString();
          if (!this.updatedAt)
            this.updatedAt = new Date(currentDateTime);

          if (!this.createdAt)
            this.createdAt = new Date(currentDateTime);

          next();
        });
    }

    var preUpdateHook = function(schemaToHook) {
        schemaToHook.pre('findOneAndUpdate', function (next) {
            this._update.updatedAt = (new Date()).toISOString();
            next();
        });   
    }
    
    this.configure = function() {
        preSaveHook(this._schema);
        preUpdateHook(this._schema);
    }
}

module.exports = dateTimeHooks;