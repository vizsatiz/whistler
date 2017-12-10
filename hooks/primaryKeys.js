var primaryKeyHooks = function (schema) {
    
    this._schema = schema;
    
    var preSaveHook = function(schemaToHook) {
        // on every save, add the date
        schemaToHook.pre('save', true, function(next, done) {
          // trigger next middleware in parellel
          next();
          if (!this._id && this.name) {
              this._id = this.name;
          }
          done();
        });
    }
    
    this.configure = function() {
        preSaveHook(this._schema);
    }
}

module.exports = primaryKeyHooks;