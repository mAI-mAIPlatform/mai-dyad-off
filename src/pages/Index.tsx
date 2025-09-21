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

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  messages: Message[];
  title: string;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'default',
      title: "Nouvelle conversation",
      messages: []
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o');
  const [userName, setUserName] = useState('Utilisateur');
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      messages: []
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
        setCurrentConversationId(conversations.find(conv => conv.id !== id)?.id || 'default');
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle } : conv
    ));
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    showSuccess("Message copié");
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === messageId ? { ...msg, content: newContent } : msg
            )
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
        ? { ...conv, messages: messagesToKeep }
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
            title: shouldUpdateTitle ? content.slice(0, 50) + (content.length > 50 ? '...' : '') : conv.title
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
          ? { ...conv, messages: [...conv.messages, aiResponse] }
          : conv
      );

      setConversations(finalConversations);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const errorConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage] }
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
        {/* Sidebar */}
        <ChatSidebar
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          currentConversationId={currentConversationId}
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
                    />
                  ))}
                  {isLoading && (
                    <ChatMessage
                      id="loading"
                      content=""
                      role="assistant"
                      timestamp={new Date()}
                      isGenerating={true}
                      onEditMessage={() => {}}
                      onCopyMessage={() => {}}
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
            placeholder="Message mAI..."
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;