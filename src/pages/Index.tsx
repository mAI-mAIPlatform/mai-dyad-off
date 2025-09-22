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

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">mAI</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            <button 
              className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                const newId = Date.now().toString();
                setConversations(prev => [...prev, {
                  id: newId,
                  projectId: null,
                  title: "Nouvelle conversation",
                  messages: [],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  model: defaultModel
                }]);
                setCurrentConversationId(newId);
              }}
            >
              + Nouvelle conversation
            </button>
            {conversations.map(conv => (
              <div 
                key={conv.id}
                className={`p-2 rounded cursor-pointer ${
                  currentConversationId === conv.id 
                    ? 'bg-blue-100 dark:bg-blue-900' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                {conv.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {currentConversation.title}
          </h2>
          <div className="flex items-center gap-2">
            <ModelDropdown 
              selectedModel={currentConversation.model}
              onModelChange={(model) => {
                setConversations(prev => prev.map(conv => 
                  conv.id === currentConversationId 
                    ? { ...conv, model } 
                    : conv
                ));
              }}
            />
            <SettingsDialog
              selectedModel={defaultModel}
              onModelChange={setDefaultModel}
              userName={userName}
              onUserNameChange={setUserName}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              betaFeaturesEnabled={betaFeaturesEnabled}
              onBetaFeaturesChange={setBetaFeaturesEnabled}
              iconColor={iconColor}
              onIconColorChange={setIconColor}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentConversation.messages.length === 0 ? (
            <GreetingMessage 
              content={generateGreetingMessages(userName, selectedLanguage)[0].content}
              iconColor={iconColor}
            />
          ) : (
            currentConversation.messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
                onEditMessage={(id, newContent) => {
                  setConversations(prev => prev.map(conv => 
                    conv.id === currentConversationId
                      ? {
                          ...conv,
                          messages: conv.messages.map(msg => 
                            msg.id === id ? { ...msg, content: newContent } : msg
                          ),
                          updatedAt: new Date()
                        }
                      : conv
                  ));
                }}
                onCopyMessage={(content) => {
                  navigator.clipboard.writeText(content);
                  showSuccess(t.messages.copied);
                }}
                onRegenerateResponse={handleRegenerateResponse}
                language={selectedLanguage}
                iconColor={iconColor}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={async (content) => {
            const userMessage: Message = {
              id: Date.now().toString(),
              content,
              role: 'user',
              timestamp: new Date(),
            };

            // Mettre à jour la conversation avec le message utilisateur
            const updatedConversations = conversations.map(conv =>
              conv.id === currentConversationId
                ? {
                    ...conv,
                    messages: [...conv.messages, userMessage],
                    title: conv.messages.length === 0 ? content.substring(0, 30) + (content.length > 30 ? '...' : '') : conv.title,
                    updatedAt: new Date()
                  }
                : conv
            );

            setConversations(updatedConversations);
            setIsLoading(true);

            try {
              // Préparer les messages pour l'API
              const apiMessages: OpenRouterMessage[] = [
                ...updatedConversations.find(c => c.id === currentConversationId)?.messages
                  .slice(-10) // Limiter à 10 messages
                  .map(msg => ({
                    role: msg.role,
                    content: msg.content
                  })) || []
              ];

              const response = await OpenRouterService.sendMessage(
                apiMessages,
                currentConversation.model
              );

              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response.choices[0].message.content,
                role: 'assistant',
                timestamp: new Date(),
              };

              setConversations(prev => prev.map(conv =>
                conv.id === currentConversationId
                  ? { ...conv, messages: [...conv.messages, aiMessage], updatedAt: new Date() }
                  : conv
              ));
            } catch (error) {
              console.error('Error:', error);
              const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                content: t.messages.technicalError,
                role: 'assistant',
                timestamp: new Date(),
              };
              setConversations(prev => prev.map(conv =>
                conv.id === currentConversationId
                  ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: new Date() }
                  : conv
              ));
            } finally {
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          placeholder={t.chat.placeholder}
          language={selectedLanguage}
          iconColor={iconColor}
        />
      </div>
    </div>
  );
};

export default Index;