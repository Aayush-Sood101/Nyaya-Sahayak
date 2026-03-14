# Nyaya-Sahayak 🏛️

**Nyaya-Sahayak** (meaning *"Legal Helper"* in Sanskrit/Hindi) is an AI-powered legal assistance platform that helps Indian users get structured, actionable legal guidance through a conversational chat interface. The system combines large language models, semantic vector search over Indian legal documents, and a modern web frontend to deliver practical legal advice with numbered action plans, source citations, and plain-language explanations.

> **Legal Disclaimer**: Nyaya-Sahayak provides general legal information only and is **not** a substitute for professional legal counsel. Always consult a qualified lawyer for specific legal matters.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Query Processing Pipeline](#query-processing-pipeline)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

| Feature | Description |
|---|---|
| 🤖 **AI Legal Advice** | Submit legal queries in plain language and receive structured responses powered by GPT-3.5-turbo |
| 📋 **Action Plans** | Each response includes a numbered, interactive checklist of steps you should take |
| 🔍 **Semantic Search** | Queries are matched against a Pinecone vector database of Indian legal documents |
| 📚 **Source Citations** | Every response cites the relevant Indian laws, acts, schemes, or guides |
| 💬 **Conversation History** | Full chat history with threaded conversations and search |
| 🌐 **Multi-language Support** | User preferences for English, Hindi, and Tamil |
| ⭐ **Feedback System** | Rate responses and flag areas for improvement |
| 🔐 **User Authentication** | JWT-based secure registration and login |
| 📊 **Logging & Monitoring** | Separate Winston logs for errors, AI prompts, and AI responses |
| 🛡️ **Security Hardened** | Helmet, rate limiting, CORS, bcrypt password hashing, input validation |
| 📱 **Responsive UI** | Built with Tailwind CSS and Radix UI; works on all screen sizes |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥ 14.x | Runtime environment |
| Express | 5.1.0 | Web server framework |
| MongoDB | (latest) | Primary database (via Atlas or local) |
| Mongoose | 8.18.1 | MongoDB object modeling |
| OpenAI | 5.20.1 | GPT-3.5-turbo responses & text-embedding-3-small embeddings |
| Pinecone | 6.1.2 | Vector database for semantic search |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcryptjs | 3.0.2 | Password hashing |
| Helmet | 8.1.0 | HTTP security headers |
| express-rate-limit | 8.1.0 | API rate limiting |
| express-validator | 7.2.1 | Request validation & sanitization |
| Winston | 3.17.0 | Structured logging |
| dotenv | 17.2.2 | Environment variable management |
| CORS | 2.8.5 | Cross-origin resource sharing |
| cookie-parser | 1.4.7 | Cookie handling |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5.2 | React framework with App Router & Turbopack |
| React | 19.1.0 | UI library |
| Tailwind CSS | 4 | Utility-first styling |
| Radix UI | Various | Accessible headless component primitives |
| Zustand | 4.5.7 | Lightweight global state management |
| Axios | 1.6.2 | HTTP client with interceptors |
| react-hook-form | 7.49.2 | Form handling and validation |
| react-markdown | 9.0.1 | Markdown rendering for AI responses |
| lucide-react | 0.543.0 | Icon library |
| date-fns | 2.30.0 | Date formatting utilities |
| next-themes | 0.4.6 | Dark/light mode support |
| clsx + tailwind-merge | Latest | Conditional class merging |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │               Next.js 15 Frontend (port 3000)                  │ │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌────────────┐  │ │
│  │  │ Sidebar  │  │   Chat    │  │  Response  │  │  Action    │  │ │
│  │  │ (History)│  │Interface  │  │  Display   │  │  Plan      │  │ │
│  │  └──────────┘  └───────────┘  └────────────┘  └────────────┘  │ │
│  │           Zustand State │ Axios HTTP Client                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ REST API (JSON)
┌─────────────────────────────────▼───────────────────────────────────┐
│                  Node.js / Express Backend (port 3001)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth/Rate   │  │   Routes     │  │       Controllers        │  │
│  │  Middleware  │  │  /api/legal  │  │  legalController         │  │
│  │  (JWT, Helmet│  │  /api/convs  │  │  conversationController  │  │
│  │   Rate Limit)│  │  /api/feedback  │  feedbackController      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                         Services Layer                          ││
│  │  legalService  │  openaiService  │  pineconeService  │ responseS││
│  └─────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────┐      ┌──────────────┐    ┌──────────────────┐ │
│  │  Winston Logger  │      │  MongoDB     │    │  External APIs   │ │
│  │  error.log       │      │  (Mongoose)  │    │  - OpenAI GPT    │ │
│  │  prompt.log      │      │  Users       │    │  - OpenAI Embed  │ │
│  │  response.log    │      │  Conversations│   │  - Pinecone VDB  │ │
│  └──────────────────┘      │  Queries     │    └──────────────────┘ │
│                             │  Responses   │                         │
│                             │  Feedback    │                         │
│                             └──────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Nyaya-Sahayak/
├── backend/
│   ├── controllers/
│   │   ├── conversationController.js  # Create, read, update, delete conversations
│   │   ├── legalController.js         # Process legal queries and search
│   │   └── feedbackController.js      # Submit and retrieve feedback
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT token verification
│   │   └── rateLimitMiddleware.js     # Per-IP/user rate limiting
│   ├── models/
│   │   ├── conversationModel.js       # Conversation MongoDB schema
│   │   ├── queryModel.js              # Legal query schema (intent, entities, urgency)
│   │   ├── responseModel.js           # AI response schema (action plan, sources)
│   │   ├── userModel.js               # User profile schema
│   │   └── feedbackModel.js           # Feedback schema
│   ├── routes/
│   │   ├── legalRoutes.js             # POST /api/legal/query, GET /api/legal/search
│   │   ├── conversationRoutes.js      # CRUD /api/conversations
│   │   └── feedbackRoutes.js          # POST /api/feedback, GET /api/feedback/response/:id
│   ├── services/
│   │   ├── legalService.js            # Query analysis, intent detection, entity extraction
│   │   ├── openaiService.js           # Embeddings, GPT advice generation, response parsing
│   │   ├── pineconeService.js         # Vector DB search (with mock data fallback)
│   │   └── responseService.js         # Orchestration of the full query-to-response pipeline
│   ├── utils/
│   │   └── logger/
│   │       ├── errorLogger.js         # Logs application errors
│   │       ├── promptLogger.js        # Logs prompts sent to OpenAI
│   │       └── responseLogger.js      # Logs responses from OpenAI
│   ├── server.js                      # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/                        # Static assets (SVGs, icons)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js              # Root layout with metadata and theming
│   │   │   ├── page.js                # Home page (chat interface)
│   │   │   ├── history/page.js        # Conversation history browser
│   │   │   └── settings/page.js       # User preferences and settings
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx      # Main conversational display
│   │   │   ├── QueryInput.jsx         # Text input with character counter & validation
│   │   │   ├── ResponseDisplay.jsx    # Structured response with copy/share actions
│   │   │   ├── ActionPlan.jsx         # Interactive progress-tracked action checklist
│   │   │   ├── Sidebar.jsx            # Navigation, conversation list, search
│   │   │   └── ui/                    # Radix UI + Shadcn primitives
│   │   │       ├── accordion.jsx
│   │   │       ├── alert.jsx
│   │   │       ├── avatar.jsx
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── checkbox.jsx
│   │   │       ├── input.jsx
│   │   │       ├── label.jsx
│   │   │       ├── progress.jsx
│   │   │       ├── scroll-area.jsx
│   │   │       ├── textarea.jsx
│   │   │       └── tooltip.jsx
│   │   ├── lib/
│   │   │   ├── api.js                 # Axios client with JWT interceptors (base URL :3001)
│   │   │   ├── utils.js               # General utility functions
│   │   │   └── stores/
│   │   │       ├── authStore.js       # Auth-related Zustand store
│   │   │       └── chatStore.js       # Chat-related Zustand store
│   │   └── store/
│   │       ├── conversationStore.js   # Conversations & messages state
│   │       ├── userStore.js           # User profile state
│   │       ├── responseStore.js       # Response cache state
│   │       └── queryStore.js          # Query history state
│   ├── components.json                # Shadcn UI configuration
│   ├── jsconfig.json                  # Path alias: @/* → ./src/*
│   ├── next.config.mjs                # Next.js configuration
│   ├── postcss.config.mjs             # PostCSS + Tailwind configuration
│   └── package.json
│
├── BACKEND_EXPLANATION.md             # Detailed backend architecture docs
├── FRONTEND_EXPLANATION.md            # Detailed frontend architecture docs
├── SETUP_INSTRUCTIONS.md              # Step-by-step setup guide
├── Instructions.txt                   # Original project specification
└── README.md                          # This file
```

---

## Database Schema

### User

```js
{
  name:        String (required),
  email:       String (unique, required),
  password:    String (required, bcrypt-hashed),
  role:        "user" | "admin"  (default: "user"),
  preferences: {
    language:  "en" | "hi" | "ta"       (default: "en"),
    theme:     "light" | "dark"         (default: "light")
  },
  createdAt:   Date,
  lastLogin:   Date
}
```

### Conversation

```js
{
  userId:    ObjectId → User,
  title:     String  (default: "New Conversation"),
  messages:  [ObjectId → Query],
  status:    "active" | "archived",
  summary:   String,
  createdAt: Date,
  updatedAt: Date
}
```

### Query

```js
{
  conversationId: ObjectId → Conversation (required),
  userId:         ObjectId → User,
  text:           String (required),           // The user's question
  intent:         "criminal" | "civil" | "constitutional" | "family" | "property" | "labor" | "other",
  entities:       [{ type: "date"|"amount"|"location"|"person"|"legal_concept", value: String }],
  urgency:        "low" | "medium" | "high",
  complexity:     "low" | "medium" | "high",
  responseId:     ObjectId → Response,
  createdAt:      Date
}
```

### Response

```js
{
  queryId:    ObjectId → Query (required),
  text:       String (required),               // Full advice text
  actionPlan: [{
    step:        Number,
    title:       String,
    description: String,
    priority:    "low" | "medium" | "high"
  }],
  sources: [{
    sourceType: "law" | "scheme" | "faq" | "guide" | "constitution",
    sourceName: String,
    sourceUrl:  String,
    relevance:  Number (0–1)
  }],
  disclaimer:  String,
  confidence:  Number (0–1),
  createdAt:   Date
}
```

### Feedback

```js
{
  userId:           ObjectId → User (required),
  responseId:       ObjectId → Response (required),
  rating:           Number (1–5, required),
  comments:         String,
  improvementAreas: ["accuracy" | "relevance" | "clarity" | "actionability" | "completeness"],
  createdAt:        Date
}
```

---

## API Reference

All endpoints are prefixed with `/api`. The frontend's Axios client is configured with a base URL of `http://localhost:3001/api`.

### Legal Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/legal/query` | Optional | Process a legal query end-to-end; returns query + response objects |
| `GET` | `/api/legal/search` | Optional | Direct semantic search in the Pinecone vector database |

**POST `/api/legal/query` -- Request body**
```json
{
  "query": "My landlord wants me to vacate within 3 days. What are my rights?",
  "conversationId": "<optional-mongodb-object-id>",
  "userId": "<optional-mongodb-object-id>"
}
```

**POST `/api/legal/query` -- Response body**
```json
{
  "success": true,
  "data": {
    "query": { "id": "...", "text": "...", "intent": "civil", "urgency": "high" },
    "response": {
      "text": "...",
      "actionPlan": [
        { "step": 1, "title": "Do Not Vacate", "description": "...", "priority": "high" }
      ],
      "sources": [{ "sourceName": "Transfer of Property Act, 1882", "sourceType": "law" }],
      "disclaimer": "This is general information and not legal advice..."
    }
  }
}
```

### Conversation Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/conversations` | Required | List all conversations for the authenticated user |
| `GET` | `/api/conversations/:id` | Required | Get a specific conversation with its full message history |
| `POST` | `/api/conversations` | Required | Create a new conversation |
| `PUT` | `/api/conversations/:id` | Required | Update conversation title or status |
| `DELETE` | `/api/conversations/:id` | Required | Delete a conversation and its related queries/responses |

### Feedback Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/feedback` | Required | Submit a rating and feedback for a response |
| `GET` | `/api/feedback/response/:responseId` | Required | Get aggregated feedback statistics for a response |

**POST `/api/feedback` -- Request body**
```json
{
  "responseId": "<response-object-id>",
  "rating": 4,
  "comments": "Very helpful but could be more specific.",
  "improvementAreas": ["specificity", "actionability"]
}
```

---

## Getting Started

### Prerequisites

- **Node.js** v14.x or later ([nodejs.org](https://nodejs.org))
- **npm** v6.x or later (bundled with Node.js)
- **MongoDB** -- local installation or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **OpenAI API Key** -- [platform.openai.com](https://platform.openai.com)
- **Pinecone API Key** -- [pinecone.io](https://www.pinecone.io) *(optional: the backend falls back to mock data)*

---

### Backend Setup

1. **Navigate to the backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file** (see [Environment Variables](#environment-variables) section below)

   ```bash
   cp .env.example .env   # if available, otherwise create manually
   ```

4. **Start the development server**

   ```bash
   # With nodemon auto-restart (if installed globally or as a dev dependency)
   npm run dev

   # Or standard Node.js
   node server.js
   ```

   The backend will start on **http://localhost:3001**.

---

### Frontend Setup

1. **Navigate to the frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env.local` file**

   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:3000**.

---

### Running the Application

Start both servers (in separate terminals):

```bash
# Terminal 1 -- Backend
cd backend && node server.js

# Terminal 2 -- Frontend
cd frontend && npm run dev
```

Then open your browser at [http://localhost:3000](http://localhost:3000).

**Quick API health check:**

```bash
curl http://localhost:3001/api/legal/search?q=tenant+rights
```

---

## Environment Variables

### Backend -- `backend/.env`

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nyaya-sahayak

# Authentication
JWT_SECRET=your_strong_jwt_secret_here_at_least_32_chars
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone (optional -- system falls back to mock data if not set)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name

# Logging
LOG_LEVEL=info
```

> ⚠️ **Never commit your `.env` file to version control.** The `.gitignore` already excludes it.

### Frontend -- `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Query Processing Pipeline

When a user submits a legal query, it travels through the following pipeline:

```
1. Input Validation
   └─ express-validator checks query length and content safety

2. Query Analysis (legalService.analyzeQuery)
   ├─ Intent Detection    -- criminal | civil | family | property | labor | constitutional
   ├─ Entity Extraction   -- dates, monetary amounts, city names, legal concepts
   ├─ Urgency Assessment  -- high | medium | low (keyword-based)
   └─ Complexity Scoring  -- based on query length and vocabulary

3. Store Query -- Saved to MongoDB with metadata

4. Semantic Search (pineconeService.searchVectorDatabase)
   ├─ Generate query embedding (OpenAI text-embedding-3-small)
   ├─ Query Pinecone for top-k similar legal document chunks
   └─ Fallback: return curated mock Indian legal documents

5. Legal Advice Generation (openaiService.generateLegalAdvice)
   └─ GPT-3.5-turbo prompt with retrieved context, query, and structured output instructions

6. Response Parsing (openaiService.parseResponseIntoStructure)
   ├─ Extract disclaimer
   ├─ Extract sources
   └─ Parse main advice text

7. Action Plan Generation (openaiService.generateActionPlan)
   └─ Separate GPT call to produce numbered, prioritised action steps

8. Validation (responseService.validateResponse)
   └─ Safety checks -- filters harmful/inappropriate content

9. Store Response -- Saved to MongoDB linked to query

10. Return to Frontend -- { query, response } with full structure
```

---

## Security

| Measure | Implementation |
|---|---|
| Authentication | JWT Bearer tokens verified on every protected route |
| Password Storage | bcryptjs hashing (salted) |
| HTTP Headers | Helmet middleware sets Content-Security-Policy, X-Frame-Options, etc. |
| Rate Limiting | express-rate-limit per IP/user; returns 429 when exceeded |
| Input Validation | express-validator sanitises and validates all incoming request bodies |
| CORS | Configured to accept requests from the frontend origin only |
| Secrets in Logs | MongoDB URIs are masked before being written to log files |
| Environment Variables | All secrets stored in `.env` files excluded from version control |

---

## Logging

Log files are written to `backend/logs/` (created automatically):

| File | Contents |
|---|---|
| `logs/error.log` | Application errors and unhandled exceptions |
| `logs/prompt.log` | Every prompt sent to OpenAI (for audit and debugging) |
| `logs/response.log` | Every response received from OpenAI |

---

## Troubleshooting

### MongoDB Connection Failed

- Verify `MONGODB_URI` is correct and your IP is whitelisted in Atlas.
- Ensure the MongoDB service is running locally if using a local instance.
- Check for typos in the username/password portion of the URI.

### OpenAI API Errors

- Confirm `OPENAI_API_KEY` is valid and not expired.
- Check your OpenAI account's usage limits and billing status.
- Review `logs/error.log` for detailed error messages.

### Pinecone Issues

- If `PINECONE_API_KEY` or `PINECONE_INDEX_NAME` is missing/incorrect, the system automatically falls back to built-in mock legal documents -- no action needed for development.
- For production, ensure the Pinecone index exists and has the correct dimensions for `text-embedding-3-small` (1536).

### Frontend Cannot Reach Backend

- Make sure `NEXT_PUBLIC_API_URL` in `frontend/.env.local` matches the backend's actual port.
- Check that CORS is configured to allow the frontend origin.
- Confirm the backend process is running.

### 401 Unauthorized Errors

- Ensure the JWT token is stored in `localStorage` under the key the frontend uses.
- Check that `JWT_SECRET` in the backend `.env` matches the one used when tokens were issued.
- Token may have expired -- log out and log back in.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and add tests where applicable.
4. **Commit** with a meaningful message: `git commit -m "feat: add <feature>"`
5. **Push** to your fork and open a **Pull Request** against `main`.

Please ensure:
- No secrets or API keys are committed.
- All existing functionality remains working.
- Code follows the conventions already present in the codebase.

---

## Documentation

Detailed architecture documentation is available in the following files:

| Document | Description |
|---|---|
| [BACKEND_EXPLANATION.md](./BACKEND_EXPLANATION.md) | In-depth backend architecture, data flow, and service descriptions |
| [FRONTEND_EXPLANATION.md](./FRONTEND_EXPLANATION.md) | In-depth frontend component structure, state management, and UI design |
| [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) | Extended setup guide with troubleshooting and deployment notes |
| [Instructions.txt](./Instructions.txt) | Original project specification and requirements |

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## Acknowledgments

- [OpenAI](https://openai.com) -- GPT-3.5-turbo and text-embedding-3-small APIs
- [Pinecone](https://www.pinecone.io) -- Vector database infrastructure
- [Vercel](https://vercel.com) -- Next.js framework and deployment platform
- [Radix UI](https://www.radix-ui.com) -- Accessible UI primitives
- [Shadcn/ui](https://ui.shadcn.com) -- Component library built on Radix
- Legal professionals and open government data initiatives whose published resources inform the system's knowledge base

---

*Built with ❤️ to make Indian legal information more accessible.*
