const Feedback = require('../models/feedbackModel');
const Response = require('../models/responseModel');

// Submit feedback for a response
const submitFeedback = async (req, res) => {
  try {
    const { responseId, rating, comments, improvementAreas } = req.body;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    if (!responseId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response ID and rating are required' 
      });
    }
    
    // Check if response exists
    const response = await Response.findById(responseId);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }
    
    // Check if user already submitted feedback for this response
    const existingFeedback = await Feedback.findOne({ userId, responseId });
    
    if (existingFeedback) {
      // Update existing feedback
      existingFeedback.rating = rating;
      existingFeedback.comments = comments || existingFeedback.comments;
      existingFeedback.improvementAreas = improvementAreas || existingFeedback.improvementAreas;
      
      await existingFeedback.save();
      
      return res.status(200).json({
        success: true,
        message: 'Feedback updated successfully',
        data: existingFeedback
      });
    }
    
    // Create new feedback
    const newFeedback = new Feedback({
      userId,
      responseId,
      rating,
      comments,
      improvementAreas
    });
    
    await newFeedback.save();
    
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: newFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// Get feedback for a response
const getResponseFeedback = async (req, res) => {
  try {
    const { responseId } = req.params;
    
    const feedback = await Feedback.find({ responseId });
    
    // Calculate average rating
    const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = feedback.length > 0 ? totalRating / feedback.length : 0;
    
    // Count improvement areas
    const improvementAreaCounts = {};
    feedback.forEach(item => {
      if (item.improvementAreas && item.improvementAreas.length > 0) {
        item.improvementAreas.forEach(area => {
          improvementAreaCounts[area] = (improvementAreaCounts[area] || 0) + 1;
        });
      }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        feedback,
        stats: {
          count: feedback.length,
          averageRating,
          improvementAreaCounts
        }
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

module.exports = {
  submitFeedback,
  getResponseFeedback
};
