"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange
}) => {
  const models: Model[] = [
    {
      id: 'openai/gpt-4o',
      name: 'm-4.0',
      description: 'GPT-4 Omni, rapide et polyvalent'
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'm-4.5 Pro',
      description: 'GPT-4 Turbo, professionnel'
    },
    {
      id: 'anthropic/claude-3-5-sonnet',
      name: 'm-4.7 Sonnet',
      description: 'Claude 3.5, précis et créatif'
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'm-4.9 Opus',
      description: 'Claude 3 Opus, performance maximale'
    },
    {
      id: 'google/gemini-2.0-flash-thinking-exp',
      name: 'm-5.0 Flash',
      description: 'Gemini 2.0, ultra rapide'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Modèle</h3>
      <div className="space-y-2">
        {models.map((model) => (
          <div
            key={model.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedModel === model.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            onClick={() => onModelChange(model.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{model.name}</span>
                  {selectedModel === model.id && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{model.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;