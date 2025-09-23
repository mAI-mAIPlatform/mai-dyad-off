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
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('default');
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
    const savedBetaFeatures = localStorage.getItem('betaFeaturesEnabled');
    const savedIconColor = localStorage.getItem('iconColor');
    const savedDefaultModel = localStorage.getItem('defaultModel');
    const savedCustomInstructions = localStorage.getItem('customInstructions');
    const savedPersonality = localStorage.getItem('selectedPersonality');
    
    if (savedUserName) {
      setUserName(savedUserName);
    }
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
    if (savedBetaFeatures) {
      setBetaFeaturesEnabled(savedBetaFeatures === 'true');
    }
    if (savedIconColor) {
      setIconColor(savedIconColor);
    }
    if (savedDefaultModel) {
      setDefaultModel(savedDefaultModel);
    }
    if (savedCustomInstructions) {
      setCustomInstructions(savedCustomInstructions);
    }
    if (savedPersonality) {
      setSelectedPersonality(savedPersonality);
    }
  }, []);

  const getPersonalityInstructions = (personality: string): string => {
    const instructions: Record<string, string> = {
      'default': 'Réponds de manière standard et neutre.',
      'professional': 'Réponds de manière formelle, précise et orientée résultats. Utilise un langage professionnel et évite les familiarités.',
      'empathetic': 'Réponds avec bienveillance, compréhension et encouragement. Sois chaleureux et soutenant.',
      'genz': 'Réponds de manière décontractée avec des expressions modernes et actuelles. Utilise un langage jeune et dynamique.',
      'depressive': 'Réponds de manière pessimiste et mélancolique. Exprime du désespoir et de la tristesse.',
      'enthusiastic': 'Réponds avec énergie et positivité. Sois excité et motivant.',
      'sarcastic': 'Réponds de manière ironique et humoristique. Utilise du sarcasme et de l\'auto-dérision.',
      'technical': 'Réponds de manière précise, détaillée et orientée données. Utilise un langage technique et spécialisé.'
    };
    return instructions[personality] || instructions['default'];
  };

  const handleCreateProject = (name: string, icon: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      icon,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
    showSuccess(`Projet "${name}" créé avec succès`);
  };

  const handleUpdateProject = (id: string, name: string, icon: string) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, name, icon, updatedAt: new Date() } 
        : project
    ));
    showSuccess("Projet mis à jour");
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    
    setConversations(prev => prev.map(conv => 
      conv.projectId === id ? { ...conv, projectId: null } : conv
    ));
    
    if (currentProjectId === id) {
      setCurrentProjectId(null);
    }
    
    showSuccess("Projet supprimé");
  };

  const handleSelectProject = (id: string | null) => {
    setCurrentProjectId(id);
    
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
      updatedAt: new Date(),
      model: defaultModel
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

  const handleMoveConversationToProject = (conversationId: string, projectId: string | null) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, projectId, updatedAt: new Date() } 
        : conv
    ));
    
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversationId === currentConversationId && conversation?.projectId !== currentProjectId) {
      const projectConversations = currentProjectId 
        ? conversations.filter(conv => conv.projectId === currentProjectId && conv.id !== conversationId)
        : conversations.filter(conv => conv.projectId === null && conv.id !== conversationId);
      
      if (projectConversations.length > 0) {
        setCurrentConversationId(projectConversations[0].id);
      } else {
        handleNewChat();
      }
    }
    
    showSuccess("Conversation déplacée avec succès");
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
      
      if (options?.length === 'shorter') {
        userPrompt = `Réponds de manière très concise et brève à cette demande : ${userPrompt}`;
      } else if (options?.length === 'longer') {
        userPrompt = `Développe davantage cette réponse avec plus de détails et d'explications : ${userPrompt}`;
      }

      apiMessages.push({
        role: 'user',
        content: userPrompt
      });

      // Ajouter les instructions personnalisées et la personnalité si activées
      let systemMessage = '';
      if (betaFeaturesEnabled) {
        if (customInstructions) {
          systemMessage += `Informations utilisateur : ${customInstructions}. `;
        }
        systemMessage += getPersonalityInstructions(selectedPersonality);
      }

      const formattedMessages = OpenRouterService.formatMessagesForAPI(apiMessages, selectedLanguage);
      
      // Ajouter le message système personnalisé en premier
      if (systemMessage) {
        formattedMessages.unshift({
          role: 'system',
          content: systemMessage
        });
      }
      
      // Utiliser le modèle spécifié ou celui de la conversation
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

  const handleUserNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  const handleBetaFeaturesChange = (enabled: boolean) => {
    setBetaFeaturesEnabled(enabled);
    localStorage.setItem('betaFeaturesEnabled', enabled.toString());
  };

  const handleIconColorChange = (color: string) => {
    setIconColor(color);
    localStorage.setItem('iconColor', color);
  };

  const handleDefaultModelChange = (model: string) => {
    setDefaultModel(model);
    localStorage.setItem('defaultModel', model);
  };

  const handleCustomInstructionsChange = (instructions: string) => {
    setCustomInstructions(instructions);
    localStorage.setItem('customInstructions', instructions);
  };

  const handlePersonalityChange = (personality: string) => {
    setSelectedPersonality(personality);
    localStorage.setItem('selectedPersonality', personality);
  };

  const handleConversationModelChange = (model: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId
        ? { ...conv, model, updatedAt: new Date() }
        : conv
    ));
  };

  const generateImage = async (prompt: string): Promise<string> => {
    // Remplacer les espaces par des %20 pour l'URL
    const encodedPrompt = encodeURIComponent(prompt);
    // Retourner l'URL de l'image générée
    return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
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
      // Vérifier si le message est une demande de génération d'image
      const isImageRequest = content.toLowerCase().includes('image') || 
                            content.toLowerCase().includes('dessin') || 
                            content.toLowerCase().includes('dessine') ||
                            content.toLowerCase().includes('photo') ||
                            content.toLowerCase().includes('illustration');

      if (isImageRequest) {
        // Générer l'image
        const imageUrl = await generateImage(content);
        
        // Créer un message avec l'image
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
        // Message normal - appel à l'API OpenRouter
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
        
        // Ajouter le message système personnalisé en premier
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
        />

        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {currentConversation.title}
                </h1>
                <ModelDropdown
                  selectedModel={currentConversation.model}
                  onModelChange={handleConversationModelChange}
                />
              </div>
              <SettingsDialog
                selectedModel={defaultModel}
                onModelChange={handleDefaultModelChange}
                userName={userName}
                onUserNameChange={handleUserNameChange}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
                betaFeaturesEnabled={betaFeaturesEnabled}
                onBetaFeaturesChange={handleBetaFeaturesChange}
                iconColor={iconColor}
                onIconColorChange={handleIconColorChange}
                customInstructions={customInstructions}
                onCustomInstructionsChange={handleCustomInstructionsChange}
                selectedPersonality={selectedPersonality}
                onPersonalityChange={handlePersonalityChange}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {shouldShowGreeting ? (
                <GreetingMessage 
                  content={generateGreetingMessages(userName, selectedLanguage)[0].content} 
                  iconColor={iconColor}
                />
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
                      iconColor={iconColor}
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
                      iconColor={iconColor}
                    />
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <ChatInput
            onSendMessage={(content) => handleSendMessage(content, false)}
            isLoading={isLoading}
            language={selectedLanguage}
            iconColor={iconColor}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;