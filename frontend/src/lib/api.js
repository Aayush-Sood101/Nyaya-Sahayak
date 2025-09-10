import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // If token exists, add to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login or refresh token logic here
      if (typeof window !== 'undefined') {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Define API functions
const apiService = {
  // Auth endpoints
  auth: {
    login: (email, password) => api.post('/users/login', { email, password }),
    register: (name, email, password) => api.post('/users/register', { name, email, password }),
    logout: () => api.post('/users/logout'),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.put('/users/profile', userData),
  },
  
  // Legal endpoints
  legal: {
    query: (query, conversationId) => api.post('/legal/query', { query, conversationId }),
    search: (query, filters) => api.get('/legal/search', { params: { query, filters: JSON.stringify(filters) } }),
    getResponseByQueryId: (queryId) => api.get(`/responses/${queryId}`),
    getResponseHistory: () => api.get('/responses/history'),
  },
  
  // Conversation endpoints
  conversations: {
    getAll: () => api.get('/conversations'),
    getById: (id) => api.get(`/conversations/${id}`),
    create: (title) => api.post('/conversations', { title }),
    update: (id, data) => api.put(`/conversations/${id}`, data),
    delete: (id) => api.delete(`/conversations/${id}`),
    getStats: () => api.get('/conversations/stats'),
  },
  
  // Feedback endpoints
  feedback: {
    submit: (responseId, rating, comments, improvementAreas) => 
      api.post('/feedback', { responseId, rating, comments, improvementAreas }),
    getByResponseId: (responseId) => api.get(`/feedback/response/${responseId}`),
    getStats: () => api.get('/feedback/stats'),
  },
  
  // Query endpoints
  queries: {
    getAll: () => api.get('/queries'),
    getById: (id) => api.get(`/queries/${id}`),
    create: (text, conversationId) => api.post('/queries', { text, conversationId }),
  },
};

export default apiService;
