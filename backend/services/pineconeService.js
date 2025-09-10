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
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Select the Pinecone index
// This should match the name in your .env file and Pinecone console
const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

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
    console.error('Error searching vector database:', error);
    throw new Error('Failed to search vector database');
  }
};

// The rankResults function is removed as Pinecone already returns results sorted by relevance.

module.exports = {
  generateEmbedding,
  searchVectorDatabase,
};