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

// Create response logger
const responseLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'responses.log') })
  ]
});

// Log response function
const logResponse = (rawResponse, parsedResponse, userId = null, conversationId = null, queryId = null) => {
  const responseData = {
    timestamp: new Date().toISOString(),
    userId,
    conversationId,
    queryId,
    rawResponse: rawResponse, // Log the complete response
    actionPlan: parsedResponse.actionPlan || [],
    sources: parsedResponse.sources || [],
    disclaimer: parsedResponse.disclaimer || '',
    confidence: parsedResponse.confidence || 0
  };

  // Log to response log file
  responseLogger.info('Response received from OpenAI', responseData);
  
  // Also log to console for immediate visibility
  console.log('=== RESPONSE LOGGED ===');
  console.log(`ConversationID: ${conversationId}`);
  console.log(`Response Length: ${rawResponse.length} characters`);
  console.log(`Action Plan Items: ${parsedResponse.actionPlan?.length || 0}`);
  console.log(`Sources: ${parsedResponse.sources?.length || 0}`);
  console.log(`Response: ${rawResponse.substring(0, 200)}...`);
};

module.exports = logResponse;
