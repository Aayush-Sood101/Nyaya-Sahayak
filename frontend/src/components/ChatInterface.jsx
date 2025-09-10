"use client";

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// WelcomeMessage and LoadingIndicator components remain the same...

const WelcomeMessage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-zinc-500">
      <h3 className="text-2xl font-semibold mb-2 text-zinc-200">Nyaya Sahayak</h3>
      <p>Your AI-powered legal assistant for India</p>
      <p className="mt-4 text-sm">Ask any legal question to get started.</p>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="flex items-start">
    <Avatar>
      <AvatarFallback className="bg-zinc-800 text-zinc-300">AI</AvatarFallback>
    </Avatar>
    <div className="ml-3 border border-zinc-800 p-3 rounded-lg">
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);


export default function ChatInterface({ messages, onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null); // We will use a simpler ref for this

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="flex flex-col h-full bg-black text-white">
      {/* THIS IS THE FIX: A new wrapper div that handles the flex-grow and overflow */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <WelcomeMessage />
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="space-y-6">
                {/* User message */}
                <div className="flex items-start justify-end">
                  <div className="mr-3 bg-zinc-900 border border-zinc-800 p-3 rounded-lg max-w-[80%]">
                    <p className="text-zinc-200">{msg.query.text}</p>
                    <p className="text-xs text-zinc-500 mt-1 text-right">
                      {formatTime(msg.query.createdAt)}
                    </p>
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-zinc-800 text-zinc-300">U</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* AI response or loading indicator */}
                {msg.response ? (
                  <div className="flex items-start">
                    <Avatar>
                      <AvatarFallback className="bg-zinc-800 text-zinc-300">AI</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 border border-zinc-800 p-4 rounded-lg max-w-[80%]">
                      <div className="text-zinc-300 whitespace-pre-wrap">
                        {msg.response.text || "Sorry, I couldn't generate a proper response."}
                      </div>
                      
                      {/* Action Plan, Sources, Disclaimer sections remain the same... */}
                      {msg.response.actionPlan?.length > 0 && (
                        <>
                          <Separator className="my-4 bg-zinc-800" />
                          {/* ... action plan content ... */}
                        </>
                      )}
                      
                      <p className="text-xs text-zinc-500 mt-2">
                        {formatTime(msg.response.createdAt)}
                      </p>
                    </div>
                  </div>
                ) : (
                  isLoading && index === messages.length - 1 && <LoadingIndicator />
                )}
              </div>
            ))
          )}
          {/* Add a reference div at the end to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your legal question..."
            className="flex-1 bg-zinc-900 border-zinc-700 placeholder:text-zinc-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-white text-black hover:bg-zinc-200"
            disabled={isLoading || !message.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}