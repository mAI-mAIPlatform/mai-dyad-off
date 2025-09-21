"use client";

import React from 'react';
import { Download, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { GeneratedImage } from "@/services/image-generation";

interface ImageMessageProps {
  image: GeneratedImage;
  onRegenerate?: (prompt: string) => void;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ image, onRegenerate }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess("Image téléchargée avec succès");
    } catch (error) {
      showError("Erreur lors du téléchargement");
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    showSuccess("Prompt copié");
  };

  return (
    <div className="py-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="mAI Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-2">
              <span className="font-medium text-sm">mAI (Génération d'image)</span>
              <span className="text-xs text-gray-500 ml-2">
                {image.timestamp.toLocaleTimeString()}
              </span>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-900">
              {/* Image */}
              <div className="mb-4">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-auto rounded-lg shadow-md max-w-md mx-auto"
                  loading="lazy"
                />
              </div>

              {/* Prompt utilisé */}
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Prompt:</strong> {image.prompt}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Modèle: {image.model}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Télécharger
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copier prompt
                </Button>

                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRegenerate(image.prompt)}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Régénérer
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMessage;