"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, FolderPlus, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";

interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  conversationIds: string[];
}

interface ProjectDialogProps {
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'conversationIds'>) => void;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ onProjectCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📁');

  const icons = [
    '📁', '📊', '📝', '🎨', '💻', '📱', 
    '📚', '💼', '🛒', '🎮', '🎵', '🎬',
    '🔬', '🏥', '🔧', '🏠', '🚗', '✈️'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      showError("Veuillez entrer un titre pour le projet");
      return;
    }

    onProjectCreate({
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon
    });

    // Réinitialiser le formulaire
    setTitle('');
    setDescription('');
    setSelectedIcon('📁');
    setIsOpen(false);
    showSuccess("Projet créé avec succès");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="justify-start">
          <FolderPlus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Organisez vos conversations en projets pour une meilleure gestion.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du projet</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du projet"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du projet (optionnel)"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <Button
                  key={icon}
                  type="button"
                  variant={selectedIcon === icon ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10 text-lg"
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              Créer le projet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;