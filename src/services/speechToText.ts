export interface SpeechToTextResponse {
  text: string;
  error?: string;
}

export class SpeechToTextService {
  private static readonly API_URL = 'https://api.openai.com/v1/audio/transcriptions';
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

  static async transcribeAudio(audioBlob: Blob): Promise<SpeechToTextResponse> {
    // Si aucune clé API n'est définie, utiliser une simulation
    if (!this.API_KEY) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            text: "Ceci est une transcription de démonstration. Veuillez configurer une clé API OpenAI pour la transcription vocale réelle."
          });
        }, 1000);
      });
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'fr');

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { text: data.text };
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      return { 
        text: "", 
        error: error.message || "Erreur lors de la transcription audio" 
      };
    }
  }
}