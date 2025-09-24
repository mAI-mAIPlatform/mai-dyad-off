"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Trash2, Edit, Check, X, Folder, Move, Ghost, Star, Lock, Unlock } from "lucide-react";
import { useTranslation } from "@/utils/i18n";
import IconPicker from "./IconPicker";
import MoveToProjectDialog from "./MoveToProjectDialog";
import CustomModelDialog, { CustomModel } from "./CustomModelDialog";
import MAIsManager from "./MAIsManager";
import * as LucideIcons from "lucide-react";

interface Conversation {
  id: string;
  projectId: string | null;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isGhost?: boolean;
  accessCode?: string;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  accessCode?: string;
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
  onNewGhostChat: () => void;
  customModels: CustomModel[];
  onCreateCustomModel: (model: CustomModel) => void;
  onUpdateCustomModel: (model: CustomModel) => void;
  onDeleteCustomModel: (id: string) => void;
  betaFeaturesEnabled: boolean;
  onSetConversationAccessCode: (id: string, code: string) => void;
  onSetProjectAccessCode: (id: string, code: string) => void;
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
  iconColor,
  onNewGhostChat,
  customModels,
  onCreateCustomModel,
  onUpdateCustomModel,
  onDeleteCustomModel,
  betaFeaturesEnabled,
  onSetConversationAccessCode,
  onSetProjectAccessCode
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState('folder');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectIcon, setEditProjectIcon] = useState('folder');
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedConversationToMove, setSelectedConversationToMove] = useState<string | null>(null);
  const [showGhostButton, setShowGhostButton] = useState(true);
  const [customModelDialogOpen, setCustomModelDialogOpen] = useState(false);
  const [showMAIsManager, setShowMAIsManager] = useState(false);
  
  // États pour les codes d'accès
  const [accessCodeDialogOpen, setAccessCodeDialogOpen] = useState(false);
  const [accessCodeTarget, setAccessCodeTarget] = useState<{type: 'project' | 'conversation', id: string} | null>(null);
  const [accessCodeStep, setAccessCodeStep] = useState<'create' | 'confirm' | 'enterOld' | 'enterNew' | 'confirmNew'>('create');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeConfirm, setAccessCodeConfirm] = useState('');
  const [accessCodeOld, setAccessCodeOld] = useState('');
  const [accessCodeNew, setAccessCodeNew] = useState('');
  const [accessCodeConfirmNew, setAccessCodeConfirmNew] = useState('');
  
  // État pour la vérification des codes d'accès
  const [accessCodeCheckDialogOpen, setAccessCodeCheckDialogOpen] = useState(false);
  const [accessCodeCheckInput, setAccessCodeCheckInput] = useState('');
  const [accessCheckTarget, setAccessCheckTarget] = useState<{type: 'project' | 'conversation', id: string} | null>(null);
  
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

  const filteredConversations = currentProjectId 
    ? conversations.filter(conv => conv.projectId === currentProjectId && !conv.isGhost)
    : conversations.filter(conv => conv.projectId === null && !conv.isGhost);

  const handleCreateProjectInternal = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectIcon);
      setNewProjectName('');
      setNewProjectIcon('folder');
      setIsCreatingProject(false);
    }
  };

  const handleProjectKeyPress = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      if (editProjectName.trim()) {
        onUpdateProject(projectId, editProjectName.trim(), editProjectIcon);
        setEditingProjectId(null);
      }
    }
    if (e.key === 'Escape') {
      setEditingProjectId(null);
    }
  };

  const saveProjectEdit = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editProjectName.trim()) {
      onUpdateProject(projectId, editProjectName.trim(), editProjectIcon);
      setEditingProjectId(null);
    }
  };

  const cancelProjectEdit = () => {
    setEditingProjectId(null);
  };

  const startEditingProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditProjectName(project.name);
    setEditProjectIcon(project.icon);
  };

  const renderIcon = (iconName: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || Folder;
    return <IconComponent className={`w-4 h-4 ${getIconColorClass()}`} />;
  };

  const handleKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === 'Enter') {
      if (editTitle.trim()) {
        onRenameConversation(conversationId, editTitle.trim());
        setEditingId(null);
      }
    }
    if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const saveEdit = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const startMovingConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConversationToMove(conversationId);
    setMoveDialogOpen(true);
  };

  const handleMoveToProject = (projectId: string | null) => {
    if (selectedConversationToMove) {
      onMoveConversationToProject(selectedConversationToMove, projectId);
    }
    setMoveDialogOpen(false);
    setSelectedConversationToMove(null);
  };

  const startEditing = (conversationId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversationId);
    setEditTitle(title);
  };

  // Fonctions pour gérer les codes d'accès
  const openAccessCodeDialog = (type: 'project' | 'conversation', id: string) => {
    const target = type === 'project' 
      ? projects.find(p => p.id === id)
      : conversations.find(c => c.id === id);
    
    setAccessCodeTarget({type, id});
    
    if (target?.accessCode) {
      setAccessCodeStep('enterOld');
    } else {
      setAccessCodeStep('create');
    }
    
    setAccessCodeDialogOpen(true);
    resetAccessCodeInputs();
  };

  const resetAccessCodeInputs = () => {
    setAccessCodeInput('');
    setAccessCodeConfirm('');
    setAccessCodeOld('');
    setAccessCodeNew('');
    setAccessCodeConfirmNew('');
  };

  const handleAccessCodeSubmit = () => {
    if (!accessCodeTarget) return;
    
    switch (accessCodeStep) {
      case 'create':
        setAccessCodeStep('confirm');
        break;
        
      case 'confirm':
        if (accessCodeInput === accessCodeConfirm && accessCodeInput.length === 4 && /^\d+$/.test(accessCodeInput)) {
          if (accessCodeTarget.type === 'project') {
            onSetProjectAccessCode(accessCodeTarget.id, accessCodeInput);
          } else {
            onSetConversationAccessCode(accessCodeTarget.id, accessCodeInput);
          }
          setAccessCodeDialogOpen(false);
          resetAccessCodeInputs();
        }
        break;
        
      case 'enterOld':
        const target = accessCodeTarget.type === 'project' 
          ? projects.find(p => p.id === accessCodeTarget.id)
          : conversations.find(c => c.id === accessCodeTarget.id);
          
        if (target?.accessCode === accessCodeOld) {
          setAccessCodeStep('enterNew');
        }
        break;
        
      case 'enterNew':
        setAccessCodeStep('confirmNew');
        break;
        
      case 'confirmNew':
        if (accessCodeNew === accessCodeConfirmNew && accessCodeNew.length === 4 && /^\d+$/.test(accessCodeNew)) {
          if (accessCodeTarget.type === 'project') {
            onSetProjectAccessCode(accessCodeTarget.id, accessCodeNew);
          } else {
            onSetConversationAccessCode(accessCodeTarget.id, accessCodeNew);
          }
          setAccessCodeDialogOpen(false);
          resetAccessCodeInputs();
        }
        break;
    }
  };

  const handleAccessCodeCancel = () => {
    setAccessCodeDialogOpen(false);
    resetAccessCodeInputs();
  };

  const handleAccessCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAccessCodeSubmit();
    }
    if (e.key === 'Escape') {
      handleAccessCodeCancel();
    }
  };

  // Fonction pour vérifier l'accès à un élément protégé
  const checkAccessCode = (type: 'project' | 'conversation', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const target = type === 'project' 
      ? projects.find(p => p.id === id)
      : conversations.find(c => c.id === id);
    
    if (target?.accessCode) {
      setAccessCheckTarget({type, id});
      setAccessCodeCheckInput('');
      setAccessCodeCheckDialogOpen(true);
    } else {
      // Si pas de code d'accès, sélectionner normalement
      if (type === 'project') {
        onSelectProject(id);
      } else {
        onSelectConversation(id);
      }
    }
  };

  const handleAccessCodeCheck = () => {
    if (!accessCheckTarget) return;
    
    const target = accessCheckTarget.type === 'project' 
      ? projects.find(p => p.id === accessCheckTarget.id)
      : conversations.find(c => c.id === accessCheckTarget.id);
    
    if (target?.accessCode === accessCodeCheckInput) {
      if (accessCheckTarget.type === 'project') {
        onSelectProject(accessCheckTarget.id);
      } else {
        onSelectConversation(accessCheckTarget.id);
      }
      setAccessCodeCheckDialogOpen(false);
      setAccessCodeCheckInput('');
    }
  };

  const handleAccessCodeCheckCancel = () => {
    setAccessCodeCheckDialogOpen(false);
    setAccessCodeCheckInput('');
  };

  const handleAccessCodeCheckKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAccessCodeCheck();
    }
    if (e.key === 'Escape') {
      handleAccessCodeCheckCancel();
    }
  };

  return (
    <>
      <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
        {!showMAIsManager ? (
          <>
            <div className="p-2 border-b border-gray-200 dark:border-gray-800">
              <div className="space-y-1 relative">
                <div className="flex gap-1">
                  <Button
                    onClick={onNewChat}
                    className="flex-1 justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs h-7"
                  >
                    <Plus className={`w-3 h-3 mr-1 ${getIconColorClass()}`} />
                    {t.chat.newConversation}
                  </Button>
                  
                  <Button
                    onClick={onNewGhostChat}
                    className="h-7 w-7 p-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    title={t.ghost.newChat}
                  >
                    <Ghost className={`w-3 h-3 ${getIconColorClass()}`} />
                  </Button>
                </div>
                
                <Button
                  onClick={() => setIsCreatingProject(true)}
                  className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs h-7"
                >
                  <Folder className={`w-3 h-3 mr-1 ${getIconColorClass()}`} />
                  Nouveau projet
                </Button>
              </div>
            </div>

            {isCreatingProject && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-800">
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
                        if (e.key === 'Enter') handleCreateProjectInternal();
                        if (e.key === 'Escape') setIsCreatingProject(false);
                      }}
                      placeholder="Nom du projet"
                      className="flex-1 h-7 text-xs"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={handleCreateProjectInternal}
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

            {projects.length > 0 && (
              <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-xs font-medium mb-1 px-1 text-gray-500 uppercase tracking-wide">Projets</h3>
                <div className="space-y-1">
                  <Card
                    className={`p-2 cursor-pointer transition-colors text-xs ${
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
                      className={`p-2 cursor-pointer transition-colors text-xs ${
                        currentProjectId === project.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={(e) => checkAccessCode('project', project.id, e)}
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
                                className="h-6 text-xs flex-1"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-center w-4 h-4">
                                {renderIcon(project.icon)}
                              </div>
                              <span className="font-medium truncate">
                                {project.name}
                              </span>
                              {project.accessCode && (
                                <Lock className="w-3 h-3 text-gray-500 ml-1 flex-shrink-0" />
                              )}
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
                              className="h-5 w-5 text-gray-400 hover:text-purple-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAccessCodeDialog('project', project.id);
                              }}
                            >
                              <Lock className="w-2 h-2" />
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

            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="text-xs font-medium mb-1 px-1 text-gray-500 uppercase tracking-wide">Conversations</h3>
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`p-2 cursor-pointer transition-colors text-xs ${
                      currentConversationId === conversation.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={(e) => checkAccessCode('conversation', conversation.id, e)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className={`w-3 h-3 text-gray-500 flex-shrink-0 ${getIconColorClass()}`} />
                        {editingId === conversation.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                            className="h-6 text-xs flex-1"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium truncate">
                            {conversation.title}
                          </span>
                        )}
                        {conversation.accessCode && (
                          <Lock className="w-3 h-3 text-gray-500 ml-1 flex-shrink-0" />
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
                                onClick={(e) => startMovingConversation(conversation.id, e)}
                                title="Déplacer vers un dossier"
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
                                className="h-5 w-5 text-gray-400 hover:text-purple-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAccessCodeDialog('conversation', conversation.id);
                                }}
                              >
                                <Lock className="w-2 h-2" />
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

            {/* Bouton mAIs (Bêta) */}
            <div className="p-2 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={() => setShowMAIsManager(true)}
                className={`w-full justify-start text-xs h-8 ${
                  betaFeaturesEnabled 
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                }`}
                disabled={!betaFeaturesEnabled}
              >
                <Star className={`w-3 h-3 mr-2 ${getIconColorClass()}`} />
                mAIs (Bêta)
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMAIsManager(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Retour
              </Button>
              <Button
                onClick={() => setCustomModelDialogOpen(true)}
                disabled={!betaFeaturesEnabled}
                className={!betaFeaturesEnabled ? "bg-gray-400 cursor-not-allowed" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau mAI
              </Button>
            </div>

            <MAIsManager
              customModels={customModels}
              onCreateModel={onCreateCustomModel}
              onUpdateModel={onUpdateCustomModel}
              onDeleteModel={onDeleteCustomModel}
              iconColor={iconColor}
              language={language}
              betaFeaturesEnabled={betaFeaturesEnabled}
            />
          </div>
        )}
      </div>

      <MoveToProjectDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        projects={projects}
        onMoveToProject={handleMoveToProject}
        iconColor={iconColor}
        language={language}
      />
      
      <CustomModelDialog
        open={customModelDialogOpen}
        onOpenChange={setCustomModelDialogOpen}
        onCreateModel={onCreateCustomModel}
        iconColor={iconColor}
        language={language}
      />
      
      {/* Dialog pour les codes d'accès */}
      {accessCodeDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">
              {accessCodeStep === 'create' || accessCodeStep === 'confirm' 
                ? 'Créer un code d\'accès' 
                : accessCodeStep === 'enterOld' 
                  ? 'Entrez l\'ancien code' 
                  : 'Modifier le code d\'accès'}
            </h3>
            
            {accessCodeStep === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code d'accès (4 chiffres)</label>
                  <Input
                    type="password"
                    value={accessCodeInput}
                    onChange={(e) => setAccessCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={handleAccessCodeKeyPress}
                    placeholder="0000"
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez un code à 4 chiffres</p>
                </div>
              </div>
            )}
            
            {accessCodeStep === 'confirm' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmez le code</label>
                  <Input
                    type="password"
                    value={accessCodeConfirm}
                    onChange={(e) => setAccessCodeConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={handleAccessCodeKeyPress}
                    placeholder="0000"
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Confirmez votre code d'accès</p>
                </div>
                {accessCodeInput !== accessCodeConfirm && (
                  <p className="text-xs text-red-500">Les codes ne correspondent pas</p>
                )}
              </div>
            )}
            
            {accessCodeStep === 'enterOld' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ancien code d'accès</label>
                  <Input
                    type="password"
                    value={accessCodeOld}
                    onChange={(e) => setAccessCodeOld(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={handleAccessCodeKeyPress}
                    placeholder="0000"
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez votre code d'accès actuel</p>
                </div>
              </div>
            )}
            
            {accessCodeStep === 'enterNew' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nouveau code d'accès</label>
                  <Input
                    type="password"
                    value={accessCodeNew}
                    onChange={(e) => setAccessCodeNew(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={handleAccessCodeKeyPress}
                    placeholder="0000"
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez un nouveau code à 4 chiffres</p>
                </div>
              </div>
            )}
            
            {accessCodeStep === 'confirmNew' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmez le nouveau code</label>
                  <Input
                    type="password"
                    value={accessCodeConfirmNew}
                    onChange={(e) => setAccessCodeConfirmNew(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyDown={handleAccessCodeKeyPress}
                    placeholder="0000"
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">Confirmez votre nouveau code d'accès</p>
                </div>
                {accessCodeNew !== accessCodeConfirmNew && (
                  <p className="text-xs text-red-500">Les codes ne correspondent pas</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleAccessCodeCancel}>
                Annuler
              </Button>
              <Button 
                onClick={handleAccessCodeSubmit}
                disabled={
                  (accessCodeStep === 'create' && accessCodeInput.length !== 4) ||
                  (accessCodeStep === 'confirm' && accessCodeConfirm.length !== 4) ||
                  (accessCodeStep === 'enterOld' && accessCodeOld.length !== 4) ||
                  (accessCodeStep === 'enterNew' && accessCodeNew.length !== 4) ||
                  (accessCodeStep === 'confirmNew' && accessCodeConfirmNew.length !== 4)
                }
              >
                {accessCodeStep === 'create' || accessCodeStep === 'enterNew' ? 'Suivant' : 
                 accessCodeStep === 'confirm' || accessCodeStep === 'confirmNew' ? 'Confirmer' : 'Valider'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dialog pour vérifier les codes d'accès */}
      {accessCodeCheckDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Code d'accès requis</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Entrez le code d'accès</label>
                <Input
                  type="password"
                  value={accessCodeCheckInput}
                  onChange={(e) => setAccessCodeCheckInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onKeyDown={handleAccessCodeCheckKeyPress}
                  placeholder="0000"
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Code à 4 chiffres requis</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleAccessCodeCheckCancel}>
                Annuler
              </Button>
              <Button 
                onClick={handleAccessCodeCheck}
                disabled={accessCodeCheckInput.length !== 4}
              >
                Valider
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;