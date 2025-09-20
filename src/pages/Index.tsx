"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

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
      messages: [
        {
          id: '1',
          content: "Bonjour ! Je suis mAI, votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
          role: 'assistant',
          timestamp: new Date()
        }
      ]
    }
  ]);
  const [currentConversationId, setCurrentConversationId] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation.messages]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      messages: [
        {
          id: '1',
          content: "Bonjour ! Je suis mAI, votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
          role: 'assistant',
          timestamp: new Date()
        }
      ]
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // Update conversation with user message
    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: conv.title === "Nouvelle conversation" ? content.slice(0, 50) + '...' : conv.title
          }
        : conv
    );

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      // Prepare messages for API
      const apiMessages: OpenRouterMessage[] = currentConversation.messages
        .slice(-20) // Keep last 20 messages for context
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      apiMessages.push({
        role: 'user',
        content: content.trim()
      });

      const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages);

      // Call OpenRouter API
      const response = await OpenRouterService.sendMessage(formattedMessages, selectedModel);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date()
      };

      // Update conversation with AI response
      const finalConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, aiResponse] }
          : conv
      );

      setConversations(finalConversations);
      showSuccess("Réponse reçue");
    } catch (error) {
      console.error('Error:', error);
      showError("Erreur de communication avec l'IA");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?",
        role: 'assistant',
        timestamp: new Date()
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

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    showSuccess(isPositive ? "Merci pour votre retour 👍" : "Retour enregistré 👎");
  };

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <ChatSidebar
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentConversation.title}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {currentConversation.messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
                timestamp={message.timestamp}
                onFeedback={(isPositive) => handleFeedback(message.id, isPositive)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Message mAI..."
        />
      </div>
    </div>
  );
};

export default Index;