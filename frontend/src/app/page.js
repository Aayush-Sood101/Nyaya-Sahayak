// app/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import useUserStore from '@/store/userStore';
import useConversationStore from '@/store/conversationStore';
import useUIStore from '@/store/uiStore';

// Shadcn UI and Icons
import { Button } from '@/components/ui/button';
import { Menu, FilePenLine } from 'lucide-react';

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
    sendMessage
  } = useConversationStore();
  
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  useEffect(() => {
    const initializeApp = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        try {
          await fetchConversations();
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
        }
      }
    };
    initializeApp();
  }, [checkAuth, fetchConversations]);
  
  const handleNewChat = async () => {
    try {
      await createConversation('New Legal Query');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };
  
  const handleSelectChat = async (id) => {
    try {
      await getConversationById(id);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };
  
  const handleSendMessage = async (message) => {
    try {
      await sendMessage(message);
    } catch (error) { // The brace was missing here
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          conversations={conversations || []} 
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={currentConversation?.id || currentConversation?._id}
        />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        
        
        {/* Chat Interface - Takes remaining space and is scrollable */}
        <main className="flex-1 overflow-y-auto">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </main>
        
        {/* Error Display - Fixed at bottom if it exists */}
        {error && (
          <div className="p-3 bg-destructive text-destructive-foreground text-sm font-medium flex-shrink-0 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}