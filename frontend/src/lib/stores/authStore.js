import { create } from 'zustand';

// Store for authentication state
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({ 
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (!response.ok) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null
        });
        return;
      }
      
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    }
  },
}));

export default useAuthStore;
