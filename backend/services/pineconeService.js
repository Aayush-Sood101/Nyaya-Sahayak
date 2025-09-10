const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// --- Initialization ---
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone client ONCE and reuse it.
let pinecone;
let index;
let pineconeAvailable = false;

try {
  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  
  // Select the Pinecone index
  index = pinecone.index(process.env.PINECONE_INDEX_NAME);
  
  // Test the connection (will be handled asynchronously)
  (async () => {
    try {
      // Simple test to check if the index exists
      await index.describeIndexStats();
      pineconeAvailable = true;
      console.log('Successfully connected to Pinecone index:', process.env.PINECONE_INDEX_NAME);
    } catch (error) {
      console.log('Pinecone vector database not available. Using mock data instead.');
      const logError = require('../utils/logger/errorLogger');
      logError(error, 'pineconeService.initializePinecone', {
        indexName: process.env.PINECONE_INDEX_NAME,
        message: 'Failed to connect to Pinecone index'
      });
      pineconeAvailable = false;
    }
  })();
} catch (error) {
  console.log('Error initializing Pinecone client. Using mock data instead.');
  const logError = require('../utils/logger/errorLogger');
  logError(error, 'pineconeService.initialization', {
    message: 'Failed to initialize Pinecone client'
  });
  pineconeAvailable = false;
}

// --- Functions ---

/**
 * Generates a vector embedding for a given text using OpenAI.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    // The embedding is directly in response.data[0].embedding
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'pineconeService.generateEmbedding', {
      textPreview: text?.substring(0, 100),
      model: "text-embedding-3-small"
    });
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Searches the Pinecone vector database with a query embedding.
 * @param {number[]} queryEmbedding - The vector to search with.
 * @param {object} filters - Optional metadata filters.
 * @param {number} topK - The number of results to return.
 * @returns {Promise<object[]>} - An array of search results.
 */
const searchVectorDatabase = async (queryEmbedding, filters = {}, topK = 5) => {
  // If Pinecone is not available, return mock data
  if (!pineconeAvailable) {
    console.log('Using mock vector search results');
    return getMockSearchResults(filters);
  }
  
  try {
    // The query structure is now flatter. No need for a nested 'queryRequest' object.
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      filter: Object.keys(filters).length > 0 ? filters : undefined, // Add filter only if it exists
      includeMetadata: true,
    });

    // Map the results to a cleaner format
    return queryResponse.matches.map(match => ({
      score: match.score,
      text: match.metadata.text, // Assuming your metadata has a 'text' field
      metadata: match.metadata
    }));
  } catch (error) {
    console.log('Error searching vector database, using mock data');
    const logError = require('../utils/logger/errorLogger');
    logError(error, 'pineconeService.searchVectorDatabase', {
      filters: JSON.stringify(filters),
      topK,
      usingMockData: true
    });
    return getMockSearchResults(filters);
  }
};

/**
 * Returns mock search results when Pinecone is not available
 * @param {object} filters - Optional metadata filters to customize mock results
 * @returns {Array} - An array of mock search results
 */
const getMockSearchResults = (filters = {}) => {
  // Different mock results based on filter type if available
  const intent = filters.source_type || 'general';
  
  const mockResults = {
    criminal: [
      {
        score: 0.95,
        text: "According to the Indian Penal Code (IPC), criminal offenses are categorized based on severity, with different sections addressing various crimes. Filing a police complaint (FIR) is the first step in criminal proceedings.",
        metadata: {
          title: "Criminal Law Overview",
          source: "Indian Penal Code",
          document_type: "Legal Code",
          source_type: "law",
          date: "2023"
        }
      },
      {
        score: 0.89,
        text: "Bail provisions are outlined in Sections 436-439 of the Criminal Procedure Code (CrPC). Bail is a right in bailable offenses, while courts have discretion in non-bailable cases.",
        metadata: {
          title: "Bail Provisions",
          source: "Criminal Procedure Code",
          document_type: "Legal Code",
          source_type: "law",
          date: "2023"
        }
      }
    ],
    constitution: [
      {
        score: 0.92,
        text: "Fundamental Rights are enshrined in Part III of the Indian Constitution (Articles 12-35). These include Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.",
        metadata: {
          title: "Fundamental Rights",
          source: "Indian Constitution",
          document_type: "Constitution",
          source_type: "constitution",
          date: "2023"
        }
      }
    ],
    civil: [
      {
        score: 0.91,
        text: "Civil disputes in India are governed by various laws including the Civil Procedure Code, Contract Act, and specific legislation depending on the nature of the dispute. Resolution mechanisms include negotiation, mediation, arbitration, and litigation.",
        metadata: {
          title: "Civil Dispute Resolution",
          source: "Civil Procedure Code",
          document_type: "Legal Guide",
          source_type: "law",
          date: "2023"
        }
      }
    ],
    property: [
      {
        score: 0.90,
        text: "Property rights in India are governed by various laws including the Transfer of Property Act, Registration Act, and state-specific land revenue laws. Documentation like sale deeds, gift deeds, and wills are crucial for property transfers.",
        metadata: {
          title: "Property Law Overview",
          source: "Transfer of Property Act",
          document_type: "Legal Guide",
          source_type: "law",
          date: "2023"
        }
      }
    ],
    family: [
      {
        score: 0.93,
        text: "Family law in India varies based on personal laws applicable to different religious communities. Hindu Marriage Act, Muslim Personal Law, Christian Marriage Act, and Special Marriage Act govern marriage, divorce, inheritance, and custody matters for their respective communities.",
        metadata: {
          title: "Family Law Overview",
          source: "Personal Laws Compendium",
          document_type: "Legal Guide",
          source_type: "law",
          date: "2023"
        }
      }
    ],
    general: [
      {
        score: 0.88,
        text: "The Indian legal system is a hybrid system based on common law traditions inherited from the British colonial era, combined with statutory law, customary law, and religious laws applicable to different communities.",
        metadata: {
          title: "Indian Legal System",
          source: "Legal Framework Guide",
          document_type: "Overview",
          source_type: "guide",
          date: "2023"
        }
      },
      {
        score: 0.85,
        text: "Legal aid services in India are provided under the Legal Services Authorities Act to ensure access to justice for all citizens, particularly the disadvantaged sections of society.",
        metadata: {
          title: "Legal Aid in India",
          source: "Legal Services Authorities Act",
          document_type: "Guide",
          source_type: "law",
          date: "2023"
        }
      }
    ]
  };
  
  // Return the appropriate mock results based on the intent filter
  if (intent === 'constitution') return mockResults.constitution;
  if (intent === 'criminal' || intent === 'law' && filters.document_type === 'Code') return mockResults.criminal;
  if (intent === 'civil' || intent === 'law') return mockResults.civil;
  if (intent === 'property') return mockResults.property;
  if (intent === 'family') return mockResults.family;
  
  // Default to general results
  return mockResults.general;
};

// The rankResults function is removed as Pinecone already returns results sorted by relevance.

module.exports = {
  generateEmbedding,
  searchVectorDatabase,
  getMockSearchResults
};