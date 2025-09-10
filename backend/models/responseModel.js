const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  queryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Query',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  actionPlan: [{
    step: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  sources: [{
    sourceType: {
      type: String,
      enum: ['law', 'scheme', 'faq', 'guide', 'constitution'],
      required: true
    },
    sourceName: {
      type: String,
      required: true
    },
    sourceUrl: {
      type: String
    },
    relevance: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  disclaimer: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
