# Nyaya-Sahayak Backend Architecture

## Overview

The backend of Nyaya-Sahayak is built using Node.js and Express, providing a robust API for the legal advice system. It follows a structured architecture with clear separation of concerns between controllers, services, models, routes, and middleware.

## Directory Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection configuration
│   └── config.js             # Application configuration
├── controllers/
│   ├── userController.js     # User-related endpoints
│   ├── queryController.js    # Legal query handling
│   ├── responseController.js # Response management
│   └── feedbackController.js # User feedback handling
├── middleware/
│   ├── auth.js               # JWT authentication
│   ├── errorHandler.js       # Global error handling
│   └── validator.js          # Input validation
├── models/
│   ├── User.js               # User schema
│   ├── Query.js              # Legal query schema
│   ├── Response.js           # AI response schema
│   ├── Conversation.js       # User-system conversation schema
│   └── Feedback.js           # User feedback schema
├── routes/
│   ├── userRoutes.js         # User endpoints
│   ├── queryRoutes.js        # Query endpoints
│   ├── responseRoutes.js     # Response endpoints
│   └── feedbackRoutes.js     # Feedback endpoints
├── services/
│   ├── openaiService.js      # OpenAI API integration
│   ├── pineconeService.js    # Pinecone vector DB integration
│   ├── legalService.js       # Legal processing logic
│   └── responseService.js    # Response generation and formatting
├── utils/
│   ├── formatter.js          # Data formatting utilities
│   ├── logger/
│   │   ├── errorLogger.js    # Error logging
│   │   ├── promptLogger.js   # OpenAI prompt logging
│   │   └── responseLogger.js # OpenAI response logging
│   └── helpers.js            # Miscellaneous helper functions
├── server.js                 # Main application entry point
└── package.json              # Project dependencies
```

## Core Components

### Models

The application uses MongoDB with Mongoose for data modeling:

1. **User Model** - Stores user information and authentication details
2. **Query Model** - Stores legal queries submitted by users
3. **Response Model** - Stores AI-generated responses
4. **Conversation Model** - Maintains the conversation history
5. **Feedback Model** - Stores user feedback on responses

### Services

Services handle the business logic and external API integrations:

1. **openaiService.js** - Manages interactions with OpenAI API:
   - Generates embeddings for legal queries
   - Generates legal advice using GPT-3.5-turbo
   - Parses and structures the AI responses

2. **pineconeService.js** - Manages vector database operations:
   - Stores and retrieves embeddings
   - Performs semantic searches for relevant legal information

3. **legalService.js** - Processes legal queries:
   - Analyzes query context
   - Applies legal domain knowledge
   - Formats queries for AI processing

4. **responseService.js** - Handles response generation:
   - Structures responses in the required format
   - Extracts action plans and sources
   - Adds disclaimers and confidence scores

### Controllers

Controllers manage the API endpoints and request handling:

1. **userController.js** - Handles user registration, authentication, and profile management
2. **queryController.js** - Processes incoming legal queries
3. **responseController.js** - Manages response retrieval and delivery
4. **feedbackController.js** - Collects and processes user feedback

### Middleware

Middleware components provide cross-cutting functionality:

1. **auth.js** - JWT-based authentication system
2. **errorHandler.js** - Centralized error handling
3. **validator.js** - Request validation and sanitization

### Utilities

Utility modules provide helper functions:

1. **formatter.js** - Data formatting utilities
2. **logger/** - Logging system for errors, prompts, and responses:
   - **errorLogger.js** - Logs application errors
   - **promptLogger.js** - Logs prompts sent to OpenAI
   - **responseLogger.js** - Logs responses from OpenAI

## API Endpoints

The backend exposes the following API endpoints:

1. **User Endpoints**:
   - POST /api/users/register - User registration
   - POST /api/users/login - User authentication
   - GET /api/users/profile - Get user profile
   - PUT /api/users/profile - Update user profile

2. **Query Endpoints**:
   - POST /api/queries - Submit a new legal query
   - GET /api/queries - Get user's query history
   - GET /api/queries/:id - Get specific query details

3. **Response Endpoints**:
   - GET /api/responses/:queryId - Get response for a query
   - GET /api/responses/history - Get response history

4. **Feedback Endpoints**:
   - POST /api/feedback - Submit feedback for a response
   - GET /api/feedback/stats - Get feedback statistics

## Authentication Flow

The system uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server validates credentials and issues a JWT token
3. Client stores the token and includes it in the Authorization header
4. auth.js middleware validates the token for protected routes

## Data Flow

1. User submits a legal query through the frontend
2. Query is validated and stored in the database
3. Query is processed by legalService.js
4. openaiService.js generates embeddings and sends to Pinecone
5. pineconeService.js retrieves relevant legal information
6. openaiService.js generates a structured response using GPT-3.5-turbo
7. Response is parsed, structured, and stored in the database
8. Structured response is returned to the frontend for display

## Logging System

The logging system uses Winston to track:

1. **Errors** - Application errors and exceptions
2. **Prompts** - All prompts sent to OpenAI
3. **Responses** - All responses received from OpenAI

This helps with:
- Debugging issues
- Monitoring system performance
- Auditing AI interactions
- Improving prompt engineering

## Dependencies

The backend relies on the following key packages:

- express - Web server framework
- mongoose - MongoDB object modeling
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- cors - Cross-origin resource sharing
- openai - OpenAI API client
- @pinecone-database/pinecone - Pinecone vector DB client
- winston - Logging library
- dotenv - Environment variable management
- joi - Request validation
