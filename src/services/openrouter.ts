"use client";

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Utiliser import.meta.env pour Vite au lieu de process.env
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

export class OpenRouterService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  static async sendMessage(messages: OpenRouterMessage[], model: string): Promise<OpenRouterResponse> {
    if (!API_KEY) {
      throw new Error('Clé API OpenRouter non configurée');
    }

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chat Application'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Gestion spécifique des erreurs OpenRouter
      if (response.status === 401) {
        throw new Error('Clé API invalide. Veuillez vérifier votre configuration.');
      } else if (response.status === 429) {
        throw new Error('Limite de requêtes dépassée. Veuillez réessayer plus tard.');
      } else if (response.status === 400) {
        throw new Error('Requête invalide. Veuillez vérifier vos paramètres.');
      } else {
        throw new Error(errorData.error?.message || `Erreur serveur (${response.status})`);
      }
    }

    const data = await response.json();
    return data;
  }

  static formatMessagesForAPI(messages: OpenRouterMessage[], language: string): OpenRouterMessage[] {
    // Ajouter un message système pour le contexte linguistique si nécessaire
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: `Vous êtes un assistant IA utile. Répondez dans la langue: ${language}. Soyez concis, précis et utile.`
    };

    return [systemMessage, ...messages];
  }

  // Méthode pour vérifier la validité de la clé API
  static async validateApiKey(): Promise<boolean> {
    if (!API_KEY) return false;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Méthode pour obtenir les modèles disponibles
  static async getAvailableModels(): Promise<any[]> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles:', error);
      return [];
    }
  }
}