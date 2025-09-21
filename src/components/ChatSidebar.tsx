"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Trash2, Edit, Check, X, Folder } from "lucide-react";
import { useTranslation } from "@/utils/i18n";

interface Conversation {
  id: string;
  projectId: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSidebarProps {
  projects: Project[];
  conversations: Conversation[];
  currentProjectId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onCreateProject: (name: string) => void;
  onUpdateProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string | null) => void;
  currentConversationId: string;
  language: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  projects,
  conversations,
  currentProjectId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProject,
  currentConversationId,
  language
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  
  const t = useTranslation(language);

  // Filtrer les conversations par projet
  const filteredConversations = currentProjectId 
    ? conversations.filter(conv => conv.projectId === currentProjectId)
    : conversations.filter(conv => conv.projectId === null);

  const startEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id, e as unknown as React.MouseEvent);
    }
    if (e.key === 'Escape') {
      cancelEdit(e as unknown as React.MouseEvent);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreatingProject(false);
    }
  };

  const startEditingProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditProjectName(project.name);
  };

  const saveProjectEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editProjectName.trim()) {
      onUpdateProject(id, editProjectName.trim());
    }
    setEditingProjectId(null);
  };

  const cancelProjectEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(null);
  };

  const handleProjectKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveProjectEdit(id, e as unknown as React.MouseEvent);
    }
    if (e.key === 'Escape') {
      cancelProjectEdit(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
          <Button
            onClick={onNewChat}
            className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.chat.newConversation}
          </Button>
          <Button
            onClick={() => setIsCreatingProject(true)}
            className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          >
            <Folder className="w-4 h-4 mr-2" />
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Create Project Form */}
      {isCreatingProject && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-5 h-5 text-blue-500" />
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setIsCreatingProject(false);
                }}
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
                  setIsCreatingProject(false);
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
      <div className="p-2 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-2 px-2">Projets</h3>
        <div className="space-y-1">
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
                  {editingProjectId === project.id ? (
                    <Input
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                      onKeyDown={(e) => handleProjectKeyPress(e, project.id)}
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
                
                {editingProjectId === project.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-500 hover:text-green-600"
                      onClick={(e) => saveProjectEdit(project.id, e)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-gray-600"
                      onClick={cancelProjectEdit}
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
                      onClick={(e) => startEditingProject(project, e)}
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
            </Card>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="text-sm font-medium mb-2 px-2">Conversations</h3>
        <div className="space-y-1">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-3 cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  {editingId === conversation.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm font-medium truncate">
                      {conversation.title}
                    </span>
                  )}
                </div>
                {conversation.id !== 'default' && (
                  <div className="flex items-center gap-1">
                    {editingId === conversation.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-green-500 hover:text-green-600"
                          onClick={(e) => saveEdit(conversation.id, e)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-gray-600"
                          onClick={cancelEdit}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-blue-500"
                          onClick={(e) => startEditing(conversation.id, conversation.title, e)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {conversation.updatedAt.toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;