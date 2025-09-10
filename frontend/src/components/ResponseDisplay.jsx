"use client";

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Share2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

export default function ResponseDisplay({ response }) {
  const [hasCopied, setHasCopied] = useState(false);

  if (!response) {
    return (
      <div className="p-6 bg-black border border-zinc-800 rounded-lg">
        <p className="text-zinc-400">Your legal analysis will appear here.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(response.text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-black border border-zinc-800 rounded-lg shadow-lg">
        {/* Main response text with prose for nice formatting */}
        <div className="p-6">
          <div className="prose prose-sm prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{response.text}</div>
          </div>
        </div>

        {/* Action Plan using Shadcn's Accordion */}
        {response.actionPlan?.length > 0 && (
          <div className="px-6 pb-6">
            <Separator className="my-4 bg-zinc-800" />
            <h3 className="text-lg font-semibold text-white mb-4">Action Plan</h3>
            <Accordion type="single" collapsible className="w-full">
              {response.actionPlan.map((action) => (
                <AccordionItem key={action.step} value={`item-${action.step}`} className="border-zinc-800">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center mr-3 flex-shrink-0">
                        {action.step}
                      </div>
                      <h4 className="font-medium text-white">{action.title}</h4>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    {action.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Sources and Disclaimer */}
        {(response.sources?.length > 0 || response.disclaimer) && (
          <div className="px-6 pb-6">
            <Separator className="my-4 bg-zinc-800" />
            {response.sources?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">Sources</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-400">
                  {response.sources.map((source, idx) => (
                    <li key={idx}>
                      {source.sourceName}
                      {source.sourceUrl && (
                        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">(link)</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {response.disclaimer && (
              <div className="text-xs italic text-zinc-500">
                {response.disclaimer}
              </div>
            )}
          </div>
        )}

        {/* Footer with actions */}
        <div className="border-t border-zinc-800 px-4 py-2 flex justify-between items-center">
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-zinc-500 mr-2">Was this helpful?</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-green-500 hover:bg-zinc-800">
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                <p>Helpful</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-500 hover:bg-zinc-800">
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-white border-zinc-700">
                <p>Not Helpful</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}