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
  // La clé d’API provient des variables d’environnement Vite
  private static readonly API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

  /** 
   * Envoie un tableau de messages à l’API OpenRouter.
   * Lance une erreur claire si la clé d’API est manquante.
   */
  static async sendMessage(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-4o'
  ): Promise<OpenRouterResponse> {
    // 👉 Vérification de la clé d’API avant l’appel réseau
    if (!this.API_KEY) {
      // L’erreur sera capturée par le composant appelant et affichée à l’utilisateur
      throw new Error('Clé API OpenRouter manquante. Veuillez la définir dans le fichier .env (VITE_OPENROUTER_API_KEY).');
    }

    try {
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
        // Propagation de l’erreur retournée par l’API (ex. “User not found”)
        throw new Error(data.error?.message || `Erreur HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      // Re‑propagation pour que le composant puisse afficher le toast
      throw error;
    }
  }

  static formatMessagesForAPI(messages: OpenRouterMessage[], language: string = 'fr'): OpenRouterMessage[] {
    // Messages système selon la langue choisie
    const systemMessages: Record<string, string> = {
      fr: 'Tu es mAI, un assistant IA utile, amical et professionnel. Réponds en français de manière claire et concise.',
      en: 'You are mAI, a helpful, friendly and professional AI assistant. Respond in English in a clear and concise manner.',
      es: 'Eres mAI, un asistente de IA útil, amigable y profesional. Responde en español de manera clara y concisa.',
      de: 'Du bist mAI, ein hilfsbereiter, freundlicher und professioneller KI-Assistent. Antworte auf Deutsch klar und prägnant.',
      pt: 'És mAI, um assistente de IA útil, amigável e profissional. Responde em português de forma clara e concisa.'
    };

    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: systemMessages[language] || systemMessages.fr
    };

    return [systemMessage, ...messages];
  }
}