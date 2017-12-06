var winston = require('winston');

var wistlerLogFormat = winston.format.printf(info => {
  return `[${info.timestamp}][${info.label}][${info.level}]: ${info.message}`;
});

var logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: 'Wistler' }),
    winston.format.timestamp(),
    wistlerLogFormat
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `info.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: './bin/logs/error.log', level: 'error', handleExceptions: true}),
    new winston.transports.File({ filename: './bin/logs/info.log'})
  ],
  exitOnError: false
});

module.exports = logger;