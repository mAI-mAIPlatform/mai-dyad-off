"use client";

import { showError } from "@/utils/toast";

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenRouterService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  static getApiKey(): string {
    // Pour le développement, vous pouvez définir la clé API directement ici
    // ou utiliser une variable d'environnement côté client via Vite
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.warn("Clé API OpenRouter non trouvée. Utilisez VITE_OPENROUTER_API_KEY dans votre fichier .env");
      return '';
    }
    
    return apiKey;
  }

  static async sendMessage(messages: OpenRouterMessage[], model: string) {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error("Clé API OpenRouter non configurée. Veuillez ajouter VITE_OPENROUTER_API_KEY à votre fichier .env");
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'mAIs Chat Application'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 4000,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error("Clé API invalide. Veuillez vérifier votre configuration.");
        }
        
        if (response.status === 429) {
          throw new Error("Limite de requêtes dépassée. Veuillez réessayer plus tard.");
        }
        
        if (errorData.error?.message) {
          throw new Error(errorData.error.message);
        }
        
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Réponse invalide de l'API OpenRouter");
      }

      return data;
    } catch (error: any) {
      console.error('OpenRouter API Error:', error);
      
      if (error.message.includes('User not found')) {
        throw new Error("Problème d'authentification. Veuillez vérifier votre clé API.");
      }
      
      if (error.message.includes('technical difficulties')) {
        throw new Error("Problèmes techniques avec le service. Veuillez réessayer.");
      }
      
      throw error;
    }
  }

  static formatMessagesForAPI(messages: OpenRouterMessage[], language: string = 'fr'): OpenRouterMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
}