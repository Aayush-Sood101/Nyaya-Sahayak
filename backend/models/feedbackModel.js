const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comments: {
    type: String
  },
  improvementAreas: [{
    type: String,
    enum: ['accuracy', 'relevance', 'clarity', 'actionability', 'completeness']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
