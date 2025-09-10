const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define logger format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Create error logger
const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

// Export logger function
const logError = (error, source = 'unknown') => {
  const errorObj = {
    message: error.message,
    stack: error.stack,
    source,
    timestamp: new Date().toISOString()
  };

  // Log to error log file
  errorLogger.error(`Error in ${source}`, errorObj);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Error in ${source}:`, error);
  }
};

module.exports = logError;
