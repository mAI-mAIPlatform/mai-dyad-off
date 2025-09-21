"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import ProjectManager from "@/components/ProjectManager";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import { generateGreetingMessages } from "@/utils/greetings";
import { useTranslation } from "@/utils/i18n";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  projectId: string | null;
  messages: Message[];
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

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'default',
      projectId: null,
      title: "Nouvelle conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [userName, setUserName] = useState('Utilisateur');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = useTranslation(selectedLanguage);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation.messages]);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  // Gestion des projets
  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      icon: '📁', // Icône par défaut
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
    showSuccess(`Projet "${name}" créé avec succès`);
  };

  const handleUpdateProject = (id: string, name: string) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, name, updatedAt: new Date() } 
        : project
    ));
    showSuccess("Projet mis à jour");
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    
    // Déplacer les conversations de ce projet vers "Toutes les conversations"
    setConversations(prev => prev.map(conv => 
      conv.projectId === id ? { ...conv, projectId: null } : conv
    ));
    
    // Si le projet actuel est supprimé, revenir à "Toutes les conversations"
    if (currentProjectId === id) {
      setCurrentProjectId(null);
    }
    
    showSuccess("Projet supprimé");
  };

  const handleSelectProject = (id: string | null) => {
    setCurrentProjectId(id);
    
    // Sélectionner la première conversation du projet ou créer une nouvelle
    const projectConversations = id 
      ? conversations.filter(conv => conv.projectId === id)
      : conversations.filter(conv => conv.projectId === null);
    
    if (projectConversations.length > 0) {
      setCurrentConversationId(projectConversations[0].id);
    } else {
      handleNewChat();
    }
  };

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      projectId: currentProjectId,
      title: t.chat.newConversation,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    if (conversations.length > 1) {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversationId === id) {
        const projectConversations = currentProjectId 
          ? conversations.filter(conv => conv.projectId === currentProjectId && conv.id !== id)
          : conversations.filter(conv => conv.projectId === null && conv.id !== id);
        
        setCurrentConversationId(projectConversations[0]?.id || 'default');
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id 
        ? { ...conv, title: newTitle, updatedAt: new Date() } 
        : conv
    ));
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    showSuccess(t.messages.copied);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId ? { ...msg, content: newContent } : msg
            ),
            updatedAt: new Date()
          }
        : conv
    ));
  };

  const handleRegenerateResponse = async (messageId: string, newContent: string) => {
    // Trouver le message utilisateur modifié
    const userMessageIndex = currentConversation.messages.findIndex(msg => msg.id === messageId);
    if (userMessageIndex === -1) return;

    // Supprimer toutes les réponses de l'IA après le message modifié
    const messagesToKeep = currentConversation.messages.slice(0, userMessageIndex + 1);
    
    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? { ...conv, messages: messagesToKeep, updatedAt: new Date() }
        : conv
    ));

    // Régénérer la réponse de l'IA
    await handleSendMessage(newContent, true);
  };

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  const handleSendMessage = async (content: string, isRegeneration = false) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // Mettre à jour le titre de la conversation avec le premier message
    const shouldUpdateTitle = currentConversation.messages.length === 0 && !isRegeneration;

    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: shouldUpdateTitle ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : conv.title,
            updatedAt: new Date()
          }
        : conv
    );

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      const apiMessages: OpenRouterMessage[] = currentConversation.messages
        .slice(-20)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      apiMessages.push({
        role: 'user',
        content: content.trim()
      });

      const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages, selectedLanguage);
      const response = await OpenRouterService.sendMessage(formattedMessages, selectedModel);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      const finalConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, aiResponse], updatedAt: new Date() }
          : conv
      );

      setConversations(finalConversations);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t.messages.technicalError,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const errorConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: new Date() }
          : conv
      );

      setConversations(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowGreeting = currentConversation.messages.length === 0;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen flex bg-white dark:bg-gray-900">
        {/* Project Manager Sidebar */}
        <ProjectManager
          projects={projects}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={handleSelectProject}
          currentProjectId={currentProjectId}
          language={selectedLanguage}
        />

        {/* Conversations Sidebar */}
        <ChatSidebar
          conversations={conversations}
          currentProjectId={currentProjectId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          currentConversationId={currentConversationId}
          language={selectedLanguage}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentConversation.title}
              </h1>
              <SettingsDialog
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                userName={userName}
                onUserNameChange={handleUserNameChange}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {shouldShowGreeting ? (
                <GreetingMessage content={generateGreetingMessages(userName, selectedLanguage)[0].content} />
              ) : (
                <>
                  {currentConversation.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      id={message.id}
                      content={message.content}
                      role={message.role}
                      timestamp={message.timestamp}
                      onEditMessage={handleEditMessage}
                      onCopyMessage={handleCopyMessage}
                      onRegenerateResponse={handleRegenerateResponse}
                      language={selectedLanguage}
                    />
                  ))}
                  {isLoading && (
                    <ChatMessage
                      id="loading"
                      content={t.messages.generating}
                      role="assistant"
                      timestamp={new Date()}
                      isGenerating={true}
                      onEditMessage={() => {}}
                      onCopyMessage={() => {}}
                      language={selectedLanguage}
                    />
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={(content) => handleSendMessage(content, false)}
            isLoading={isLoading}
            language={selectedLanguage}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;