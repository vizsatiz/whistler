var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var MongoDBAdapter = function(options) {
    
    this.connect = function(params) {
       mongoose.connect('mongodb://localhost/test',{
          useMongoClient: true,
          autoIndex: false, // Don't build indexes
          reconnectTries: 0, // Never stop trying to reconnect
          reconnectInterval: 500, // Reconnect every 500ms
          poolSize: 2, // Maintain up to 10 socket connections
          autoReconnect: false,// If not connected, return errors immediately rather than waiting for reconnect
          bufferMaxEntries: 0
       });
       
       var db = mongoose.connection;
       db.on('error', 
             console.error.bind(console, 'connection error ..'));
       db.on('open', function() {
           
       });
    } 
};

var dbManager = {
    getInstance: function(options) {
       return new MongoDBAdapter(options);
    }
}

module.exports = dbManager;