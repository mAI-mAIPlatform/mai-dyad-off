"use client";

import { useState, useCallback } from 'react';
import { showError } from '@/utils/toast';

interface FileUploadHook {
  selectedFile: File | null;
  isUploading: boolean;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: () => Promise<string>;
  resetFile: () => void;
}

export const useFileUpload = (): FileUploadHook => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError("Le fichier ne doit pas dépasser 5MB");
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        showError("Type de fichier non supporté. Formats acceptés: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX");
        return;
      }

      setSelectedFile(file);
    }
  }, []);

  const handleFileUpload = useCallback(async (): Promise<string> => {
    if (!selectedFile) {
      throw new Error("Aucun fichier sélectionné");
    }

    setIsUploading(true);
    
    try {
      // Simuler l'upload et l'extraction du texte
      // Dans une application réelle, vous enverriez le fichier à une API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler l'extraction du texte (pour la démo)
      let extractedText = `[Fichier: ${selectedFile.name}]\n\n`;
      
      if (selectedFile.type === 'text/plain') {
        extractedText += "Contenu du fichier texte simulé...\nCeci est une simulation d'extraction de texte depuis un fichier.";
      } else if (selectedFile.type.includes('pdf')) {
        extractedText += "Contenu PDF simulé...\nExtraction du texte depuis un document PDF.";
      } else if (selectedFile.type.includes('word') || selectedFile.type.includes('document')) {
        extractedText += "Contenu Word simulé...\nExtraction du texte depuis un document Word.";
      } else if (selectedFile.type.includes('excel') || selectedFile.type.includes('sheet')) {
        extractedText += "Contenu Excel simulé...\nExtraction des données depuis une feuille de calcul.";
      } else {
        extractedText += "Contenu du fichier extrait avec succès.";
      }
      
      return extractedText;
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      throw new Error("Erreur lors de l'upload du fichier");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile]);

  const resetFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    handleFileSelect,
    handleFileUpload,
    resetFile
  };
};