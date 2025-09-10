import { create } from 'zustand';

// Store for chat/conversation state
const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  
  // Fetch all conversations for the user
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversations');
      }
      
      set({ 
        conversations: data.data, 
        isLoading: false,
        error: null
      });
      
      return data.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Fetch a single conversation with messages
  fetchConversation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversation');
      }
      
      set({ 
        currentConversation: data.data,
        messages: data.data.messages,
        isLoading: false,
        error: null
      });
      
      return data.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Create a new conversation
  createConversation: async (title) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create conversation');
      }
      
      // Add new conversation to list
      set(state => ({ 
        conversations: [...state.conversations, data.data],
        currentConversation: data.data,
        messages: [],
        isLoading: false,
        error: null
      }));
      
      return data.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Send a message and get a response
  sendMessage: async (text) => {
    set({ isLoading: true, error: null });
    
    const { currentConversation } = get();
    
    if (!currentConversation) {
      set({ isLoading: false, error: 'No active conversation' });
      throw new Error('No active conversation');
    }
    
    try {
      // First, add the user message to the UI
      const userMessage = {
        query: {
          text,
          createdAt: new Date().toISOString()
        },
        response: null
      };
      
      set(state => ({
        messages: [...state.messages, userMessage]
      }));
      
      // Send to the API
      const response = await fetch('/api/legal/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          query: text,
          conversationId: currentConversation.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      // Update the messages with the response
      set(state => {
        const updatedMessages = [...state.messages];
        // Replace the last message with the complete one from the API
        updatedMessages[updatedMessages.length - 1] = {
          query: data.data.query,
          response: data.data.response
        };
        
        return {
          messages: updatedMessages,
          isLoading: false,
          error: null
        };
      });
      
      return data.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Update conversation title
  updateConversationTitle: async (id, title) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ title }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update conversation');
      }
      
      // Update in state
      set(state => {
        const updatedConversations = state.conversations.map(conv => 
          conv.id === id ? { ...conv, title } : conv
        );
        
        let updatedCurrentConversation = state.currentConversation;
        if (updatedCurrentConversation && updatedCurrentConversation.id === id) {
          updatedCurrentConversation = { ...updatedCurrentConversation, title };
        }
        
        return {
          conversations: updatedConversations,
          currentConversation: updatedCurrentConversation,
          isLoading: false,
          error: null
        };
      });
      
      return data.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Delete a conversation
  deleteConversation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete conversation');
      }
      
      // Remove from state
      set(state => {
        const updatedConversations = state.conversations.filter(conv => conv.id !== id);
        
        // Clear current conversation if it was deleted
        let updatedCurrentConversation = state.currentConversation;
        let updatedMessages = state.messages;
        
        if (updatedCurrentConversation && updatedCurrentConversation.id === id) {
          updatedCurrentConversation = null;
          updatedMessages = [];
        }
        
        return {
          conversations: updatedConversations,
          currentConversation: updatedCurrentConversation,
          messages: updatedMessages,
          isLoading: false,
          error: null
        };
      });
      
      return true;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Clear current conversation and messages
  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      messages: [],
    });
  },
}));

export default useChatStore;
