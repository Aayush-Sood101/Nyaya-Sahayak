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

// Create prompt logger
const promptLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'prompts.log') })
  ]
});

// Log prompt function
const logPrompt = (query, context, userId = null, conversationId = null) => {
  const promptData = {
    timestamp: new Date().toISOString(),
    userId,
    conversationId,
    query,
    context: Array.isArray(context) 
      ? context.map(doc => ({
          source_type: doc.metadata?.source_type || doc.metadata?.sourceType || 'unknown',
          source_name: doc.metadata?.source_name || doc.metadata?.source || 'unknown',
          text: doc.text || 'No text provided' // Log the complete text
        }))
      : context
  };

  // Log to prompt log file
  promptLogger.info('Prompt sent to OpenAI', promptData);
  
  // Also log to console for immediate visibility
  console.log('=== PROMPT LOGGED ===');
  console.log(`Query: ${query}`);
  console.log(`ConversationID: ${conversationId}`);
  console.log(`Context Sources: ${Array.isArray(context) ? context.length : 'N/A'}`);
};

module.exports = logPrompt;
