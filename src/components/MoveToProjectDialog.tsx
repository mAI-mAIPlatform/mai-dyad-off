"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, X } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MoveToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onMoveToProject: (projectId: string | null) => void;
  iconColor: string;
}

const MoveToProjectDialog: React.FC<MoveToProjectDialogProps> = ({
  open,
  onOpenChange,
  projects,
  onMoveToProject,
  iconColor
}) => {
  const getIconColorClass = () => {
    const colorMap: Record<string, string> = {
      'black': 'text-black dark:text-white',
      'blue': 'text-blue-600',
      'red': 'text-red-600',
      'yellow': 'text-yellow-600',
      'gray': 'text-gray-500',
      'green': 'text-green-600',
      'purple': 'text-purple-600',
      'pink': 'text-pink-600',
      'indigo': 'text-indigo-600',
      'orange': 'text-orange-600'
    };
    return colorMap[iconColor] || 'text-black dark:text-white';
  };

  const renderIcon = (iconName: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || Folder;
    return <IconComponent className={`w-5 h-5 ${getIconColorClass()}`} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir un dossier de destination</DialogTitle>
          <DialogDescription>
            Sélectionnez le dossier où vous souhaitez déplacer cette conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Option "Toutes les conversations" */}
          <Card
            className="p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md"
            onClick={() => onMoveToProject(null)}
          >
            <div className="flex items-center gap-3">
              <Folder className={`w-6 h-6 ${getIconColorClass()}`} />
              <div className="flex-1">
                <h3 className="font-medium text-sm">Toutes les conversations</h3>
                <p className="text-xs text-gray-500">Conversations sans dossier spécifique</p>
              </div>
            </div>
          </Card>

          {/* Liste des projets */}
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md"
              onClick={() => onMoveToProject(project.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6">
                  {renderIcon(project.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{project.name}</h3>
                  <p className="text-xs text-gray-500">Projet créé le {project.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          ))}

          {projects.length === 0 && (
            <div className="text-center py-6">
              <Folder className={`w-12 h-12 mx-auto mb-2 ${getIconColorClass()}`} />
              <p className="text-sm text-gray-500">Aucun dossier créé</p>
              <p className="text-xs text-gray-400">Créez d'abord un dossier pour organiser vos conversations</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToProjectDialog;