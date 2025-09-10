const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings for query
const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

// Generate legal advice response
const generateLegalAdvice = async (query, documents) => {
  try {
    // Prepare context from documents
    const context = documents.map(doc => {
      return `Source: ${doc.metadata.source_name} (${doc.metadata.source_type})
Content: ${doc.text}
${doc.metadata.source_url ? `URL: ${doc.metadata.source_url}` : ''}
---`;
    }).join('\n');
    
    // Create the prompt for GPT
    const prompt = `
You are a legal assistant helping with Indian legal queries. Use the provided legal document context to generate structured advice.

USER QUERY: ${query}

LEGAL CONTEXT:
${context}

Please provide a response in the following format:
1. A brief introduction to the legal issue
2. A structured action plan with numbered steps (at least 3, maximum 5 steps)
3. Citations to relevant laws or documents
4. A brief legal disclaimer

FORMAT THE ACTION PLAN LIKE THIS:
1. [ACTION TITLE]: [Brief description of what to do]
2. [ACTION TITLE]: [Brief description of what to do]
3. [ACTION TITLE]: [Brief description of what to do]

IMPORTANT GUIDELINES:
- Be specific and actionable
- Provide practical steps the user can take
- Cite relevant laws or regulations
- Include a disclaimer that this is not legal advice and recommend consulting a lawyer for complex issues
- Do not provide advice that could be legally problematic
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a legal assistant providing structured advice based on Indian law." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating legal advice:', error);
    throw new Error('Failed to generate legal advice');
  }
};

// Parse the response into structured format
const parseResponseIntoStructure = (rawResponse) => {
  try {
    let disclaimer = "";
    const actionPlanRegex = /(\d+)\.\s+\[([^\]]+)\]:\s+(.+?)(?=\d+\.\s+\[|\n\n|$)/gs;
    
    // Extract disclaimer
    const disclaimerMatch = rawResponse.match(/disclaimer:?.*?((?:.|\n)*?)(?:\n\n|$)/i);
    if (disclaimerMatch) {
      disclaimer = disclaimerMatch[1].trim();
    }

    // Extract action plan steps
    const actionPlan = [];
    let match;
    while ((match = actionPlanRegex.exec(rawResponse)) !== null) {
      actionPlan.push({
        step: parseInt(match[1]),
        title: match[2].trim(),
        description: match[3].trim(),
        priority: "medium" // Default priority
      });
    }

    // Extract sources
    const sources = [];
    const sourceRegex = /(?:citing|reference|source|according to):\s*([^,\.]+)(?:[,\.]|\s+\(([^)]+)\))/gi;
    let sourceMatch;
    while ((sourceMatch = sourceRegex.exec(rawResponse)) !== null) {
      sources.push({
        sourceType: determineSourceType(sourceMatch[1]),
        sourceName: sourceMatch[1].trim(),
        sourceUrl: sourceMatch[2] ? sourceMatch[2].trim() : "",
        relevance: 0.9 // Default relevance
      });
    }

    return {
      text: rawResponse,
      actionPlan,
      sources,
      disclaimer,
      confidence: 0.8 // Default confidence score
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    return {
      text: rawResponse,
      actionPlan: [],
      sources: [],
      disclaimer: "This is not legal advice. Please consult a qualified lawyer for specific legal counsel.",
      confidence: 0.5
    };
  }
};

// Determine source type based on name
const determineSourceType = (sourceName) => {
  const lowerName = sourceName.toLowerCase();
  if (lowerName.includes('constitution')) return 'constitution';
  if (lowerName.includes('act') || lowerName.includes('code') || lowerName.includes('law')) return 'law';
  if (lowerName.includes('scheme') || lowerName.includes('yojana')) return 'scheme';
  if (lowerName.includes('faq')) return 'faq';
  return 'guide';
};

module.exports = {
  generateEmbedding,
  generateLegalAdvice,
  parseResponseIntoStructure
};
