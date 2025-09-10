const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Use our custom error logger
    const logError = require('./utils/logger/errorLogger');
    logError(err, 'server.mongodbConnection', {
      uri: process.env.MONGODB_URI?.replace(/mongodb\+srv:\/\/[^:]+:[^@]+@/, 'mongodb+srv://****:****@')
    });
  });

// Import routes
const legalRoutes = require('./routes/legalRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Use routes
app.use('/api/legal', legalRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/feedback', feedbackRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Use our custom error logger
  const logError = require('./utils/logger/errorLogger');
  logError(err, 'server.errorMiddleware', {
    path: req.path,
    method: req.method,
    body: JSON.stringify(req.body).substring(0, 200),
    query: JSON.stringify(req.query)
  });
  
  // Send appropriate response
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
