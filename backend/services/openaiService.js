const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const logPrompt = require('../utils/logger/promptLogger');
const logResponse = require('../utils/logger/responseLogger');
const logError = require('../utils/logger/errorLogger');

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
    logError(error, 'openaiService.generateEmbedding');
    throw new Error('Failed to generate embedding');
  }
};

// Generate legal advice response
const generateLegalAdvice = async (query, documents, userId = null, conversationId = null) => {
  try {
    // Prepare context from documents
    const context = documents.map(doc => {
      const sourceName = doc.metadata.source_name || doc.metadata.source || "Unknown Source";
      const sourceType = doc.metadata.source_type || "Unknown Type";
      const sourceUrl = doc.metadata.source_url || "";
      
      return `Source: ${sourceName} (${sourceType})
Content: ${doc.text}
${sourceUrl ? `URL: ${sourceUrl}` : ''}
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

    // Log the prompt with full context
    console.log('Logging prompt with full context...');
    logPrompt(query, documents, userId, conversationId);

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a legal assistant providing structured advice based on Indian law." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = response.choices[0].message.content;
    console.log('Received response from OpenAI, length:', responseContent.length);
    
    // Parse the response
    console.log('Parsing response into structured format...');
    const parsedResponse = parseResponseIntoStructure(responseContent);
    
    // Log the response with complete details
    console.log('Logging complete response...');
    logResponse(responseContent, parsedResponse, userId, conversationId);

    return responseContent;
  } catch (error) {
    console.error('Error in generateLegalAdvice:', error.message);
    logError(error, 'openaiService.generateLegalAdvice', { query, documentCount: documents?.length });
    throw new Error('Failed to generate legal advice');
  }
};

// Parse the response into structured format
const parseResponseIntoStructure = (rawResponse) => {
  try {
    console.log('Raw response to parse:', rawResponse.substring(0, 100) + '...');
    
    let disclaimer = "";
    let actionPlan = [];
    let sources = [];
    
    // Extract disclaimer
    const disclaimerMatch = rawResponse.match(/disclaimer:?.*?((?:.|\n)*?)(?:\n\n|$)/i);
    if (disclaimerMatch) {
      console.log('Found disclaimer');
      disclaimer = disclaimerMatch[1].trim();
    } else {
      console.log('No disclaimer found, using default');
      disclaimer = "This is not legal advice. Please consult a qualified lawyer for specific legal counsel.";
    }

    // Extract action plan steps - try different patterns
    const actionPlanSection = rawResponse.match(/action plan|steps to take:?(?:\n|)((?:.|\n)*?)(?:\n\n\d|disclaimer|$)/i);
    
    if (actionPlanSection && actionPlanSection[1]) {
      console.log('Found action plan section');
      const actionSteps = actionPlanSection[1].match(/\d+\.\s+(?:\[([^\]]+)\]:\s+|)(.+?)(?=\n\d+\.|$)/gs);
      
      if (actionSteps) {
        console.log(`Found ${actionSteps.length} action steps`);
        actionSteps.forEach((step, index) => {
          const stepMatch = step.match(/\d+\.\s+(?:\[([^\]]+)\]:\s+|)(.+)/s);
          if (stepMatch) {
            const title = stepMatch[1] || `Step ${index + 1}`;
            const description = stepMatch[2].trim();
            actionPlan.push({
              step: index + 1,
              title: title,
              description: description,
              priority: "medium" // Default priority
            });
          }
        });
      } else {
        // Fallback - try to find any numbered list
        console.log('No formatted action steps found, looking for any numbered list');
        const numList = actionPlanSection[1].match(/\d+\.\s+(.+?)(?=\n\d+\.|$)/gs);
        if (numList) {
          numList.forEach((item, index) => {
            const content = item.replace(/^\d+\.\s+/, '').trim();
            actionPlan.push({
              step: index + 1,
              title: `Step ${index + 1}`,
              description: content,
              priority: "medium"
            });
          });
        }
      }
    }

    // If still no action plan, create a generic one
    if (actionPlan.length === 0) {
      console.log('Creating generic action plan');
      actionPlan = [
        {
          step: 1,
          title: "Understand Your Rights",
          description: "Research applicable laws and regulations related to your situation.",
          priority: "high"
        },
        {
          step: 2,
          title: "Consult a Lawyer",
          description: "Seek professional legal advice specific to your circumstances.",
          priority: "medium"
        },
        {
          step: 3,
          title: "Document Everything",
          description: "Keep records of all communication and relevant documents.",
          priority: "medium"
        }
      ];
    }

    // Extract sources
    const sourcesMatch = rawResponse.match(/sources|references:?(?:\n|)((?:.|\n)*?)(?=\n\n|disclaimer|$)/i);
    if (sourcesMatch && sourcesMatch[1]) {
      console.log('Found sources section');
      const sourceItems = sourcesMatch[1].match(/(?:[-•*]\s+|(?:\d+\.\s+))(.+?)(?=\n[-•*]|\n\d+\.|$)/gs);
      
      if (sourceItems) {
        sourceItems.forEach(item => {
          const content = item.replace(/^[-•*\d.]\s+/, '').trim();
          
          // Try to extract source name and URL if present
          const sourceUrlMatch = content.match(/(.*?)(?:\s*\(([^)]+)\)|\s*-\s*([^)]+)|$)/);
          
          sources.push({
            sourceType: determineSourceType(sourceUrlMatch[1] || content),
            sourceName: sourceUrlMatch[1] || content,
            sourceUrl: sourceUrlMatch[2] || sourceUrlMatch[3] || "",
            relevance: 0.9 // Default relevance
          });
        });
      }
    }

    // If no sources found, create generic ones
    if (sources.length === 0) {
      console.log('Creating generic sources');
      sources = [
        {
          sourceType: "law",
          sourceName: "Relevant Indian Legal Code",
          sourceUrl: "",
          relevance: 0.9
        },
        {
          sourceType: "guide",
          sourceName: "Legal Aid Resources",
          sourceUrl: "",
          relevance: 0.8
        }
      ];
    }

    console.log(`Parsing complete: ${actionPlan.length} actions, ${sources.length} sources, disclaimer: ${disclaimer.substring(0, 30)}...`);
    
    return {
      text: rawResponse,
      actionPlan,
      sources,
      disclaimer,
      confidence: 0.8 // Default confidence score
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    logError(error, 'openaiService.parseResponseIntoStructure', {
      rawResponsePreview: rawResponse.substring(0, 200),
      responseLength: rawResponse.length
    });
    return {
      text: rawResponse,
      actionPlan: [
        {
          step: 1,
          title: "Understand Your Rights",
          description: "Research applicable laws and regulations related to your situation.",
          priority: "high"
        },
        {
          step: 2,
          title: "Consult a Lawyer",
          description: "Seek professional legal advice specific to your circumstances.",
          priority: "medium"
        },
        {
          step: 3,
          title: "Document Everything",
          description: "Keep records of all communication and relevant documents.",
          priority: "medium"
        }
      ],
      sources: [
        {
          sourceType: "law",
          sourceName: "Relevant Indian Legal Code",
          sourceUrl: "",
          relevance: 0.9
        }
      ],
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
