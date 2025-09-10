"use client";

import { useState } from 'react';

export default function QueryInput({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;
  
  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setQuery(text);
      setCharCount(text.length);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery('');
      setCharCount(0);
    }
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe your legal issue or question..."
            value={query}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {charCount}/{MAX_CHARS}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Be specific about your legal situation for more accurate advice
          </p>
          
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
              isLoading || !query.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? 'Processing...' : 'Get Legal Advice'}
          </button>
        </div>
      </form>
    </div>
  );
}
