"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import ModelDropdown from "@/components/ModelDropdown";
import { useTranslation } from "@/utils/i18n";
import { generateGreetingMessages } from "@/utils/greetings";

/* ---------- Types ---------- */
type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isGhost?: boolean;
};

type Project = {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
};

/* ---------- Helpers ---------- */
// Stub simple pour la génération d’image (peut être remplacé par une vraie implémentation)
const generateImage = async (prompt: string): Promise<string> => {
  return `https://via.placeholder.com/400x300?text=${encodeURIComponent(prompt)}`;
};

// Stub pour les instructions de personnalité
const getPersonalityInstructions = (personalityId: string): string => {
  return "";
};

/* ---------- Component ---------- */
const Index: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("default");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-4o");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("fr");
  const [betaFeaturesEnabled, setBetaFeaturesEnabled] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [selectedPersonality, setSelectedPersonality] = useState<string>("default");
  const [iconColor, setIconColor] = useState<string>("black");
  const [userName, setUserName] = useState<string>("Utilisateur");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showGreeting, setShowGreeting] = useState<boolean>(true);

  const t = useTranslation(selectedLanguage);

  /* ---------- Initialise la conversation par défaut ---------- */
  useEffect(() => {
    const defaultConv: Conversation = {
      id: "default",
      title: t.chat.newConversation,
      messages: [],
      model: selectedModel,
      projectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([defaultConv]);
    setCurrentConversationId("default");
  }, [t.chat.newConversation, selectedModel]);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId,
  );

  /* ---------- Gestion de la régénération ---------- */
  const handleRegenerateResponse = async (
    messageId: string,
    newContent: string,
    options?: { model?: string; length?: "shorter" | "longer" },
  ) => {
    if (!currentConversation) return;

    const userMessageIndex = currentConversation.messages.findIndex(
      (msg) => msg.id === messageId,
    );
    if (userMessageIndex === -1) return;

    const messagesToKeep = currentConversation.messages.slice(
      0,
      userMessageIndex + 1,
    );

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? { ...conv, messages: messagesToKeep, updatedAt: new Date() }
          : conv,
      ),
    );

    setIsLoading(true);

    try {
      const apiMessages: OpenRouterMessage[] = messagesToKeep
        .slice(0, -1)
        .slice(-10)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Système / instructions personnalisées
      let systemMessage = "";
      if (betaFeaturesEnabled) {
        if (customInstructions) {
          systemMessage += `Informations utilisateur : ${customInstructions}. `;
        }
        systemMessage += getPersonalityInstructions(selectedPersonality);
      }

      // Ajustement de la longueur si demandé
      let userPrompt = newContent.trim();
      if (options?.length === "shorter") {
        userPrompt = `Réponds de manière très concise et brève à cette demande : ${userPrompt}`;
      } else if (options?.length === "longer") {
        userPrompt = `Développe davantage cette réponse avec plus de détails et d'explications : ${userPrompt}`;
      }

      apiMessages.push({ role: "user", content: userPrompt });

      const formattedMessages = OpenRouterService.formatMessagesForAPI(
        apiMessages,
        selectedLanguage,
      );

      if (systemMessage) {
        formattedMessages.unshift({ role: "system", content: systemMessage });
      }

      const modelToUse = options?.model || currentConversation.model;
      const response = await OpenRouterService.sendMessage(
        formattedMessages,
        modelToUse,
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content,
        role: "assistant",
        timestamp: new Date(),
      };

      const finalConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, aiResponse],
              updatedAt: new Date(),
            }
          : conv,
      );

      setConversations(finalConversations);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessageContent = error?.message?.includes("User not found")
        ? "Clé API OpenRouter invalide ou compte non trouvé. Veuillez vérifier votre clé."
        : t.messages.technicalError;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        role: "assistant",
        timestamp: new Date(),
      };

      const errorConversations = conversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            }
          : conv,
      );

      setConversations(errorConversations);
      showError(errorMessageContent);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- Envoi d’un nouveau message ---------- */
  const handleSendMessage = async (content: string, isRegeneration = false) => {
    if (!content.trim() || isLoading) return;
    if (!currentConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    const shouldUpdateTitle =
      currentConversation.messages.length === 0 && !isRegeneration;

    const updatedConversations = conversations.map((conv) =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: shouldUpdateTitle
              ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
              : conv.title,
            updatedAt: new Date(),
          }
        : conv,
    );

    setConversations(updatedConversations);
    setIsLoading(true);

    try {
      const isImageRequest =
        /image|dessin|dessine|photo|illustration/i.test(content);

      if (isImageRequest) {
        const imageUrl = await generateImage(content);
        const imageMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Voici l'image générée selon votre demande :\n\n![Image générée](${imageUrl})`,
          role: "assistant",
          timestamp: new Date(),
        };

        const finalConversations = updatedConversations.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, imageMessage],
                updatedAt: new Date(),
              }
            : conv,
        );

        setConversations(finalConversations);
      } else {
        const apiMessages: OpenRouterMessage[] = currentConversation.messages
          .slice(-10)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

        let systemMessage = "";
        if (betaFeaturesEnabled) {
          if (customInstructions) {
            systemMessage += `Informations utilisateur : ${customInstructions}. `;
          }
          systemMessage += getPersonalityInstructions(selectedPersonality);
        }

        apiMessages.push({ role: "user", content: content.trim() });

        const formattedMessages = OpenRouterService.formatMessagesForAPI(
          apiMessages,
          selectedLanguage,
        );

        if (systemMessage) {
          formattedMessages.unshift({ role: "system", content: systemMessage });
        }

        const response = await OpenRouterService.sendMessage(
          formattedMessages,
          currentConversation.model,
        );

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.choices[0].message.content,
          role: "assistant",
          timestamp: new Date(),
        };

        const finalConversations = updatedConversations.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, aiResponse],
                updatedAt: new Date(),
              }
            : conv,
        );

        setConversations(finalConversations);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessageContent = error?.message?.includes("User not found")
        ? "Clé API OpenRouter invalide ou compte non trouvé. Veuillez vérifier votre clé."
        : t.messages.technicalError;

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        role: "assistant",
        timestamp: new Date(),
      };

      const errorConversations = updatedConversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            }
          : conv,
      );

      setConversations(errorConversations);
      showError(errorMessageContent);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI Handlers ---------- */
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: t.chat.newConversation,
      messages: [],
      model: selectedModel,
      projectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [...prev, newConv]);
    setCurrentConversationId(newId);
    setShowGreeting(true);
  };

  const handleNewGhostChat = () => {
    const newId = `ghost-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: t.ghost.newChat,
      messages: [],
      model: selectedModel,
      projectId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isGhost: true,
    };
    setConversations((prev) => [...prev, newConv]);
    setCurrentConversationId(newId);
    setShowGreeting(true);
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    setShowGreeting(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === currentConversationId) {
      setCurrentConversationId("default");
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  };

  const handleCreateProject = (name: string, icon: string) => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      icon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects((prev) => [...prev, newProj]);
  };

  const handleUpdateProject = (id: string, name: string, icon: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name, icon, updatedAt: new Date() } : p,
      ),
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConversations((prev) =>
      prev.map((c) => (c.projectId === id ? { ...c, projectId: null } : c)),
    );
  };

  const handleSelectProject = (id: string | null) => {
    // No additional state needed; filtering is handled in ChatSidebar
  };

  const handleMoveConversationToProject = (
    conversationId: string,
    projectId: string | null,
  ) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, projectId, updatedAt: new Date() } : c,
      ),
    );
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        {/* Sidebar */}
        <ChatSidebar
          projects={projects}
          conversations={conversations}
          currentProjectId={null}
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
        />

        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <ModelDropdown
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
            <SettingsDialog
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              userName={userName}
              onUserNameChange={setUserName}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              betaFeaturesEnabled={betaFeaturesEnabled}
              onBetaFeaturesChange={setBetaFeaturesEnabled}
              iconColor={iconColor}
              onIconColorChange={setIconColor}
              customInstructions={customInstructions}
              onCustomInstructionsChange={setCustomInstructions}
              selectedPersonality={selectedPersonality}
              onPersonalityChange={setSelectedPersonality}
            />
          </header>

          {/* Chat content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showGreeting && currentConversation && currentConversation.messages.length === 0 ? (
              <GreetingMessage
                content={generateGreetingMessages(userName, selectedLanguage)[0].content}
                iconColor={iconColor}
              />
            ) : (
              currentConversation?.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  role={msg.role}
                  timestamp={msg.timestamp}
                  onEditMessage={handleRegenerateResponse}
                  onCopyMessage={(c) => {
                    navigator.clipboard.writeText(c);
                    showSuccess(t.messages.copied);
                  }}
                  onRegenerateResponse={handleRegenerateResponse}
                  language={selectedLanguage}
                  iconColor={iconColor}
                />
              ))
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={t.chat.placeholder}
            language={selectedLanguage}
            iconColor={iconColor}
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default Index;