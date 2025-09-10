"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // In a real app, these would use the store hooks
  const handleNewChat = () => {
    // Demo function - would create a new conversation
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Legal Query',
      updatedAt: new Date().toISOString()
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversation(newConversation);
    setMessages([]);
  };
  
  const handleSelectChat = (id) => {
    // Demo function - would fetch a conversation
    const selected = conversations.find(conv => conv.id === id);
    if (selected) {
      setCurrentConversation(selected);
      // In a real app, would fetch messages for this conversation
      setMessages([]);
    }
  };
  
  const handleSendMessage = (message) => {
    // Demo function to simulate sending a message
    setIsLoading(true);
    
    // Add user message
    const userMessage = {
      query: {
        text: message,
        createdAt: new Date().toISOString()
      },
      response: null
    };
    
    setMessages([...messages, userMessage]);
    
    // Simulate API response after 1.5 seconds
    setTimeout(() => {
      const aiResponse = {
        query: {
          text: message,
          createdAt: new Date().toISOString()
        },
        response: {
          text: "Based on the information provided, here's my legal guidance:\n\nYour situation falls under the Tenancy Laws of India, specifically the Rent Control Act applicable in your state.\n\nPlease note that landlords cannot evict tenants without following proper legal procedures and having valid grounds as specified by law.",
          actionPlan: [
            {
              step: 1,
              title: "Do Not Vacate",
              description: "You are not legally obligated to leave immediately.",
              priority: "high"
            },
            {
              step: 2,
              title: "Communicate in Writing",
              description: "Send your landlord a formal message stating your rights.",
              priority: "medium"
            },
            {
              step: 3,
              title: "Gather Evidence",
              description: "Keep copies of rent receipts and communications.",
              priority: "medium"
            }
          ],
          sources: [
            {
              sourceType: "law",
              sourceName: "Delhi Rent Control Act, 1958",
              sourceUrl: "https://example.com/rent-act",
              relevance: 0.95
            }
          ],
          disclaimer: "This is not legal advice. Please consult a qualified lawyer for specific legal counsel.",
          createdAt: new Date().toISOString()
        }
      };
      
      // Replace the loading message with the response
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        aiResponse
      ]);
      
      setIsLoading(false);
    }, 1500);
  };
  
  // Initialize with some demo data
  useEffect(() => {
    // In a real app, would check authentication and fetch conversations
    setIsAuthenticated(true);
    setConversations([
      {
        id: '1',
        title: 'Tenant Eviction Question',
        updatedAt: '2025-09-08T10:30:00Z'
      },
      {
        id: '2',
        title: 'Property Dispute Help',
        updatedAt: '2025-09-07T15:20:00Z'
      }
    ]);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={currentConversation?.id}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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
      </div>
    </div>
  );
}
