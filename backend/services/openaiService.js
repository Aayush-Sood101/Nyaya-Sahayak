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

Provide your response with clear section headings and well-structured content. DO NOT include an "Action Plan" section in your main response text. Instead, focus on explaining the legal principles, relevant laws, and an overall assessment of the situation.

Your response should include these sections:
1. Introduction - A brief overview of the legal issue
2. Relevant Legal Principles - Explanation of the legal concepts that apply
3. Applicable Laws - Citations to specific Indian laws, regulations, or precedents
4. Legal Disclaimer - Standard disclaimer about this not being legal advice

IMPORTANT: Do NOT include any numbered action steps, action plans, or "steps to take" in your response. Action plans will be generated separately.

IMPORTANT GUIDELINES:
- Be specific and clear in your explanations
- Cite relevant Indian laws and regulations
- Include a disclaimer that this is not legal advice
- Do not provide advice that could be legally problematic
- Keep your response concise and organized with clear headings
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
const parseResponseIntoStructure = async (rawResponse, queryText) => {
  try {
    console.log('Raw response to parse:', rawResponse.substring(0, 100) + '...');
    
    let disclaimer = "";
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

    // Extract sources from the main response
    const relevantLawsMatch = rawResponse.match(/(?:relevant laws|sources|references|citations):?(?:\n|)((?:.|\n)*?)(?=\n\n|disclaimer|$)/i);
    if (relevantLawsMatch && relevantLawsMatch[1]) {
      console.log('Found sources section');
      
      // Try to match bullet points, numbered items, or hyphenated items
      const sourceItems = relevantLawsMatch[1].match(/(?:[-•*]\s+|(?:\d+\.\s+))(.+?)(?=\n[-•*]|\n\d+\.|$)/gs);
      
      if (sourceItems && sourceItems.length > 0) {
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
      } else {
        // If no bullet points, just split by newlines
        const lines = relevantLawsMatch[1].split('\n').filter(line => line.trim().length > 0);
        lines.forEach(line => {
          sources.push({
            sourceType: determineSourceType(line),
            sourceName: line.trim(),
            sourceUrl: "",
            relevance: 0.9
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
    
    // Generate action plan as a separate step
    console.log('Generating action plan separately...');
    const actionPlan = await generateActionPlan(queryText, rawResponse);
    
    console.log(`Parsing complete: ${actionPlan.length} actions, ${sources.length} sources, disclaimer length: ${disclaimer.length}`);
    
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
      responseLength: rawResponse.length,
      queryPreview: queryText?.substring(0, 100)
    });
    
    // Create default action plan
    const defaultActionPlan = [
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
        priority: "low"
      }
    ];
    
    return {
      text: rawResponse,
      actionPlan: defaultActionPlan,
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

// Generate action plan from the response
const generateActionPlan = async (queryText, responseText) => {
  try {
    console.log('Generating action plan from response');
    
    // Create the prompt for generating just the action plan
    const actionPlanPrompt = `
You are a legal assistant helping to create an ACTION PLAN for a legal query.

USER QUERY: ${queryText}

RESPONSE CONTENT: 
${responseText}

Based on the legal response above, create a structured action plan with 3-5 specific steps the user should take.

Your output should ONLY include the action plan steps in this format:
1. [ACTION TITLE]: Detailed explanation of the first action to take
2. [ACTION TITLE]: Detailed explanation of the second action to take
3. [ACTION TITLE]: Detailed explanation of the third action to take

Make sure the format is EXACTLY as shown, with numbers, square brackets around the title, and a colon separator.

For each step:
- Be specific and actionable
- Focus on practical actions the user can take
- Prioritize the most important steps first
- Provide enough detail for the user to understand what to do
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a legal assistant creating structured action plans based on legal advice." },
        { role: "user", content: actionPlanPrompt }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const actionPlanText = response.choices[0].message.content;
    console.log('Generated action plan text:', actionPlanText);
    
    // Parse the action plan text into structured format
    const actionPlan = [];
    
    // First try with bracket format
    let actionSteps = actionPlanText.match(/\d+\.\s+\[([^\]]+)\]:\s+(.+?)(?=\n\d+\.|\n\n|$)/gs);
    
    if (!actionSteps || actionSteps.length === 0) {
      // Try alternative format without brackets (e.g., "1. Title: Description")
      actionSteps = actionPlanText.match(/\d+\.\s+([^:]+):\s+(.+?)(?=\n\d+\.|\n\n|$)/gs);
    }
    
    if (actionSteps && actionSteps.length > 0) {
      actionSteps.forEach((step, index) => {
        // Try bracket format first
        let stepMatch = step.match(/\d+\.\s+\[([^\]]+)\]:\s+(.+)/s);
        
        if (!stepMatch) {
          // Try without brackets
          stepMatch = step.match(/\d+\.\s+([^:]+):\s+(.+)/s);
        }
        
        if (stepMatch) {
          actionPlan.push({
            step: index + 1,
            title: stepMatch[1].trim(),
            description: stepMatch[2].trim(),
            priority: index === 0 ? "high" : index === 1 ? "medium" : "low"
          });
        }
      });
    }
    
    // If we still have no steps, try a more generic approach to catch numbered items
    if (actionPlan.length === 0) {
      const numberedItems = actionPlanText.match(/\d+\.\s+(.+?)(?=\n\d+\.|\n\n|$)/gs);
      
      if (numberedItems && numberedItems.length > 0) {
        numberedItems.forEach((item, index) => {
          const itemText = item.replace(/^\d+\.\s+/, '').trim();
          
          // Try to split by colon if present
          const parts = itemText.split(':');
          if (parts.length > 1) {
            actionPlan.push({
              step: index + 1,
              title: parts[0].trim().replace(/[\[\]]/g, ''),
              description: parts.slice(1).join(':').trim(),
              priority: index === 0 ? "high" : index === 1 ? "medium" : "low"
            });
          } else {
            // If no colon, use a generic title
            actionPlan.push({
              step: index + 1,
              title: `Step ${index + 1}`,
              description: itemText,
              priority: index === 0 ? "high" : index === 1 ? "medium" : "low"
            });
          }
        });
      }
    }
    
    // If still no action plan steps found, use a generic one
    if (actionPlan.length === 0) {
      console.log('No action plan extracted, using default plan');
      // Extract topics from the response to customize the default plan
      const topics = extractTopicsFromResponse(responseText);
      
      return [
        {
          step: 1,
          title: "Understand Your Legal Rights",
          description: `Research ${topics.join(', ')} as mentioned in the response to understand how they apply to your situation.`,
          priority: "high"
        },
        {
          step: 2,
          title: "Consult with a Legal Professional",
          description: "Seek advice from a lawyer who specializes in this area of law for personalized guidance.",
          priority: "medium"
        },
        {
          step: 3,
          title: "Document Your Situation",
          description: "Keep records of all relevant communications, events, and documents related to your case.",
          priority: "low"
        }
      ];
    }
    
    console.log(`Generated ${actionPlan.length} action plan items`);
    return actionPlan;
  } catch (error) {
    console.error('Error generating action plan:', error);
    logError(error, 'openaiService.generateActionPlan', {
      queryPreview: queryText?.substring(0, 100),
      responsePreview: responseText?.substring(0, 100)
    });
    
    // Return default action plan on error
    return [
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
        priority: "low"
      }
    ];
  }
};

// Helper function to extract key topics from the response
const extractTopicsFromResponse = (responseText) => {
  const topics = [];
  
  // Look for acts, laws, and other legal terms
  const actMatches = responseText.match(/(?:Act|Law|Code|Regulation)(?:\s+of\s+\d{4})?/g);
  if (actMatches) {
    topics.push(...actMatches.slice(0, 2));
  }
  
  // If no specific acts found, look for general legal areas
  if (topics.length === 0) {
    const legalAreas = [
      "property rights", "family law", "criminal law", "civil rights", 
      "constitutional rights", "contract law", "labor law", "tenancy rights"
    ];
    
    legalAreas.forEach(area => {
      if (responseText.toLowerCase().includes(area.toLowerCase())) {
        topics.push(area);
      }
    });
  }
  
  // If still empty, return generic topics
  if (topics.length === 0) {
    return ["applicable laws", "legal principles"];
  }
  
  return topics;
};

module.exports = {
  generateEmbedding,
  generateLegalAdvice,
  parseResponseIntoStructure,
  generateActionPlan
};
