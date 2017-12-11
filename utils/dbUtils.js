var mongoose = require('mongoose');

var dbUtils = {

   // Converts string to mongoose ObjectId
   stringToObjectId : function(id) {
     return mongoose.Types.ObjectId(id);
   }
}

module.exports = dbUtils;
