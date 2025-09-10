import axios from 'axios';

// Create axios instance with defaults
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
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
    login: (email, password) => api.post('/api/auth/login', { email, password }),
    register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
    logout: () => api.post('/api/auth/logout'),
    getProfile: () => api.get('/api/auth/me'),
  },
  
  // Legal endpoints
  legal: {
    query: (query, conversationId) => api.post('/api/legal/query', { query, conversationId }),
    search: (query, filters) => api.get('/api/legal/search', { params: { query, filters: JSON.stringify(filters) } }),
  },
  
  // Conversation endpoints
  conversations: {
    getAll: () => api.get('/api/conversations'),
    getById: (id) => api.get(`/api/conversations/${id}`),
    create: (title) => api.post('/api/conversations', { title }),
    update: (id, data) => api.put(`/api/conversations/${id}`, data),
    delete: (id) => api.delete(`/api/conversations/${id}`),
  },
  
  // Feedback endpoints
  feedback: {
    submit: (responseId, rating, comments, improvementAreas) => 
      api.post('/api/feedback', { responseId, rating, comments, improvementAreas }),
    getByResponseId: (responseId) => api.get(`/api/feedback/response/${responseId}`),
  },
};

export default apiService;
