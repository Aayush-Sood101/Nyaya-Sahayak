"use client";

import { useState } from 'react';

export default function ActionPlan({ actions }) {
  const [checkedSteps, setCheckedSteps] = useState({});
  
  if (!actions || actions.length === 0) return null;
  
  const toggleCheck = (step) => {
    setCheckedSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };
  
  // Calculate completion percentage
  const totalSteps = actions.length;
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const completionPercentage = totalSteps > 0 
    ? Math.round((completedSteps / totalSteps) * 100) 
    : 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Action Plan</h3>
        <div className="text-sm text-gray-600">
          {completedSteps} of {totalSteps} completed
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div
          className="h-2 bg-blue-600 rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      {/* Action steps */}
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.step}
            className={`flex items-start p-3 border border-gray-200 rounded-lg ${
              checkedSteps[action.step] ? 'bg-gray-50' : 'bg-white'
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <input
                type="checkbox"
                id={`step-${action.step}`}
                checked={!!checkedSteps[action.step]}
                onChange={() => toggleCheck(action.step)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <label
                htmlFor={`step-${action.step}`}
                className={`block font-medium ${
                  checkedSteps[action.step] ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {action.title}
              </label>
              <p className={`mt-1 text-sm ${
                checkedSteps[action.step] ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {action.description}
              </p>
            </div>
            
            <div className="flex-shrink-0 ml-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                action.priority === 'high' ? 'bg-red-100 text-red-800' :
                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {action.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Export/Save buttons */}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          onClick={() => {
            // Export logic here
            const exportData = actions.map(action => ({
              ...action,
              completed: !!checkedSteps[action.step]
            }));
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
            
            const exportFileDefaultName = 'legal-action-plan.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
        >
          Export Plan
        </button>
        
        <button
          className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={() => {
            // Save progress logic here
            // In a real app, this would send the data to the backend
            alert('Progress saved!');
          }}
        >
          Save Progress
        </button>
      </div>
    </div>
  );
}
