import { create } from 'zustand';
import apiService from '@/lib/api';

const useConversationStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  
  // Create a new conversation
  createConversation: async (title) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.create(title || 'New Conversation');
      
      const newConversation = response.data.data;
      
      set((state) => ({
        conversations: [...state.conversations, newConversation],
        currentConversation: newConversation,
        messages: [],
        isLoading: false
      }));
      
      return newConversation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to create conversation' 
      });
      throw error;
    }
  },
  
  // Get all conversations
  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.getAll();
      
      set({ 
        conversations: response.data.data,
        isLoading: false 
      });
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch conversations' 
      });
      throw error;
    }
  },
  
  // Get a specific conversation by ID
  getConversationById: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.getById(conversationId);
      const conversation = response.data.data;
      
      set({ 
        currentConversation: conversation,
        messages: conversation.messages || [],
        isLoading: false 
      });
      
      return conversation;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to fetch conversation' 
      });
      throw error;
    }
  },
  
  // Add a message to the current conversation
  sendMessage: async (message) => {
    try {
      if (!get().currentConversation) {
        // Create a new conversation if none exists
        await get().createConversation();
      }
      
      const conversationId = get().currentConversation.id || get().currentConversation._id;
      set({ isLoading: true, error: null });
      
      // Add user message to the UI immediately
      const userMessage = {
        query: {
          text: message,
          createdAt: new Date().toISOString(),
          id: Date.now().toString() // Temporary ID until we get the real one
        },
        response: null
      };
      
      set((state) => ({
        messages: [...state.messages, userMessage]
      }));
      
      // Then process the legal query
      try {
        const queryData = {
          query: message,
          conversationId: conversationId
        };
        
        console.log('Sending query to backend:', queryData);
        const response = await apiService.legal.query(queryData.query, queryData.conversationId);
        console.log('Received response from backend:', JSON.stringify(response.data, null, 2));
        
        if (!response.data || !response.data.data) {
          console.error('Invalid response structure:', response);
          throw new Error('Invalid response from server');
        }
        
        // The backend returns { query: {...}, response: {...} }
        const responseData = response.data.data;
        
        // Update the message with the response
        const messageWithResponse = {
          query: userMessage.query,
          response: responseData.response
        };
        
        console.log('Created message with response:', JSON.stringify(messageWithResponse, null, 2));
        
        // Replace the loading message with the complete one
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.query.id === userMessage.query.id ? messageWithResponse : msg
          ),
          isLoading: false
        }));
        
        return messageWithResponse;
      } catch (error) {
        console.error('Error processing query:', error);
        
        // Create a fallback response
        const fallbackResponse = {
          query: userMessage.query,
          response: {
            text: "I apologize, but there was an error processing your query. Please try again or rephrase your question.",
            actionPlan: [
              {
                step: 1,
                title: "Try Again",
                description: "Please try sending your message again."
              },
              {
                step: 2,
                title: "Rephrase",
                description: "Try rephrasing your question with more details."
              }
            ],
            disclaimer: "This is a system error response. The application is currently experiencing technical difficulties."
          }
        };
        
        // Update state with the fallback response
        set((state) => ({
          messages: state.messages.map(msg => 
            msg.query.id === userMessage.query.id ? fallbackResponse : msg
          ),
          isLoading: false,
          error: error.response?.data?.message || 'Failed to process query'
        }));
        
        return fallbackResponse;
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to send message' 
      });
      throw error;
    }
  },
  
  // Update conversation title
  updateConversation: async (conversationId, title) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await apiService.conversations.update(conversationId, { title });
      
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId ? response.data.data : conv
        ),
        currentConversation: state.currentConversation?.id === conversationId 
          ? response.data.data 
          : state.currentConversation,
        isLoading: false
      }));
      
      return response.data.data;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to update conversation' 
      });
      throw error;
    }
  },
  
  // Delete a conversation
  deleteConversation: async (conversationId) => {
    try {
      set({ isLoading: true, error: null });
      
      await apiService.conversations.delete(conversationId);
      
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId 
          ? null 
          : state.currentConversation,
        messages: state.currentConversation?.id === conversationId ? [] : state.messages,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to delete conversation' 
      });
      throw error;
    }
  },
  
  // Set current conversation
  setCurrentConversation: (conversation) => {
    set({ 
      currentConversation: conversation,
      messages: []  // Clear messages when switching conversations
    });
  },
  
  // Clear current conversation
  clearCurrentConversation: () => {
    set({ 
      currentConversation: null,
      messages: []
    });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useConversationStore;
