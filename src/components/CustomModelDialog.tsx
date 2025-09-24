"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Star, X, Upload, FileText } from "lucide-react";
import IconPicker from "./IconPicker";
import { useTranslation } from "@/utils/i18n";
import { useFileUpload } from "@/hooks/useFileUpload";
import { showError } from "@/utils/toast";

interface CustomModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateModel: (model: CustomModel) => void;
  iconColor: string;
  language: string;
}

interface CustomModel {
  id: string;
  name: string;
  icon: string;
  knowledge: string;
  instructions: string;
  createdAt: Date;
}

const CustomModelDialog: React.FC<CustomModelDialogProps> = ({
  open,
  onOpenChange,
  onCreateModel,
  iconColor,
  language
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('star');
  const [instructions, setInstructions] = useState('');
  const t = useTranslation(language);
  
  const {
    selectedFile,
    isUploading,
    handleFileSelect,
    handleFileUpload,
    resetFile
  } = useFileUpload();

  const getIconColorClass = () => {
    const colorMap: Record<string, string> = {
      'black': 'text-black dark:text-white',
      'blue': 'text-blue-600',
      'red': 'text-red-600',
      'yellow': 'text-yellow-600',
      'gray': 'text-gray-500',
      'green': 'text-green-600',
      'purple': 'text-purple-600',
      'pink': 'text-pink-600',
      'indigo': 'text-indigo-600',
      'orange': 'text-orange-600'
    };
    return colorMap[iconColor] || 'text-black dark:text-white';
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showError("Veuillez entrer un nom pour le modèle");
      return;
    }

    let knowledge = '';
    if (selectedFile) {
      try {
        knowledge = await handleFileUpload();
      } catch (error) {
        showError("Erreur lors de l'upload du fichier");
        return;
      }
    }

    const newModel: CustomModel = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      knowledge,
      instructions: instructions.trim(),
      createdAt: new Date()
    };

    onCreateModel(newModel);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName('');
    setIcon('star');
    setInstructions('');
    resetFile();
  };

  const handleRemoveFile = () => {
    resetFile();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un modèle personnalisé</DialogTitle>
          <DialogDescription>
            Définissez un modèle IA personnalisé avec vos propres instructions et connaissances
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nom du modèle */}
          <div className="space-y-2">
            <Label htmlFor="model-name">Nom du modèle</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Assistant technique, Rédacteur, etc."
            />
          </div>

          {/* Icône */}
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex items-center gap-2">
              <IconPicker
                selectedIcon={icon}
                onIconChange={setIcon}
              />
              <span className="text-sm text-gray-500">Choisissez une icône pour votre modèle</span>
            </div>
          </div>

          {/* Connaissances (fichier) */}
          <div className="space-y-2">
            <Label>Connaissances</Label>
            <Card className="p-3">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.csv,.xls,.xlsx"
                id="knowledge-file"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <label 
                  htmlFor="knowledge-file"
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                >
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Cliquez pour ajouter un fichier de connaissances
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    TXT, PDF, DOC, DOCX, CSV, XLS, XLSX (max 5MB)
                  </p>
                </label>
              )}
            </Card>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Décrivez comment l'IA doit répondre. Ex: Réponds de manière concise et professionnelle..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isUploading}
          >
            Créer le modèle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModelDialog;