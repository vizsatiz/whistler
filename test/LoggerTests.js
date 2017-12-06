var logger = require('./../logger/logger.js');

describe('Winston Logger tests', function() {
  describe('Winston logger BVT', function() {
      it('Verify whether a simple log statement works ..', function(done) {
         logger.info('This log message is part of logger config tests for INFO ..');
         logger.debug('This log message is part of logger config tests for DEBUG ..');
         logger.error('This log message is part of logger config tests for ERROR ..');
         done();
      });
 });   
});