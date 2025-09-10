const { generateLegalAdvice, parseResponseIntoStructure } = require('./openaiService');
const { searchLegalDocuments, analyzeQuery } = require('./legalService');
const Response = require('../models/responseModel');
const Query = require('../models/queryModel');

// Generate structured response to legal query
const generateResponse = async (queryText, userId, conversationId) => {
  try {
    // Analyze the query
    const queryAnalysis = await analyzeQuery(queryText);
    
    // Create and save the query
    const newQuery = new Query({
      conversationId,
      userId,
      text: queryText,
      intent: queryAnalysis.intent,
      entities: queryAnalysis.entities,
      urgency: queryAnalysis.urgency,
      complexity: queryAnalysis.complexity
    });
    
    await newQuery.save();
    
    // Build search filters based on query analysis
    const filters = buildSearchFilters(queryAnalysis);
    
    // Search for relevant legal documents
    const relevantDocuments = await searchLegalDocuments(queryText, filters);
    
    // Generate advice using OpenAI
    const rawAdvice = await generateLegalAdvice(queryText, relevantDocuments);
    
    // Parse the response into structured format
    const structuredResponse = parseResponseIntoStructure(rawAdvice);
    
    // Save the response
    const newResponse = new Response({
      queryId: newQuery._id,
      text: structuredResponse.text,
      actionPlan: structuredResponse.actionPlan,
      sources: structuredResponse.sources,
      disclaimer: structuredResponse.disclaimer,
      confidence: structuredResponse.confidence
    });
    
    await newResponse.save();
    
    // Update the query with the response ID
    newQuery.responseId = newResponse._id;
    await newQuery.save();
    
    return {
      query: newQuery,
      response: newResponse
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
};

// Build search filters based on query analysis
const buildSearchFilters = (queryAnalysis) => {
  const filters = {};
  
  // Add filter for language (default to English)
  filters.language = 'en';
  
  // Filter by legal domain if identified
  if (queryAnalysis.intent !== 'other') {
    // Map intent to source_type or other metadata field
    switch (queryAnalysis.intent) {
      case 'criminal':
        filters.source_type = 'law';
        filters.document_type = 'Code';
        break;
      case 'constitutional':
        filters.source_type = 'constitution';
        break;
      case 'family':
      case 'property':
      case 'civil':
      case 'labor':
        filters.source_type = 'law';
        break;
      default:
        // No specific filter
    }
  }
  
  return filters;
};

// Validate the response for quality and safety
const validateResponse = (response) => {
  try {
    // Check if response has action plan
    if (!response.actionPlan || response.actionPlan.length === 0) {
      return {
        valid: false,
        reason: 'Missing action plan'
      };
    }
    
    // Check if response has disclaimer
    if (!response.disclaimer) {
      return {
        valid: false,
        reason: 'Missing disclaimer'
      };
    }
    
    // Check for potentially harmful advice
    const harmfulKeywords = ['illegal', 'unlawful', 'avoid authorities', 'evade', 'fake'];
    
    for (const keyword of harmfulKeywords) {
      if (response.text.toLowerCase().includes(keyword)) {
        return {
          valid: false,
          reason: 'Potentially harmful advice detected'
        };
      }
    }
    
    return {
      valid: true
    };
  } catch (error) {
    console.error('Error validating response:', error);
    return {
      valid: false,
      reason: 'Validation error'
    };
  }
};

module.exports = {
  generateResponse,
  validateResponse
};
