export interface ImageGenerationRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  n?: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
}

export class ImageGenerationService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/images/generations';
  private static readonly API_KEY = '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';

  static async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
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
          model: request.model || 'openai/dall-e-3',
          prompt: request.prompt,
          size: request.size || '1024x1024',
          quality: request.quality || 'standard',
          n: request.n || 1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Vérifier si la réponse contient bien les données d'image
      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error('Réponse invalide de l\'API de génération d\'images');
      }
      
      return {
        url: data.data[0].url,
        prompt: request.prompt,
        model: request.model || 'openai/dall-e-3',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Erreur lors de la génération de l'image: ${(error as Error).message}`);
    }
  }

  static isImagePrompt(prompt: string): boolean {
    const imageKeywords = [
      'dessine', 'image', 'photo', 'illustration', 'visuel', 
      'représente', 'crée une image', 'génère une image',
      'affiche', 'montre', 'picture', 'draw', 'paint', 'sketch',
      'portrait', 'paysage', 'graphique', 'diagramme', 'schéma'
    ];
    
    return imageKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}