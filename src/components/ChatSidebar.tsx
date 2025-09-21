"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Trash2, Edit, Check, X, Folder, Move } from "lucide-react";
import { useTranslation } from "@/utils/i18n";
import IconPicker from "./IconPicker";
import * as LucideIcons from "lucide-react";

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
  onCreateProject: (name: string, icon: string) => void;
  onUpdateProject: (id: string, name: string, icon: string) => void;
  onDeleteProject: (id: string) => void;
  onSelectProject: (id: string | null) => void;
  onMoveConversationToProject: (conversationId: string, projectId: string | null) => void;
  currentConversationId: string;
  language: string;
  iconColor: string;
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
  onMoveConversationToProject,
  currentConversationId,
  language,
  iconColor
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('folder');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectIcon, setEditProjectIcon] = useState('folder');
  const [movingConversationId, setMovingConversationId] = useState<string | null>(null);
  
  const t = useTranslation(language);

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
      onCreateProject(newProjectName.trim(), newProjectIcon);
      setNewProjectName('');
      setNewProjectIcon('folder');
      setIsCreatingProject(false);
    }
  };

  const startEditingProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditProjectName(project.name);
    setEditProjectIcon(project.icon);
  };

  const saveProjectEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editProjectName.trim()) {
      onUpdateProject(id, editProjectName.trim(), editProjectIcon);
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

  const startMovingConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMovingConversationId(conversationId);
  };

  const moveConversationToProject = (projectId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (movingConversationId) {
      onMoveConversationToProject(movingConversationId, projectId);
      setMovingConversationId(null);
    }
  };

  const cancelMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMovingConversationId(null);
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())] || Folder;
    return <IconComponent className={`w-4 h-4 ${getIconColorClass()}`} />;
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
          <Button
            onClick={onNewChat}
            className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-sm h-8"
          >
            <Plus className={`w-3 h-3 mr-2 ${getIconColorClass()}`} />
            {t.chat.newConversation}
          </Button>
          <Button
            onClick={() => setIsCreatingProject(true)}
            className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-sm h-8"
          >
            <Folder className={`w-3 h-3 mr-2 ${getIconColorClass()}`} />
            Nouveau projet
          </Button>
        </div>
      </div>

      {/* Create Project Form */}
      {isCreatingProject && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <Card className="p-2">
            <div className="flex items-center gap-2 mb-2">
              <IconPicker
                selectedIcon={newProjectIcon}
                onIconChange={setNewProjectIcon}
              />
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setIsCreatingProject(false);
                }}
                placeholder="Nom du projet"
                className="flex-1 h-7 text-sm"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreateProject}
                className="flex-1 h-7 text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Créer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingProject(false);
                  setNewProjectName('');
                  setNewProjectIcon('folder');
                }}
                className="h-7 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Projects List - Only show if there are projects */}
      {projects.length > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-medium mb-2 px-2 text-gray-500 uppercase tracking-wide">Projets</h3>
          <div className="space-y-1">
            {/* Default "Toutes les conversations" item */}
            <Card
              className={`p-2 cursor-pointer transition-colors text-sm ${
                currentProjectId === null
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectProject(null)}
            >
              <div className="flex items-center gap-2">
                <Folder className={`w-3 h-3 ${getIconColorClass()}`} />
                <span className="font-medium truncate">Toutes les conversations</span>
              </div>
            </Card>

            {projects.map((project) => (
              <Card
                key={project.id}
                className={`p-2 cursor-pointer transition-colors text-sm ${
                  currentProjectId === project.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {editingProjectId === project.id ? (
                      <>
                        <IconPicker
                          selectedIcon={editProjectIcon}
                          onIconChange={setEditProjectIcon}
                        />
                        <Input
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          onKeyDown={(e) => handleProjectKeyPress(e, project.id)}
                          className="h-6 text-sm flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center w-4 h-4">
                          {renderIcon(project.icon)}
                        </div>
                        <span className="font-medium truncate text-xs">
                          {project.name}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-green-500 hover:text-green-600"
                        onClick={(e) => saveProjectEdit(project.id, e)}
                      >
                        <Check className="w-2 h-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-500 hover:text-gray-600"
                        onClick={cancelProjectEdit}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-400 hover:text-blue-500"
                        onClick={(e) => startEditingProject(project, e)}
                      >
                        <Edit className="w-2 h-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="text-xs font-medium mb-2 px-2 text-gray-500 uppercase tracking-wide">Conversations</h3>
        <div className="space-y-1">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-2 cursor-pointer transition-colors text-sm ${
                currentConversationId === conversation.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className={`w-3 h-3 text-gray-500 flex-shrink-0 ${getIconColorClass()}`} />
                  {editingId === conversation.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                      className="h-6 text-sm flex-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-medium truncate text-xs">
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
                          className="h-5 w-5 text-green-500 hover:text-green-600"
                          onClick={(e) => saveEdit(conversation.id, e)}
                        >
                          <Check className="w-2 h-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-500 hover:text-gray-600"
                          onClick={cancelEdit}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </>
                    ) : movingConversationId === conversation.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-blue-500 hover:text-blue-600"
                          onClick={(e) => moveConversationToProject(null, e)}
                          title="Déplacer vers Toutes les conversations"
                        >
                          <Folder className="w-2 h-2" />
                        </Button>
                        {projects.map((project) => (
                          <Button
                            key={project.id}
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-blue-500 hover:text-blue-600"
                            onClick={(e) => moveConversationToProject(project.id, e)}
                            title={`Déplacer vers ${project.name}`}
                          >
                            {renderIcon(project.icon)}
                          </Button>
                        ))}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-500 hover:text-gray-600"
                          onClick={cancelMove}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-400 hover:text-blue-500"
                          onClick={(e) => startMovingConversation(conversation.id, e)}
                          title="Ajouter au dossier"
                        >
                          <Move className="w-2 h-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-400 hover:text-blue-500"
                          onClick={(e) => startEditing(conversation.id, conversation.title, e)}
                        >
                          <Edit className="w-2 h-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-gray-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                        >
                          <Trash2 className="w-2 h-2" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
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