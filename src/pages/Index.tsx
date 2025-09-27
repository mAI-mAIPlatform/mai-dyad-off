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

/* ... le reste du fichier reste inchangé ... */

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
      const apiMessages: OpenRouterMessage[] = messagesToKeep
        .slice(0, -1) // Exclure le dernier message utilisateur
        .slice(-10) // Limiter à 10 messages
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Ajouter les instructions personnalisées et la personnalité si activées
      let systemMessage = '';
      if (betaFeaturesEnabled) {
        if (customInstructions) {
          systemMessage += `Informations utilisateur : ${customInstructions}. `;
        }
        systemMessage += getPersonalityInstructions(selectedPersonality);
      }

      // Adapter le prompt selon les options de longueur
      let userPrompt = newContent.trim();
      if (options?.length === 'shorter') {
        userPrompt = `Réponds de manière très concise et brève à cette demande : ${userPrompt}`;
      } else if (options?.length === 'longer') {
        userPrompt = `Développe davantage cette réponse avec plus de détails et d'explications : ${userPrompt}`;
      }

      apiMessages.push({
        role: 'user',
        content: userPrompt
      });

      const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages, selectedLanguage);
      
      // Ajouter le message système personnalisé en premier, s’il existe
      if (systemMessage) {
        formattedMessages.unshift({
          role: 'system',
          content: systemMessage
        });
      }

      const modelToUse = options?.model || currentConversation.model;
      const response = await OpenRouterService.sendMessage(formattedMessages, modelToUse);
      
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
      
      // 👉 Utilisation du message d’erreur retourné par OpenRouter (ex. “User not found”)
      const errorMessageContent = error?.message?.includes('User not found')
        ? 'Clé API OpenRouter invalide ou compte non trouvé. Veuillez vérifier votre clé.'
        : t.messages.technicalError;

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
      // Affichage d’un toast d’erreur pour l’utilisateur
      showError(errorMessageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string, isRegeneration = false) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

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
      // Vérifier si le message est une demande de génération d’image
      const isImageRequest = content.toLowerCase().includes('image') || 
                            content.toLowerCase().includes('dessin') || 
                            content.toLowerCase().includes('dessine') ||
                            content.toLowerCase().includes('photo') ||
                            content.toLowerCase().includes('illustration');

      if (isImageRequest) {
        const imageUrl = await generateImage(content);
        const imageMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Voici l'image générée selon votre demande :\n\n![Image générée](${imageUrl})`,
          role: 'assistant',
          timestamp: new Date(),
        };

        const finalConversations = updatedConversations.map(conv =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, imageMessage], updatedAt: new Date() }
            : conv
        );

        setConversations(finalConversations);
      } else {
        // Construction des messages pour l’API
        const apiMessages: OpenRouterMessage[] = currentConversation.messages
          .slice(-10)
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));

        // Ajouter les instructions personnalisées et la personnalité si activées
        let systemMessage = '';
        if (betaFeaturesEnabled) {
          if (customInstructions) {
            systemMessage += `Informations utilisateur : ${customInstructions}. `;
          }
          systemMessage += getPersonalityInstructions(selectedPersonality);
        }

        apiMessages.push({
          role: 'user',
          content: content.trim()
        });

        const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages, selectedLanguage);
        
        if (systemMessage) {
          formattedMessages.unshift({
            role: 'system',
            content: systemMessage
          });
        }

        const response = await OpenRouterService.sendMessage(formattedMessages, currentConversation.model);
        
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
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      const errorMessageContent = error?.message?.includes('User not found')
        ? 'Clé API OpenRouter invalide ou compte non trouvé. Veuillez vérifier votre clé.'
        : t.messages.technicalError;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const errorConversations = updatedConversations.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: new Date() }
          : conv
      );

      setConversations(errorConversations);
      showError(errorMessageContent);
    } finally {
      setIsLoading(false);
    }
  };

/* ... le reste du fichier reste inchangé ... */