const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  text: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    enum: ['criminal', 'civil', 'constitutional', 'family', 'property', 'labor', 'other'],
    default: 'other'
  },
  entities: [{
    type: {
      type: String,
      enum: ['date', 'amount', 'location', 'person', 'legal_concept'],
    },
    value: {
      type: String
    }
  }],
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  complexity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);
