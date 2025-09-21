"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, ImagePlus, Loader2 } from "lucide-react";
import { ImageGenerationService } from "@/services/imageGeneration";
import { showError, showSuccess } from "@/utils/toast";
import { useTranslation } from "@/utils/i18n";

interface ImageGenerationModalProps {
  onImageGenerated: (imageUrl: string) => void;
  language: string;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ onImageGenerated, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const t = useTranslation(language);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showError("Veuillez entrer une description pour générer l'image");
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const result = await ImageGenerationService.generateImage(prompt);
      
      if (result.success && result.images && result.images.length > 0) {
        setGeneratedImage(result.images[0]);
        showSuccess("Image générée avec succès !");
      } else {
        throw new Error(result.error || "Échec de la génération de l'image");
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      showError(error.message || "Erreur lors de la génération de l'image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseImage = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      setIsOpen(false);
      setPrompt('');
      setGeneratedImage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-600">
          <ImagePlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Générer une image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="image-prompt" className="text-sm font-medium">
              Description de l'image
            </label>
            <Input
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Décrivez l'image que vous souhaitez générer..."
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Image className="w-4 h-4 mr-2" />
                Générer l'image
              </>
            )}
          </Button>
          
          {generatedImage && (
            <div className="space-y-3">
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={generatedImage} 
                  alt="Image générée" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
              <Button onClick={handleUseImage} className="w-full">
                Utiliser cette image
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGenerationModal;