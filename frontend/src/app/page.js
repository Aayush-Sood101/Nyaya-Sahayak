"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import useUserStore from '@/store/userStore';
import useConversationStore from '@/store/conversationStore';
import useUIStore from '@/store/uiStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useUserStore();
  const { 
    conversations, 
    currentConversation, 
    messages, 
    isLoading, 
    error,
    fetchConversations, 
    createConversation,
    getConversationById,
    sendMessage,
    setCurrentConversation
  } = useConversationStore();
  
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  // Check authentication and fetch conversations on component mount
  useEffect(() => {
    const initializeApp = async () => {
      const isAuthed = await checkAuth();
      
      if (isAuthed) {
        try {
          await fetchConversations();
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
        }
      } else {
        // If using authentication, uncomment this to redirect to login
        // router.push('/login');
      }
    };
    
    initializeApp();
  }, []);
  
  // Handle creating a new conversation
  const handleNewChat = async () => {
    try {
      await createConversation('New Legal Query');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };
  
  // Handle selecting an existing conversation
  const handleSelectChat = async (id) => {
    try {
      await getConversationById(id);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async (message) => {
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={currentConversation?.id || currentConversation?._id}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">
            {currentConversation?.title || 'Nyaya Sahayak - Legal Assistant'}
          </h2>
          
          <div className="flex space-x-2">
            {currentConversation && (
              <>
                <button
                  className="p-2 text-gray-600 hover:text-gray-900"
                  title="Rename conversation"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </header>
        
        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden bg-white">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="p-2 bg-red-100 text-red-800 text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
