"use client";

import React, { useState } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  selectedModel,
  onModelChange,
  userName,
  onUserNameChange
}) => {
  const [localUserName, setLocalUserName] = useState(userName);
  const { theme, setTheme } = useTheme();

  const models = [
    { id: 'openai/gpt-5', name: 'm-4.0', description: 'Pour les tâches quotidiennes, rapide' },
    { id: 'anthropic/claude-3-haiku', name: 'm-4.3-mini', description: 'Écologique' },
    { id: 'openai/o4', name: 'm-4.5 Pro', description: 'Professionnel, précis' },
    { id: 'anthropic/claude-3-opus', name: 'm-4.7o', description: 'Précis' },
    { id: 'openai/gpt-5-mini', name: 'm-4.9+', description: 'Rapide' }
  ];

  const handleSave = () => {
    onUserNameChange(localUserName);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>
            Configurez vos préférences d'application.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Nom utilisateur */}
          <div className="grid gap-2">
            <Label htmlFor="userName">Votre nom</Label>
            <Input
              id="userName"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              placeholder="Entrez votre nom"
              onBlur={handleSave}
            />
          </div>

          {/* Modèle IA */}
          <div className="grid gap-2">
            <Label htmlFor="model">Modèle IA</Label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un modèle" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thème */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Mode sombre</Label>
            <Switch
              id="theme"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;