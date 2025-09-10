const { generateEmbedding } = require('./openaiService');
const { searchVectorDatabase } = require('./pineconeService');

// Analyze user query to determine legal domain and intent
const analyzeQuery = async (query) => {
  try {
    // This would ideally use NLP or an AI model to properly analyze
    // For now, using a simple keyword-based approach
    const intent = determineIntent(query);
    const entities = extractEntities(query);
    const urgency = determineUrgency(query);
    const complexity = determineComplexity(query);
    
    return {
      intent,
      entities,
      urgency,
      complexity
    };
  } catch (error) {
    console.error('Error analyzing query:', error);
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'legalService.analyzeQuery', {
      queryPreview: query?.substring(0, 100)
    });
    return {
      intent: 'other',
      entities: [],
      urgency: 'medium',
      complexity: 'medium'
    };
  }
};

// Determine the legal intent category of the query
const determineIntent = (query) => {
  const query_lower = query.toLowerCase();
  
  // Criminal law keywords
  if (query_lower.match(/\b(crime|criminal|theft|robbery|murder|assault|bail|arrest|fir|police|ipc)\b/)) {
    return 'criminal';
  }
  
  // Civil law keywords
  if (query_lower.match(/\b(civil|contract|agreement|breach|damages|compensation|tort|negligence)\b/)) {
    return 'civil';
  }
  
  // Constitutional law keywords
  if (query_lower.match(/\b(constitution|fundamental right|directive principle|writ|article|supreme court)\b/)) {
    return 'constitutional';
  }
  
  // Family law keywords
  if (query_lower.match(/\b(marriage|divorce|custody|adoption|maintenance|alimony|succession|inheritance|will)\b/)) {
    return 'family';
  }
  
  // Property law keywords
  if (query_lower.match(/\b(property|land|tenant|landlord|rent|lease|eviction|title|ownership|possession)\b/)) {
    return 'property';
  }
  
  // Labor law keywords
  if (query_lower.match(/\b(employee|employer|salary|wage|termination|dismissal|leave|bonus|pf|esi|gratuity)\b/)) {
    return 'labor';
  }
  
  return 'other';
};

// Extract entities from the query text
const extractEntities = (query) => {
  const entities = [];
  
  // Date extraction (simple pattern)
  const dateMatches = query.match(/\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g);
  if (dateMatches) {
    dateMatches.forEach(date => {
      entities.push({
        type: 'date',
        value: date
      });
    });
  }
  
  // Amount extraction
  const amountMatches = query.match(/\b(Rs\.?\s?\d+(?:,\d+)*(?:\.\d+)?|\d+\s?rupees)\b/gi);
  if (amountMatches) {
    amountMatches.forEach(amount => {
      entities.push({
        type: 'amount',
        value: amount
      });
    });
  }
  
  // Location extraction (simple Indian cities)
  const cities = ['delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'hyderabad', 'ahmedabad', 'pune'];
  cities.forEach(city => {
    if (query.toLowerCase().includes(city)) {
      entities.push({
        type: 'location',
        value: city.charAt(0).toUpperCase() + city.slice(1)
      });
    }
  });
  
  // Legal concept extraction
  const legalConcepts = ['contract', 'tort', 'property', 'lease', 'bail', 'divorce', 'will', 'fir', 'ipc', 'crpc'];
  legalConcepts.forEach(concept => {
    if (query.toLowerCase().includes(concept)) {
      entities.push({
        type: 'legal_concept',
        value: concept
      });
    }
  });
  
  return entities;
};

// Determine the urgency level of the query
const determineUrgency = (query) => {
  const query_lower = query.toLowerCase();
  
  // High urgency keywords
  if (query_lower.match(/\b(immediate|urgent|emergency|arrest|detained|deadline|tomorrow|today|right now)\b/)) {
    return 'high';
  }
  
  // Low urgency keywords
  if (query_lower.match(/\b(future|planning|general|curious|sometime|eventually|later|maybe|might)\b/)) {
    return 'low';
  }
  
  return 'medium';
};

// Determine the complexity level of the query
const determineComplexity = (query) => {
  // Complexity can be determined by the length of the query, the number of legal concepts,
  // and the presence of specialized legal terminology
  
  if (query.length > 300 || query.split(' ').length > 50) {
    return 'high';
  }
  
  if (query.length < 100 || query.split(' ').length < 15) {
    return 'low';
  }
  
  return 'medium';
};

// Search for relevant legal documents
const searchLegalDocuments = async (query, filters = {}) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Search in vector database
    const searchResults = await searchVectorDatabase(queryEmbedding, filters);
    
    // Results are already ranked by relevance from searchVectorDatabase
    return searchResults;
  } catch (error) {
    console.log('Error in searchLegalDocuments, returning empty results:', error.message);
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'legalService.searchLegalDocuments', {
      queryPreview: query?.substring(0, 100),
      filters: JSON.stringify(filters)
    });
    return [];
  }
};

module.exports = {
  analyzeQuery,
  searchLegalDocuments
};
