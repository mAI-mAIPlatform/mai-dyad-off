"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ModelSelector from "./ModelSelector";

interface SettingsDialogProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  selectedModel,
  onModelChange
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <ThemeToggle />
          <ModelSelector selectedModel={selectedModel} onModelChange={onModelChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;