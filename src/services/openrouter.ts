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
}

export class OpenRouterService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly API_KEY = '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';

  static async sendMessage(
    messages: OpenRouterMessage[],
    model: string = 'openai/gpt-3.5-turbo'
  ): Promise<OpenRouterResponse> {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  static formatMessagesForAPI(messages: OpenRouterMessage[]): OpenRouterMessage[] {
    // Ajouter un message système pour définir le comportement de l'assistant
    const systemMessage: OpenRouterMessage = {
      role: 'system',
      content: 'Tu es mAI, un assistant IA utile, amical et professionnel. Réponds en français de manière claire et concise.'
    };

    return [systemMessage, ...messages];
  }
}