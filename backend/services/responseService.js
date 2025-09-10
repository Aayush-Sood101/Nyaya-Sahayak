const { generateLegalAdvice, parseResponseIntoStructure } = require('./openaiService');
const { searchLegalDocuments, analyzeQuery } = require('./legalService');
const Response = require('../models/responseModel');
const Query = require('../models/queryModel');

// Generate structured response to legal query
const generateResponse = async (queryText, userId, conversationId) => {
  try {
    console.log('Starting generateResponse for query:', queryText);
    
    // Analyze the query
    const queryAnalysis = await analyzeQuery(queryText);
    console.log('Query analysis:', queryAnalysis);
    
    // Create and save the query
    const queryData = {
      conversationId,
      text: queryText,
      intent: queryAnalysis.intent,
      entities: queryAnalysis.entities,
      urgency: queryAnalysis.urgency,
      complexity: queryAnalysis.complexity
    };
    
    // Add userId only if it's provided
    if (userId) {
      queryData.userId = userId;
    }
    
    console.log('Creating new query with data:', queryData);
    const newQuery = new Query(queryData);
    
    await newQuery.save();
    console.log('Query saved with ID:', newQuery._id);
    
    // Build search filters based on query analysis
    const filters = buildSearchFilters(queryAnalysis);
    console.log('Built search filters:', filters);
    
    // Search for relevant legal documents (now with error handling)
    let relevantDocuments = [];
    try {
      console.log('Searching for legal documents...');
      relevantDocuments = await searchLegalDocuments(queryText, filters);
      console.log('Found relevant documents:', relevantDocuments.length);
    } catch (error) {
      console.error('Error searching for legal documents:', error);
      const logError = require('../utils/logger/errorLogger');
      logError(error, 'responseService.searchLegalDocuments', { 
        queryText, 
        filters 
      });
      // Provide fallback empty documents
      relevantDocuments = [];
    }
    
    // Generate advice using OpenAI (with error handling)
    let rawAdvice = '';
    try {
      console.log('Generating legal advice with OpenAI...');
      rawAdvice = await generateLegalAdvice(queryText, relevantDocuments);
      console.log('Received raw advice from OpenAI, length:', rawAdvice.length);
    } catch (error) {
      console.error('Error generating legal advice:', error);
      const logError = require('../utils/logger/errorLogger');
      logError(error, 'responseService.generateLegalAdvice', { 
        queryTextPreview: queryText?.substring(0, 100), 
        documentCount: relevantDocuments?.length 
      });
      // Provide a fallback response
      rawAdvice = `I apologize, but I'm currently experiencing issues with my knowledge database. Here are some general suggestions:

1. [Document Your Situation]: Write down all relevant facts and dates.
2. [Consult a Lawyer]: For personalized legal advice, consider speaking with a qualified attorney.
3. [Research Online]: Look for information on government websites or legal aid organizations.

Disclaimer: This is a general response and not specific legal advice. Always consult with a qualified legal professional for advice on your specific situation.`;
    }
    
    // Parse the response into structured format
    console.log('Parsing response into structured format...');
    const structuredResponse = parseResponseIntoStructure(rawAdvice);
    console.log('Structured response:', 
      'text length:', structuredResponse.text?.length,
      'action plan items:', structuredResponse.actionPlan?.length,
      'sources:', structuredResponse.sources?.length
    );
    
    // Save the response
    console.log('Creating new response...');
    const newResponse = new Response({
      queryId: newQuery._id,
      text: structuredResponse.text,
      actionPlan: structuredResponse.actionPlan,
      sources: structuredResponse.sources,
      disclaimer: structuredResponse.disclaimer,
      confidence: structuredResponse.confidence
    });
    
    await newResponse.save();
    console.log('Response saved with ID:', newResponse._id);
    
    // Update the query with the response ID
    newQuery.responseId = newResponse._id;
    await newQuery.save();
    console.log('Query updated with response ID');
    
    const result = {
      query: newQuery,
      response: newResponse
    };
    
    console.log('Returning complete result from generateResponse');
    return result;
  } catch (error) {
    console.error('Error generating response:', error);
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'responseService.generateResponse', { 
      queryText: queryText?.substring(0, 100), 
      conversationId, 
      userId 
    });
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
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'responseService.validateResponse', {
      responsePreview: response?.text?.substring(0, 100),
      hasActionPlan: !!response?.actionPlan,
      hasDisclaimer: !!response?.disclaimer
    });
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
