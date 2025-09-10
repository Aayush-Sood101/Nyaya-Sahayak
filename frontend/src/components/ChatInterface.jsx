"use client";

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

export default function ChatInterface({ messages, onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h3 className="text-xl font-semibold mb-2">Welcome to Nyaya Sahayak</h3>
              <p>Your AI-powered legal assistant</p>
              <p className="mt-4">Ask any legal question to get started</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="space-y-4">
              {/* User message */}
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  U
                </div>
                <div className="ml-3 bg-blue-50 p-3 rounded-lg max-w-[80%]">
                  <p className="text-gray-800">{msg.query.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(msg.query.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* AI response */}
              {msg.response ? (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    AI
                  </div>
                  <div className="ml-3 bg-white border border-gray-200 p-3 rounded-lg max-w-[80%]">
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {msg.response.text || "Sorry, I couldn't generate a proper response. Please try again."}
                    </div>
                    
                    {/* Action Plan */}
                    {msg.response.actionPlan && msg.response.actionPlan.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <h4 className="font-medium text-gray-900 mb-2">Action Plan</h4>
                        <div className="space-y-2">
                          {msg.response.actionPlan.map((action) => (
                            <div key={action.step} className="flex">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 ${
                                action.priority === 'high' ? 'bg-red-100 text-red-700' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {action.step}
                              </div>
                              <div>
                                <h5 className="font-medium">{action.title}</h5>
                                <p className="text-sm text-gray-700">{action.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Sources */}
                    {msg.response.sources && msg.response.sources.length > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        <p className="font-medium">Sources:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          {msg.response.sources.map((source, idx) => (
                            <li key={idx}>
                              {source.sourceName}
                              {source.sourceUrl && (
                                <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-500 hover:underline">
                                  (link)
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Disclaimer */}
                    {msg.response.disclaimer && (
                      <div className="mt-3 text-xs italic text-gray-500 border-t pt-2">
                        {msg.response.disclaimer}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTime(msg.response.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                isLoading && index === messages.length - 1 && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                      AI
                    </div>
                    <div className="ml-3 bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your legal question..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
              isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !message.trim()}
          >
            Send
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Ask any legal question related to Indian law
        </p>
      </div>
    </div>
  );
}
