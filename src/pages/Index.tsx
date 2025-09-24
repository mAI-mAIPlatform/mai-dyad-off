"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import { generateGreetingMessages } from "@/utils/greetings";
import { useTranslation } from "@/utils/i18n";
import ModelDropdown from "@/components/ModelDropdown";
import { CustomModel } from "@/components/CustomModelDialog";

// ... (keep all existing interfaces and state declarations)

const Index = () => {
  // ... (keep all existing state declarations)

  // Add these functions for custom models management
  const handleCreateCustomModel = (model: CustomModel) => {
    const newCustomModels = [...customModels, model];
    setCustomModels(newCustomModels);
    localStorage.setItem('customModels', JSON.stringify(newCustomModels));
    showSuccess(`Modèle "${model.name}" créé avec succès`);
  };

  const handleUpdateCustomModel = (model: CustomModel) => {
    const updatedCustomModels = customModels.map(m => 
      m.id === model.id ? model : m
    );
    setCustomModels(updatedCustomModels);
    localStorage.setItem('customModels', JSON.stringify(updatedCustomModels));
    showSuccess(`Modèle "${model.name}" modifié avec succès`);
  };

  const handleDeleteCustomModel = (modelId: string) => {
    const updatedCustomModels = customModels.filter(m => m.id !== modelId);
    setCustomModels(updatedCustomModels);
    localStorage.setItem('customModels', JSON.stringify(updatedCustomModels));
    
    // Update conversations using this model
    setConversations(prev => prev.map(conv => 
      conv.model === modelId ? { ...conv, model: defaultModel } : conv
    ));
    
    showSuccess("Modèle supprimé avec succès");
  };

  // ... (rest of the existing code remains the same)

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen flex bg-white dark:bg-gray-900">
        <ChatSidebar
          projects={projects}
          conversations={conversations}
          currentProjectId={currentProjectId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onSelectProject={handleSelectProject}
          onMoveConversationToProject={handleMoveConversationToProject}
          currentConversationId={currentConversationId}
          language={selectedLanguage}
          iconColor={iconColor}
          onNewGhostChat={handleNewGhostChat}
          customModels={customModels}
          onCreateCustomModel={handleCreateCustomModel}
          onUpdateCustomModel={handleUpdateCustomModel}
          onDeleteCustomModel={handleDeleteCustomModel}
          betaFeaturesEnabled={betaFeaturesEnabled}
        />

        {/* ... (rest of the component remains the same) */}
      </div>
    </ThemeProvider>
  );
};

export default Index;