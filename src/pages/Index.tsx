"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import { ImageGenerationService, GeneratedImage } from "@/services/image-generation";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ImageMessage from "@/components/ImageMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import { generateGreetingMessages } from "@/utils/greetings";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'image';
  imageData?: GeneratedImage;
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
  const [userName, setUserName] = useState('Utilisateur');
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
    if (savedUserName) {
      setUserName(savedUserName);
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

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const handleRegenerateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const image = await ImageGenerationService.generateImage({
        prompt: prompt,
        model: 'openai/dall-e-3'
      });

      const imageMessage: Message = {
        id: Date.now().toString(),
        content: `Image générée: ${prompt}`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'image',
        imageData: image
      };

      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, imageMessage] }
          : conv
      ));
    } catch (error) {
      showError("Erreur lors de la régénération de l'image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isGeneratingImage) return;

    // Vérifier si c'est une demande de génération d'image
    if (ImageGenerationService.isImagePrompt(content)) {
      await handleGenerateImage(content);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

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
      const apiMessages: OpenRouterMessage[] = currentConversation.messages
        .slice(-20)
        .filter(msg => msg.type === 'text')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      apiMessages.push({
        role: 'user',
        content: content.trim()
      });

      const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages);
      const response = await OpenRouterService.sendMessage(formattedMessages, selectedModel);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
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
        type: 'text'
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

  const handleGenerateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt.trim(),
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    const updatedConversations = conversations.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: conv.title === "Nouvelle conversation" ? "Génération d'image" : conv.title
          }
        : conv
    );

    setConversations(updatedConversations);

    try {
      const image = await ImageGenerationService.generateImage({
        prompt: prompt,
        model: 'openai/dall-e-3'
      });

      const imageMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Image générée: ${prompt}`,
        role: 'assistant',
        timestamp: new Date(),
        type: 'image',
        imageData: image
      };

      const finalConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, imageMessage] }
          : conv
      );

      setConversations(finalConversations);
    } catch (error) {
      console.error('Error generating image:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolé, je n'ai pas pu générer l'image. Veuillez réessayer.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      
      const errorConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      );

      setConversations(errorConversations);
    } finally {
      setIsGeneratingImage(false);
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
              />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {shouldShowGreeting ? (
                <GreetingMessage content={generateGreetingMessages(userName)[0].content} />
              ) : (
                <>
                  {currentConversation.messages.map((message) => (
                    message.type === 'image' && message.imageData ? (
                      <ImageMessage
                        key={message.id}
                        image={message.imageData}
                        onRegenerate={handleRegenerateImage}
                      />
                    ) : (
                      <ChatMessage
                        key={message.id}
                        id={message.id}
                        content={message.content}
                        role={message.role}
                        timestamp={message.timestamp}
                        onEditMessage={handleEditMessage}
                        onCopyMessage={handleCopyMessage}
                      />
                    )
                  ))}
                  {(isLoading || isGeneratingImage) && (
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
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isGeneratingImage}
            placeholder="Message mAI ou demandez une image..."
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;