"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as LucideIcons from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
}

interface CustomModel {
  id: string;
  name: string;
  icon: string;
  knowledge: string;
  instructions: string;
  createdAt: Date;
}

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  customModels?: CustomModel[];
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedModel,
  onModelChange,
  customModels = []
}) => {
  const defaultModels: Model[] = [
    {
      id: 'openai/gpt-4o',
      name: 'm-4.0',
      description: 'Pour les tâches quotidiennes, rapide'
    },
    {
      id: 'openai/gpt-4-turbo',
      name: 'm-4.3-mini',
      description: 'Ecologique, court'
    },
    {
      id: 'anthropic/claude-3-5-sonnet',
      name: 'm-4.5 Pro',
      description: 'Professionnel, précis'
    },
    {
      id: 'anthropic/claude-3-opus',
      name: 'm-4.7o',
      description: 'Précis, long'
    },
    {
      id: 'google/gemini-2.0-flash-thinking-exp',
      name: 'm-4.9+',
      description: 'Rapide, court'
    }
  ];

  const allModels = [...defaultModels, ...customModels.map(model => ({
    id: model.id,
    name: model.name,
    description: model.instructions || 'Modèle personnalisé'
  }))];

  const currentModel = allModels.find(model => model.id === selectedModel) || defaultModels[0];

  const renderIcon = (iconName: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || Star;
    return <IconComponent className="w-3 h-3" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-sm font-normal">
          {currentModel.name}
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {allModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex flex-col items-start py-2"
          >
            <div className="font-medium flex items-center gap-2">
              {model.id.startsWith('custom-') && (
                <Star className="w-3 h-3 text-yellow-500" />
              )}
              {model.name}
            </div>
            <div className="text-xs text-gray-500">{model.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropdown;