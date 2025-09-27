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

  /** Retrieve the API key at each call (in case .env changes). */
  private static getApiKey(): string {
    // Vite injects the env variable at build time; if not set, return empty string.
    return import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  /**
   * Send an array of messages to the OpenRouter API.
   * Throws a clear error if the API key is missing.
   */
  static async sendMessage(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o'
  ): Promise<OpenRouterResponse> {
    const apiKey = this.getApiKey();

    // 👉 Diagnostic: log whether the key is present.
    console.log('🔑 OpenRouter API key loaded →', apiKey ? '✅ present' : '❌ missing');

    if (!apiKey) {
      throw new Error(
        'Clé API OpenRouter manquante. Ajoutez VITE_OPENROUTER_API_KEY dans le fichier .env à la racine du projet.'
      );
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'mAI Chat Application',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Log detailed error information
        console.error('❌ OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        // Propagate API‑returned error
        const errorMessage = data.error?.message || `Erreur HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error('❗️ Erreur lors de l’appel OpenRouter:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
      } else if (error.message.includes('User not found')) {
        throw new Error('Clé API OpenRouter invalide ou compte non trouvé. Veuillez vérifier votre clé.');
      } else if (error.message.includes('quota')) {
        throw new Error('Quota API dépassé. Veuillez vérifier votre compte OpenRouter.');
      }
      
      // Re‑throw the original error
      throw error;
    }
  }

  /**
   * Format messages for the API, adding a system prompt based on language.
   */
  static formatMessagesForAPI(messages: OpenRouterMessage[], language: string = 'fr'): OpenRouterMessage[] {
    const systemMessages: Record<string, string> = {
      fr: 'Tu es mAI, un assistant IA utile, amical et professionnel. Réponds en français de manière claire et concise.',
      en: 'You are mAI, a helpful, friendly and professional AI assistant. Respond in English in a clear and concise manner.',
      es: 'Eres mAI, un asistente de IA útil, amigable y profesional. Responde en español de manera clara y concisa.',
      de: 'Du bist mAI, ein hilfsbereiter, freundlicher und professioneller KI-Assistent. Antworte auf Deutsch klar und prägnant.',
      pt: 'És mAI, um assistente de IA útil, amigável e profissional. Responde em português de forma clara e concisa.',
    };

    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: systemMessages[language] || systemMessages.fr,
    };

    return [systemMessage, ...messages];
  }
}