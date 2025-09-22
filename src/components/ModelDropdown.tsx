"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Model {
  id: string;
  name: string;
  description: string;
}

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedModel,
  onModelChange
}) => {
  const models: Model[] = [
    {
      id: 'openai/gpt-4o',
      name: 'm-4.0',
      description: 'Pour les tâches quotidiennes, rapide.'
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'm-4.3-mini',
      description: 'Ecologique'
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

  const currentModel = models.find(model => model.id === selectedModel) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-normal">
          {currentModel.name}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex flex-col items-start py-2"
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-xs text-gray-500">{model.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropdown;