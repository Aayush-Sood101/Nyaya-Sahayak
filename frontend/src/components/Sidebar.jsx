"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ conversations, onNewChat, onSelectChat, activeChatId }) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Nyaya Sahayak</h1>
        <p className="text-sm text-gray-600">Your Legal Assistant</p>
      </div>
      
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Legal Query
        </button>
      </div>
      
      {/* Search Box */}
      <div className="px-4 py-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
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
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-2 rounded-md cursor-pointer mb-1 ${
                  activeChatId === conversation.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => onSelectChat(conversation.id)}
              >
                <div className="truncate font-medium">{conversation.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        )}
      </div>
      
      {/* Navigation Footer */}
      <div className="p-4 border-t border-gray-200">
        <nav className="flex flex-col space-y-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              pathname === '/' ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            <svg
              className="w-4 h-4 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </Link>
          
          <Link
            href="/history"
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              pathname === '/history' ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            <svg
              className="w-4 h-4 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </Link>
          
          <Link
            href="/settings"
            className={`px-3 py-2 rounded-md text-sm flex items-center ${
              pathname === '/settings' ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            <svg
              className="w-4 h-4 mr-2 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Link>
        </nav>
      </div>
    </div>
  );
}
