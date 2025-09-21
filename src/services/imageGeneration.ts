export interface ImageGenerationResponse {
  success: boolean;
  images?: string[]; // URLs des images générées
  error?: string;
}

export class ImageGenerationService {
  private static readonly API_URL = 'https://api.kie.ai/v1/images/generations';
  private static readonly API_KEY = 'eb3b350f6ccd873bac593e2ddaf69242'; // Clé API fournie

  static async generateImage(prompt: string): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          n: 1, // Nombre d'images à générer
          size: '512x512' // Taille de l'image
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      // Extraire les URLs des images générées
      const imageUrls = data.data?.map((item: any) => item.url) || [];
      
      return {
        success: true,
        images: imageUrls
      };
    } catch (error: any) {
      console.error('Error generating image:', error);
      return {
        success: false,
        error: error.message || "Erreur lors de la génération de l'image"
      };
    }
  }
}