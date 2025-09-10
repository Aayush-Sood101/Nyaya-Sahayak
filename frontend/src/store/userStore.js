import { create } from 'zustand';
import apiService from '@/lib/api';

const useUserStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Register a new user
  register: async (name, email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.auth.register(name, email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response.data.user;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.auth.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      set({ 
        user: response.data.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return response.data.user;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Login failed' 
      });
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      set({ isLoading: true });
      
      await apiService.auth.logout();
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      // Even if logout fails on the server, clear local state
      localStorage.removeItem('token');
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
  
  // Check if user is authenticated
  checkAuth: async () => {
    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
        return false;
      }
      
      set({ isLoading: true });
      
      // Fetch user profile
      const response = await apiService.auth.getProfile();
      
      set({ 
        user: response.data.data, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      // If error occurs, user is not authenticated
      localStorage.removeItem('token');
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null // Don't set error here as this is a background check
      });
      
      return false;
    }
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.auth.updateProfile(userData);
      
      set({ 
        user: response.data.data, 
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      });
      throw error;
    }
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useUserStore;
