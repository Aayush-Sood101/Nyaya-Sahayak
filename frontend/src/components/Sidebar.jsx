"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Home, History, Settings } from 'lucide-react';

export default function Sidebar({ conversations, onNewChat, onSelectChat, activeChatId }) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredConversations = conversations.filter(conv => 
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };
  
  return (
    <aside className="w-72 bg-black border-r border-zinc-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Nyaya Sahayak</h1>
        <p className="text-sm text-zinc-400">Your Legal Assistant</p>
      </div>
      
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Legal Query
        </Button>
      </div>
      
      {/* Search Box */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-9 bg-zinc-900 border-zinc-700 placeholder:text-zinc-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={`px-3 py-2 rounded-md cursor-pointer text-sm text-zinc-300 transition-colors ${
                  activeChatId === conv._id
                    ? 'bg-zinc-800 text-white'
                    : 'hover:bg-zinc-900'
                }`}
                onClick={() => onSelectChat(conv._id)}
              >
                <div className="truncate font-medium">{conv.title}</div>
                <div className="text-xs text-zinc-500">
                  {formatDate(conv.updatedAt)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-zinc-500">
              {searchTerm ? 'No matches found' : 'No conversations yet'}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <Separator className="bg-zinc-800" />

      {/* Navigation Footer */}
      <div className="p-2">
        <nav className="flex flex-col space-y-1">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              className={`w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 ${
                pathname === '/' && 'bg-zinc-800 text-white'
              }`}
            >
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
          </Link>
          <Link href="/history" passHref>
            <Button
              variant="ghost"
              className={`w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 ${
                pathname === '/history' && 'bg-zinc-800 text-white'
              }`}
            >
              <History className="w-4 h-4 mr-2" /> History
            </Button>
          </Link>
          <Link href="/settings" passHref>
            <Button
              variant="ghost"
              className={`w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 ${
                pathname === '/settings' && 'bg-zinc-800 text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Button>
          </Link>
        </nav>
      </div>
    </aside>
  );
}