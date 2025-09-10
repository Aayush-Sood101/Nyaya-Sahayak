import { create } from 'zustand';
import apiService from '@/lib/api';

const useQueryStore = create((set, get) => ({
  queries: [],
  isLoading: false,
  error: null,
  
  // Submit a new legal query
  submitQuery: async (queryText, conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.legal.query(queryText, conversationId);
      
      // Update the queries list with the new query
      set((state) => ({
        queries: [...state.queries, response.data],
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to submit query' 
      });
      throw error;
    }
  },
  
  // Fetch query history for the current user
  fetchQueryHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.getAll();
      
      set({ 
        queries: response.data.data,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch query history' 
      });
      throw error;
    }
  },
  
  // Get a specific query by ID
  getQueryById: async (queryId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.getById(queryId);
      
      set({ isLoading: false });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch query' 
      });
      throw error;
    }
  },
  
  // Clear all queries
  clearQueries: () => {
    set({ queries: [], error: null });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useQueryStore;
