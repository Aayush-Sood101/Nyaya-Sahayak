"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from 'lucide-react'; // Icon for loading spinner

export default function QueryInput({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');
  const MAX_CHARS = 500;

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setQuery(text);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query);
      setQuery('');
    }
  };

  const charCount = query.length;

  return (
    // Card: Hardcoded black background, white text, and dark border
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-black text-white border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Describe Your Case</CardTitle>
        <CardDescription className="text-zinc-400">
          Provide as much detail as possible for the most relevant legal guidance.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="relative">
            {/* Textarea: Styled for the dark theme */}
            <Textarea
              className="w-full h-36 resize-none bg-zinc-900 border-zinc-700 placeholder:text-zinc-500 text-base p-4"
              placeholder="Explain your legal situation here. For example: 'My landlord is trying to evict me in Delhi without a proper notice...'"
              value={query}
              onChange={handleChange}
              disabled={isLoading}
              maxLength={MAX_CHARS}
            />
            {/* Character counter */}
            <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
              {charCount}/{MAX_CHARS}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-xs text-zinc-500">
            Your query will be handled confidentially.
          </p>
          
          {/* Button: Inverted style with a loading indicator */}
          <Button
            type="submit"
            className="bg-white text-black hover:bg-zinc-200 min-w-[160px]"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Get Legal Advice'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}