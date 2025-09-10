const { generateResponse } = require('../services/responseService');
const { searchLegalDocuments } = require('../services/legalService');

// Process a legal query and generate a response
const processQuery = async (req, res) => {
  try {
    const { query, conversationId } = req.body;
    const userId = req.user.id; // Assuming user info is added by auth middleware
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query text is required' 
      });
    }
    
    // Generate and structure response
    const result = await generateResponse(query, userId, conversationId);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing legal query',
      error: error.message
    });
  }
};

// Search for legal documents directly
const searchDocuments = async (req, res) => {
  try {
    const { query, filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }
    
    // Parse filters if provided
    const parsedFilters = filters ? JSON.parse(filters) : {};
    
    // Search for documents
    const results = await searchLegalDocuments(query, parsedFilters);
    
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching legal documents',
      error: error.message
    });
  }
};

module.exports = {
  processQuery,
  searchDocuments
};
