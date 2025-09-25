export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    code: number;
  };
}

export class OpenRouterService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

  static async sendMessage(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o'
  ): Promise<OpenRouterResponse> {
    try {
      // Vérifier que la clé API est présente
      if (!this.API_KEY) {
        throw new Error('Clé API OpenRouter non configurée. Veuillez ajouter VITE_OPENROUTER_API_KEY dans votre fichier .env');
      }

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'mAI Chat Application'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs spécifiques d'OpenRouter
        if (data.error?.message?.includes('User not found')) {
          throw new Error('Erreur d\'authentification : Clé API invalide ou expirée. Veuillez vérifier votre configuration.');
        }
        
        throw new Error(data.error?.message || `Erreur HTTP! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API OpenRouter:', error);
      
      // Fournir un message d'erreur plus clair
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Impossible de se connecter au service OpenRouter. Vérifiez votre connexion internet.');
        }
        throw error;
      }
      
      throw new Error('Une erreur inattendue s\'est produite lors de la communication avec l\'IA');
    }
  }

  static formatMessagesForAPI(messages: OpenRouterMessage[], language: string = 'fr'): OpenRouterMessage[] {
    // Messages système selon la langue choisie
    const systemMessages: Record<string, string> = {
      fr: 'Tu es mAI, un assistant IA utile, amical et professionnel. Réponds en français de manière claire et concise.',
      en: 'You are mAI, a helpful, friendly and professional AI assistant. Respond in English in a clear and concise manner.',
      es: 'Eres mAI, un asistente de IA útil, amigable y profesional. Responde en español de manera clara y concisa.',
      de: 'Du bist mAI, ein hilfsbereiter, freundlicher und professioneller KI-Assistent. Antworte auf Deutsch klar und prägnant.',
      pt: 'És mAI, um assistente de IA útil, amigável et profissional. Responde em português de forma clara e concisa.'
    };

    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: systemMessages[language] || systemMessages.fr
    };

    return [systemMessage, ...messages];
  }
}