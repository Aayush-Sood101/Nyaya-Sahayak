"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch conversations on mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setConversations([
        {
          id: '1',
          title: 'Tenant Eviction Question',
          updatedAt: '2025-09-08T10:30:00Z',
          summary: 'Discussed rights regarding landlord eviction notice and proper legal procedures.',
          messageCount: 8
        },
        {
          id: '2',
          title: 'Property Dispute Help',
          updatedAt: '2025-09-07T15:20:00Z',
          summary: 'Covered boundary dispute with neighbor and documentation requirements.',
          messageCount: 6
        },
        {
          id: '3',
          title: 'Employment Contract Review',
          updatedAt: '2025-09-05T09:15:00Z',
          summary: 'Analyzed termination clause and non-compete agreement in employment contract.',
          messageCount: 12
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Conversation
          </Link>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </header>
      
      <main>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/?conversation=${conversation.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-2 truncate">
                  {conversation.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {conversation.summary}
                </p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatDate(conversation.updatedAt)}</span>
                  <span>{conversation.messageCount} messages</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">
              {searchTerm
                ? 'No conversations match your search.'
                : 'No conversations found. Start a new conversation!'}
            </p>
            {searchTerm && (
              <button
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>
      
      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>Need help with something else? <Link href="/" className="text-blue-600 hover:underline">Start a new conversation</Link></p>
      </footer>
    </div>
  );
}
