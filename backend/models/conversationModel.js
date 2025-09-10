const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Temporarily making userId optional for testing
    // required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Conversation'
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query'
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  summary: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
