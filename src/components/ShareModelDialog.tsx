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
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Copy, Share2, Check, Download } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { CustomModel } from "./CustomModelDialog";

interface ShareModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: CustomModel | null;
  iconColor: string;
}

const ShareModelDialog: React.FC<ShareModelDialogProps> = ({
  open,
  onOpenChange,
  model,
  iconColor
}) => {
  const [copied, setCopied] = useState(false);

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

  const generateShareLink = () => {
    if (!model) return '';
    
    const modelData = {
      name: model.name,
      description: model.description,
      instructions: model.instructions,
      knowledge: model.knowledge,
      baseModel: model.baseModel,
      icon: model.icon,
      createdAt: model.createdAt.toISOString()
    };
    
    const encoded = btoa(JSON.stringify(modelData));
    return `${window.location.origin}/import-model?data=${encoded}`;
  };

  const shareLink = generateShareLink();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showSuccess("Lien copié dans le presse-papier");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!model) return;
    
    const modelData = {
      name: model.name,
      description: model.description,
      instructions: model.instructions,
      knowledge: model.knowledge,
      baseModel: model.baseModel,
      icon: model.icon,
      customIcon: model.customIcon,
      createdAt: model.createdAt.toISOString()
    };
    
    const dataStr = JSON.stringify(modelData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${model.name.replace(/\s+/g, '-').toLowerCase()}.mai.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess("Modèle exporté avec succès");
  };

  if (!model) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager "{model.name}"</DialogTitle>
          <DialogDescription>
            Partagez ce modèle avec d'autres utilisateurs ou exportez-le
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Lien de partage */}
          <div className="space-y-2">
            <Label>Lien de partage</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Partagez ce lien pour permettre à d'autres d'importer ce modèle
            </p>
          </div>

          {/* Export */}
          <div className="space-y-2">
            <Label>Export</Label>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Exportation du modèle</p>
                  <p className="text-sm text-gray-500">
                    Téléchargez une copie de ce modèle au format JSON
                  </p>
                </div>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </Card>
          </div>

          {/* Informations */}
          <div className="space-y-2">
            <Label>Informations du modèle</Label>
            <Card className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Nom:</span>
                <span className="text-sm font-medium">{model.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Modèle de base:</span>
                <span className="text-sm font-medium">{model.baseModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Créé le:</span>
                <span className="text-sm font-medium">
                  {model.createdAt.toLocaleDateString()}
                </span>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModelDialog;