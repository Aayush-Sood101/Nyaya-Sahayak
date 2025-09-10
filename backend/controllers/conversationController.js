const Conversation = require('../models/conversationModel');
const Query = require('../models/queryModel');
const Response = require('../models/responseModel');

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title status createdAt updatedAt');
    
    return res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get a single conversation with messages
const getConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    const conversation = await Conversation.findOne({ _id: id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Get all queries and responses for this conversation
    const queries = await Query.find({ conversationId: id }).sort({ createdAt: 1 });
    
    // Get all response IDs
    const responseIds = queries.map(q => q.responseId).filter(id => id);
    
    // Get all responses
    const responses = await Response.find({ _id: { $in: responseIds } });
    
    // Map responses to queries
    const messages = queries.map(query => {
      const response = responses.find(r => r._id.toString() === query.responseId?.toString());
      return {
        query: {
          id: query._id,
          text: query.text,
          createdAt: query.createdAt
        },
        response: response ? {
          id: response._id,
          text: response.text,
          actionPlan: response.actionPlan,
          sources: response.sources,
          disclaimer: response.disclaimer,
          createdAt: response.createdAt
        } : null
      };
    });
    
    return res.status(200).json({
      success: true,
      data: {
        id: conversation._id,
        title: conversation.title,
        status: conversation.status,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    const newConversation = new Conversation({
      userId,
      title: title || 'New Conversation',
    });
    
    await newConversation.save();
    
    return res.status(201).json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message
    });
  }
};

// Update a conversation
const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    const conversation = await Conversation.findOne({ _id: id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Update fields
    if (title) conversation.title = title;
    if (status) conversation.status = status;
    
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    return res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating conversation',
      error: error.message
    });
  }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    const conversation = await Conversation.findOne({ _id: id, userId });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Delete conversation and all associated queries and responses
    await Query.deleteMany({ conversationId: id });
    
    // Get all query IDs for this conversation
    const queries = await Query.find({ conversationId: id });
    const responseIds = queries.map(q => q.responseId).filter(id => id);
    
    // Delete responses
    await Response.deleteMany({ _id: { $in: responseIds } });
    
    // Delete conversation
    await Conversation.deleteOne({ _id: id });
    
    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
};

module.exports = {
  getUserConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
};
