# Nyaya-Sahayak Setup Instructions

## Overview

This document provides instructions for setting up and running the Nyaya-Sahayak legal advice system. The application consists of a Next.js frontend and a Node.js/Express backend.

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB (local or Atlas)
- OpenAI API key
- Pinecone API key (for vector database)

## Backend Setup

### Required Packages

Install the following packages for the backend:

```bash
cd backend
npm install express mongoose dotenv cors jsonwebtoken bcryptjs winston joi morgan helmet express-rate-limit openai @pinecone-database/pinecone
```

#### Package List Explanation:

- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling tool
- **dotenv**: Load environment variables from .env file
- **cors**: Enable CORS with various options
- **jsonwebtoken**: JWT implementation for authentication
- **bcryptjs**: Password hashing library
- **winston**: Logging library
- **joi**: Object schema validation
- **morgan**: HTTP request logger middleware
- **helmet**: Helps secure Express apps with various HTTP headers
- **express-rate-limit**: Basic rate-limiting middleware
- **openai**: Official OpenAI API client
- **@pinecone-database/pinecone**: Pinecone vector database client

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=your_pinecone_index

# Logging Configuration
LOG_LEVEL=info
```

### Running the Backend

```bash
cd backend
npm start
```

For development with auto-restart:

```bash
cd backend
npm run dev
```

## Frontend Setup

### Required Packages

Install the following packages for the frontend:

```bash
cd frontend
npm install react react-dom next axios zustand react-hook-form @tailwindcss/forms react-icons date-fns react-markdown
```

#### Package List Explanation:

- **react**: UI library
- **react-dom**: DOM renderer for React
- **next**: React framework
- **axios**: Promise-based HTTP client
- **zustand**: State management library
- **react-hook-form**: Forms validation
- **@tailwindcss/forms**: Form styles for Tailwind CSS
- **react-icons**: Icon library
- **date-fns**: Date utility library
- **react-markdown**: Markdown renderer for React

### Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Nyaya-Sahayak
```

### Running the Frontend

```bash
cd frontend
npm run dev
```

## Accessing the Application

Once both the backend and frontend are running:

- Backend API: http://localhost:5000/api
- Frontend UI: http://localhost:3000

## Development Notes

### Backend API Testing

You can test the backend API using tools like Postman or cURL:

```bash
# Test the health check endpoint
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/users/register -H "Content-Type: application/json" -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Development

For frontend development, you can use the Next.js development server:

```bash
cd frontend
npm run dev
```

This will start the development server with hot-reloading enabled.

## Project Structure

Please refer to the `BACKEND_EXPLANATION.md` and `FRONTEND_EXPLANATION.md` files for detailed information about the project architecture and structure.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your MongoDB connection string
   - Ensure MongoDB service is running
   - Check network connectivity

2. **OpenAI API Issues**
   - Verify your API key is correct
   - Check rate limits on your OpenAI account
   - Review error messages in backend logs

3. **Pinecone Connection Issues**
   - Verify your Pinecone API key and environment
   - Ensure your index exists and is properly configured
   - Check network connectivity

4. **Frontend API Connection**
   - Ensure backend server is running
   - Check CORS configuration
   - Verify API URL in frontend environment variables

### Logs

Check the log files in the backend for debugging:

- `logs/error.log` - For application errors
- `logs/prompt.log` - For OpenAI prompt logs
- `logs/response.log` - For OpenAI response logs

## Security Considerations

- Never commit .env files to version control
- Rotate API keys regularly
- Use strong JWT secrets
- Implement proper input validation
- Set appropriate rate limits

## Deployment

For production deployment:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Set environment variables to production values
3. Use a process manager like PM2 for the backend
4. Consider using a reverse proxy like Nginx
