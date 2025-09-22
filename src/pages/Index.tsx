"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, type OpenRouterMessage } from "@/services/openrouter";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import { generateGreetingMessages } from "@/utils/greetings";
import { useTranslation } from "@/utils/i18n";
import ModelDropdown from "@/components/ModelDropdown";

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
  model: string;
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
      updatedAt: new Date(),
      model: 'openai/gpt-4o'
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultModel, setDefaultModel] = useState('openai/gpt-4o');
  const [userName, setUserName] = useState('Utilisateur');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [betaFeaturesEnabled, setBetaFeaturesEnabled] = useState(false);
  const [iconColor, setIconColor] = useState('black');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = useTranslation(selectedLanguage);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || conversations[0];

  const handleRegenerateResponse = async (messageId: string, newContent: string, options?: { model?: string, length?: 'shorter' | 'longer' }) => {
    const userMessageIndex = currentConversation.messages.findIndex(msg => msg.id === messageId);
    if (userMessageIndex === -1) return;

    const messagesToKeep = currentConversation.messages.slice(0, userMessageIndex + 1);
    
    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? { ...conv, messages: messagesToKeep, updatedAt: new Date() }
        : conv
    ));

    setIsLoading(true);

    try {
      // Préparer les messages pour l'API
      const apiMessages: OpenRouterMessage[] = messagesToKeep
        .slice(0, -1) // Exclure le dernier message utilisateur
        .slice(-10) // Limiter à 10 messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Ajouter le message utilisateur avec les instructions de longueur
      let userPrompt = newContent.trim();
      let systemMessage = "Tu es mAI, un assistant IA utile, amical et professionnel. Réponds en français de manière claire.";
      
      if (options?.length === 'shorter') {
        systemMessage += " Sois très concis dans ta réponse, maximum 2-3 phrases.";
      } else if (options?.length === 'longer') {
        systemMessage += " Développe ta réponse avec beaucoup de détails et d'explications.";
      }

      apiMessages.unshift({
        role: 'system',
        content: systemMessage
      });

      apiMessages.push({
        role: 'user',
        content: userPrompt
      });

      const modelToUse = options?.model || currentConversation.model;
      const response = await OpenRouterService.sendMessage(apiMessages, modelToUse);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
      };

      const finalConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, aiResponse], updatedAt: new Date() }
          : conv
      );

      setConversations(finalConversations);
    } catch (error: any) {
      console.error('Error:', error);
      
      let errorMessageContent = t.messages.technicalError;
      
      if (error.message && !error.message.includes('technical difficulties')) {
        errorMessageContent = `Erreur: ${error.message}`;
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const errorConversations = conversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: new Date() }
          : conv
      );

      setConversations(errorConversations);
    } finally {
      setIsLoading(false);
    }
  };

  // ... reste du code inchangé ...

};

export default Index;