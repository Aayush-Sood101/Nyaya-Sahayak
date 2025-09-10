import { create } from 'zustand';
import apiService from '@/lib/api';

const useResponseStore = create((set, get) => ({
  responses: {},
  currentResponse: null,
  isLoading: false,
  error: null,
  
  // Get response for a specific query
  getResponseByQueryId: async (queryId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.legal.getResponseByQueryId(queryId);
      
      set((state) => ({
        responses: { ...state.responses, [queryId]: response.data.data },
        currentResponse: response.data.data,
        isLoading: false
      }));
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch response' 
      });
      throw error;
    }
  },
  
  // Get response history
  getResponseHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.legal.getResponseHistory();
      
      // Convert array to object with queryId as key
      const responsesObj = response.data.data.reduce((acc, curr) => {
        acc[curr.query] = curr;
        return acc;
      }, {});
      
      set({ 
        responses: responsesObj,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch response history' 
      });
      throw error;
    }
  },
  
  // Submit feedback for a response
  submitFeedback: async (responseId, rating, comments, improvementAreas) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.feedback.submit(
        responseId, 
        rating, 
        comments, 
        improvementAreas
      );
      
      set({ isLoading: false });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to submit feedback' 
      });
      throw error;
    }
  },
  
  // Set current response
  setCurrentResponse: (response) => {
    set({ currentResponse: response });
  },
  
  // Clear all responses
  clearResponses: () => {
    set({ responses: {}, currentResponse: null, error: null });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useResponseStore;
