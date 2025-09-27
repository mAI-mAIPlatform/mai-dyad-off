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
        // Propagate API‑returned error (e.g., “User not found”)
        throw new Error(data.error?.message || `Erreur HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❗️ Erreur lors de l’appel OpenRouter :', error);
      // Re‑throw so calling components can display a toast
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