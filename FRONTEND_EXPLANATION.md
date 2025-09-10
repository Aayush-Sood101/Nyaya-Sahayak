# Nyaya-Sahayak Frontend Architecture

## Overview

The frontend of Nyaya-Sahayak is built using Next.js, React, and Tailwind CSS, providing a modern, responsive user interface for the legal advice system. The application follows a component-based architecture with state management using Zustand.

## Directory Structure

```
frontend/
├── public/                  # Static assets
│   ├── file.svg             # SVG icons
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.js        # Root layout component
│   │   └── page.js          # Home page
│   ├── components/          # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   │   ├── LoginForm.js
│   │   │   └── SignupForm.js
│   │   ├── chat/            # Chat interface components
│   │   │   ├── ChatInterface.js
│   │   │   ├── QueryInput.js
│   │   │   └── ChatHistory.js
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Sidebar.js
│   │   │   └── MainLayout.js
│   │   └── response/        # Response display components
│   │       ├── ResponseDisplay.js
│   │       ├── ActionPlan.js
│   │       ├── Sources.js
│   │       └── FeedbackForm.js
│   ├── lib/                 # Utility functions and hooks
│   │   ├── api.js           # API client
│   │   ├── auth.js          # Authentication utilities
│   │   └── utils.js         # General utilities
│   ├── store/               # Zustand state management
│   │   ├── userStore.js     # User state
│   │   ├── queryStore.js    # Query state
│   │   ├── responseStore.js # Response state
│   │   └── uiStore.js       # UI state
│   └── styles/              # Component-specific styles
├── next.config.mjs          # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── jsconfig.json            # JavaScript configuration
└── package.json             # Project dependencies
```

## Core Components

### Page Components

1. **Home Page** (`src/app/page.js`) - Main landing page with introduction to the service
2. **Query Page** (`src/app/query/page.js`) - Legal query submission page
3. **Responses Page** (`src/app/responses/page.js`) - View responses to queries
4. **History Page** (`src/app/history/page.js`) - View conversation history
5. **Profile Page** (`src/app/profile/page.js`) - User profile management

### UI Components

#### Authentication Components

1. **LoginForm** - User login form
2. **SignupForm** - New user registration form

#### Chat Components

1. **ChatInterface** - Main chat interface container
2. **QueryInput** - Input form for legal queries
3. **ChatHistory** - Display of previous queries and responses

#### Response Components

1. **ResponseDisplay** - Main container for displaying legal advice
2. **ActionPlan** - Displays structured action steps
3. **Sources** - Shows cited legal sources
4. **FeedbackForm** - Collects user feedback on responses

#### Layout Components

1. **Header** - Top navigation bar
2. **Sidebar** - Side navigation panel
3. **Footer** - Page footer with links and information
4. **MainLayout** - Overall page layout structure

### State Management

The application uses Zustand for state management:

1. **userStore.js** - Manages user authentication state and user data
2. **queryStore.js** - Manages legal queries and submission state
3. **responseStore.js** - Manages response data and loading states
4. **uiStore.js** - Manages UI state like sidebar visibility, theme preferences

### API Integration

The `lib/api.js` module provides a centralized client for backend API communication:

1. **Authentication Endpoints**:
   - register - User registration
   - login - User authentication
   - logout - User logout
   - getProfile - Fetch user profile

2. **Query Endpoints**:
   - submitQuery - Submit legal query
   - getQueryHistory - Fetch query history
   - getQueryById - Fetch specific query

3. **Response Endpoints**:
   - getResponseByQueryId - Fetch response for a query
   - getResponseHistory - Fetch response history

4. **Feedback Endpoints**:
   - submitFeedback - Submit feedback for a response

### Utilities and Hooks

1. **auth.js** - Authentication utilities:
   - Token management
   - Protected route handling
   - Authentication status checking

2. **utils.js** - General utility functions:
   - Date formatting
   - Text processing
   - Form validation

## User Flow

1. **User Authentication**:
   - User registers or logs in
   - Authentication state is stored in userStore
   - JWT token is stored for API requests

2. **Query Submission**:
   - User navigates to query page
   - User enters legal query in QueryInput component
   - Query is submitted to backend via API
   - Loading state is managed in queryStore

3. **Response Viewing**:
   - Backend processes query and returns structured response
   - Response is stored in responseStore
   - ResponseDisplay component renders the structured legal advice
   - ActionPlan component displays step-by-step guidance
   - Sources component shows referenced legal sources

4. **Feedback Submission**:
   - User provides feedback on response quality
   - Feedback is submitted to backend via API
   - Confirmation is displayed to user

## Responsive Design

The UI is designed to be responsive using Tailwind CSS:
- Mobile-first approach
- Breakpoints for different screen sizes
- Flexible layout components
- Responsive typography

## Styling

The application uses Tailwind CSS for styling with:
- Custom color palette for legal theme
- Consistent typography scale
- Component-specific styles where needed
- Dark mode support

## Accessibility

The frontend implements accessibility features:
- Semantic HTML structure
- ARIA attributes for interactive elements
- Keyboard navigation support
- Focus management
- Screen reader compatibility

## Performance Optimization

1. **Next.js Optimizations**:
   - Server components where appropriate
   - Image optimization
   - Route pre-fetching
   - Code splitting

2. **State Management**:
   - Selective re-rendering with Zustand
   - Minimized state updates

3. **API Integration**:
   - Request caching
   - Optimistic updates
   - Error handling and retries

## Dependencies

The frontend relies on the following key packages:

- next - React framework
- react - UI library
- react-dom - DOM renderer for React
- tailwindcss - Utility-first CSS framework
- zustand - State management
- axios - HTTP client
- react-hook-form - Form handling
- react-icons - Icon library
- date-fns - Date utility library
- next-auth - Authentication for Next.js
