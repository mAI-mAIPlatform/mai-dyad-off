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