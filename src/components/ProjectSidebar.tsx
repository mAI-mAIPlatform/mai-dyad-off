"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Trash2, Edit, Check, X, FolderPlus } from "lucide-react";
import ProjectDialog from "@/components/ProjectDialog";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
  projectId?: string; // Référence au projet
}

interface Project {
  id: string;
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  conversationIds: string[];
}

interface ProjectSidebarProps {
  projects: Project[];
  conversations: Conversation[];
  currentConversationId: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'conversationIds'>) => void;
  onAddConversationToProject: (conversationId: string, projectId: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onProjectCreate,
  onAddConversationToProject
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      timestamp: new Date()
    };
    onNewChat();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length > 1) {
      onDeleteConversation(id);
    }
  };

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

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Conversations non assignées à un projet
  const unassignedConversations = conversations.filter(conv => !conv.projectId);

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 mb-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
        
        <ProjectDialog onProjectCreate={onProjectCreate} />
      </div>

      {/* Projects and Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {/* Projets */}
          {projects.map((project) => {
            const projectConversations = conversations.filter(conv => conv.projectId === project.id);
            const isExpanded = expandedProjects[project.id];
            
            return (
              <div key={project.id} className="space-y-1">
                <Card 
                  className="p-3 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg">{project.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{project.title}</h3>
                        {project.description && (
                          <p className="text-xs text-gray-500 truncate">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
                
                {isExpanded && (
                  <div className="ml-4 pl-2 border-l border-gray-200 dark:border-gray-700 space-y-1">
                    {projectConversations.map((conversation) => (
                      <Card
                        key={conversation.id}
                        className={`p-2 cursor-pointer transition-colors ${
                          currentConversationId === conversation.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MessageSquare className="w-3 h-3 text-gray-500 flex-shrink-0" />
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
                              <span className="text-sm truncate">
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
                              ) : (
                                <>
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
                                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                  >
                                    <Trash2 className="w-2 h-2" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 ml-5">
                          {conversation.timestamp.toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Conversations non assignées */}
          {unassignedConversations.length > 0 && (
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                Conversations non assignées
              </h3>
              {unassignedConversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`p-2 cursor-pointer transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3 h-3 text-gray-500 flex-shrink-0" />
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
                        <span className="text-sm truncate">
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
                        ) : (
                          <>
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
                              onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            >
                              <Trash2 className="w-2 h-2" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 ml-5">
                    {conversation.timestamp.toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant temporaire pour les icônes
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default ProjectSidebar;