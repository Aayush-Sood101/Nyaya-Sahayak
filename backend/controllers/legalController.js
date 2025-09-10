const { generateResponse } = require('../services/responseService');
const { searchLegalDocuments } = require('../services/legalService');

// Process a legal query and generate a response
const processQuery = async (req, res) => {
  try {
    console.log('Received query request:', req.body);
    const { query, conversationId } = req.body;
    // const userId = req.user.id; // Commented out for testing
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Query text is required' 
      });
    }
    
    console.log('Processing query:', query, 'for conversation:', conversationId);
    
    // Generate and structure response
    const result = await generateResponse(query, null, conversationId);
    
    console.log('Generated response successfully:', result ? 'Response available' : 'No response');
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing query:', error);
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'legalController.processQuery', { 
      queryText: req.body.query?.substring(0, 100), 
      conversationId: req.body.conversationId 
    });
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
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'legalController.searchDocuments', { 
      queryText: req.query.query?.substring(0, 100), 
      filters: req.query.filters 
    });
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
