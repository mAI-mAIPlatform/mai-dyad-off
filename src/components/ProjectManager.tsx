"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Folder, Plus, Edit, Check, X, Trash2 } from "lucide-react";
import { useTranslation } from "@/utils/i18n";

interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectManagerProps {
  projects: Project[];
  onCreateProject: (name: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string) => void;
  currentProjectId: string | null;
  language: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProject,
  currentProjectId,
  language
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const t = useTranslation(language);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdateProject(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'create' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'create') {
        handleCreateProject();
      } else {
        saveEdit();
      }
    }
    if (e.key === 'Escape') {
      if (action === 'create') {
        setIsCreating(false);
        setNewProjectName('');
      } else {
        cancelEdit();
      }
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          onClick={() => setIsCreating(true)}
          className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      {/* Create Project Form */}
      {isCreating && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-5 h-5 text-blue-500" />
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, 'create')}
                placeholder="Nom du projet"
                className="flex-1"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateProject}
                className="flex-1 h-8"
              >
                <Check className="w-4 h-4 mr-1" />
                Créer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName('');
                }}
                className="h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {/* Default "Toutes les conversations" item */}
          <Card
            className={`p-3 cursor-pointer transition-colors ${
              currentProjectId === null
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => onSelectProject(null)}
          >
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Toutes les conversations</span>
            </div>
          </Card>

          {projects.map((project) => (
            <Card
              key={project.id}
              className={`p-3 cursor-pointer transition-colors ${
                currentProjectId === project.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  {editingId === project.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, 'edit')}
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-medium truncate">
                      {project.name}
                    </span>
                  )}
                </div>
                
                {editingId === project.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-500 hover:text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit();
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEdit();
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(project);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {project.createdAt.toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;