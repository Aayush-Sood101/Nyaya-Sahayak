"use client";

import { useState } from 'react';

export default function ResponseDisplay({ response }) {
  const [expandedStep, setExpandedStep] = useState(null);
  
  if (!response) return null;
  
  const toggleStep = (stepNumber) => {
    if (expandedStep === stepNumber) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepNumber);
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Main response text */}
      <div className="prose prose-sm max-w-none mb-6">
        <div className="whitespace-pre-wrap">{response.text}</div>
      </div>
      
      {/* Action Plan */}
      {response.actionPlan && response.actionPlan.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Plan</h3>
          <div className="space-y-3">
            {response.actionPlan.map((action) => (
              <div
                key={action.step}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className={`flex items-center p-3 cursor-pointer ${
                    action.priority === 'high' ? 'bg-red-50' :
                    action.priority === 'medium' ? 'bg-yellow-50' :
                    'bg-green-50'
                  }`}
                  onClick={() => toggleStep(action.step)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    action.priority === 'high' ? 'bg-red-100 text-red-700' :
                    action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {action.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                  </div>
                  <div className="ml-2">
                    <svg
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${
                        expandedStep === action.step ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                
                {expandedStep === action.step && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <p className="text-gray-700">{action.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sources */}
      {response.sources && response.sources.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Sources</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            {response.sources.map((source, idx) => (
              <li key={idx}>
                {source.sourceName}
                {source.sourceUrl && (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-blue-500 hover:underline"
                  >
                    (link)
                  </a>
                )}
                <span className="text-xs text-gray-500 ml-1">
                  ({source.sourceType})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Disclaimer */}
      {response.disclaimer && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="text-xs italic text-gray-500">
            {response.disclaimer}
          </div>
        </div>
      )}
      
      {/* Footer with share/feedback options */}
      <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            onClick={() => navigator.clipboard.writeText(response.text)}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </button>
          
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Was this helpful?</span>
          <button className="text-gray-600 hover:text-green-600 p-1">
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
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
          </button>
          <button className="text-gray-600 hover:text-red-600 p-1">
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
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
