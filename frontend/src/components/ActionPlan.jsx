"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// A small component for the priority badge to keep the mapping clean
const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    high: 'font-semibold text-white',
    medium: 'font-medium text-zinc-300',
    low: 'font-normal text-zinc-500',
  };

  return (
    // Styled with a dark border
    <div className="border border-zinc-700 rounded-md px-2 py-0.5 text-xs">
      <span className={priorityStyles[priority] || priorityStyles.low}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </div>
  );
};


export default function ActionPlan({ actions }) {
  const [checkedSteps, setCheckedSteps] = useState({});

  if (!actions || actions.length === 0) {
    return null;
  }

  const toggleCheck = (stepId) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const totalSteps = actions.length;
  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleExport = () => {
    const exportData = actions.map(action => ({
      ...action,
      completed: !!checkedSteps[action.step]
    }));
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'legal-action-plan.json');
    linkElement.click();
  };

  const handleSave = () => {
    console.log("Saving progress:", checkedSteps);
    alert('Progress saved! (Check the console)');
  };


  return (
    // Card: Hardcoded black background, white text, and dark border
    <Card className="w-full max-w-2xl mx-auto shadow-lg bg-black text-white border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Action Plan</CardTitle>
        <CardDescription className="text-zinc-400">{completedSteps} of {totalSteps} steps completed</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress: Dark track with a white indicator */}
        <Progress 
          value={completionPercentage} 
          className="h-2 bg-zinc-800"
          indicatorClassName="bg-white"
        />
        
        <div className="space-y-4 mt-6">
          {actions.map((action) => {
            const isChecked = !!checkedSteps[action.step];
            return (
              // Item Container: Dark border
              <div
                key={action.step}
                className="flex items-start space-x-4 p-4 border border-zinc-800 rounded-lg"
              >
                {/* Checkbox: Styled for dark mode */}
                <Checkbox
                  id={`step-${action.step}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleCheck(action.step)}
                  className="mt-1 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                />
                <div className="grid gap-1.5 flex-1">
                  <Label
                    htmlFor={`step-${action.step}`}
                    className={`font-semibold text-base transition-colors ${
                      isChecked ? 'text-zinc-500 line-through' : 'text-zinc-50'
                    }`}
                  >
                    {action.title}
                  </Label>
                  <p className={`text-sm transition-colors ${
                    isChecked ? 'text-zinc-600' : 'text-zinc-400'
                  }`}>
                    {action.description}
                  </p>
                </div>
                <PriorityBadge priority={action.priority} />
              </div>
            );
          })}
        </div>
      </CardContent>
      {/* Footer: Top border for separation */}
      <CardFooter className="flex justify-end space-x-2 border-t border-zinc-800 pt-4">
        {/* Outline Button: Styled for dark mode */}
        <Button 
          variant="outline" 
          onClick={handleExport}
          className="bg-black border-zinc-700 hover:bg-zinc-900 hover:text-white"
        >
          Export Plan
        </Button>
        {/* Primary Button: Inverted for high contrast */}
        <Button 
          onClick={handleSave}
          className="bg-white text-black hover:bg-zinc-200"
        >
          Save Progress
        </Button>
      </CardFooter>
    </Card>
  );
}