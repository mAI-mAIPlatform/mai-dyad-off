"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Star,
  Folder,
  Search,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import CustomModelDialog, { CustomModel } from "./CustomModelDialog";
import ShareModelDialog from "./ShareModelDialog";
import { useTranslation } from "@/utils/i18n";
import * as LucideIcons from "lucide-react";

interface MAIsManagerProps {
  customModels: CustomModel[];
  onCreateModel: (model: CustomModel) => void;
  onUpdateModel: (model: CustomModel) => void;
  onDeleteModel: (id: string) => void;
  iconColor: string;
  language: string;
  betaFeaturesEnabled: boolean;
}

const MAIsManager: React.FC<MAIsManagerProps> = ({
  customModels,
  onCreateModel,
  onUpdateModel,
  onDeleteModel,
  iconColor,
  language,
  betaFeaturesEnabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null);
  const [sharingModel, setSharingModel] = useState<CustomModel | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const t = useTranslation(language);

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

  const getBaseModelName = (baseModelId: string): string => {
    const modelNames: Record<string, string> = {
      'openai/gpt-4o': 'm-4.0',
      'openai/gpt-4-turbo': 'm-4.3-mini',
      'anthropic/claude-3-5-sonnet': 'm-4.5 Pro',
      'anthropic/claude-3-opus': 'm-4.7o',
      'google/gemini-2.0-flash-thinking-exp': 'm-4.9+'
    };
    return modelNames[baseModelId] || baseModelId;
  };

  const filteredModels = customModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (model: CustomModel) => {
    if (model.customIcon) {
      return (
        <img 
          src={model.customIcon} 
          alt={model.name}
          className="w-8 h-8 object-contain rounded-lg"
        />
      );
    }
    
    const formattedIconName = model.icon.charAt(0).toUpperCase() + model.icon.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || Star;
    return <IconComponent className={`w-6 h-6 ${getIconColorClass()}`} />;
  };

  const handleEdit = (model: CustomModel) => {
    setEditingModel(model);
  };

  const handleShare = (model: CustomModel) => {
    setSharingModel(model);
  };

  const handleDelete = (modelId: string) => {
    onDeleteModel(modelId);
  };

  const handleCreateSuccess = (model: CustomModel) => {
    onCreateModel(model);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSuccess = (model: CustomModel) => {
    onUpdateModel(model);
    setEditingModel(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">mAIs</h2>
            <p className="text-gray-500">Gérez vos modèles personnalisés</p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!betaFeaturesEnabled}
            className={!betaFeaturesEnabled ? "bg-gray-400 cursor-not-allowed" : ""}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau mAI
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Models Grid */}
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10">
                      {renderIcon(model)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-gray-500">{getBaseModelName(model.baseModel)}</p>
                    </div>
                  </div>
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {model.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Créé le {model.createdAt.toLocaleDateString()}</span>
                  {model.updatedAt && (
                    <span>Modifié le {model.updatedAt.toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(model)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(model)}
                    className="flex-1"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Partager
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(model.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucun modèle personnalisé'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Aucun modèle ne correspond à votre recherche'
                : 'Commencez par créer votre premier modèle personnalisé'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un modèle
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CustomModelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateModel={handleCreateSuccess}
        iconColor={iconColor}
        language={language}
      />

      <CustomModelDialog
        open={!!editingModel}
        onOpenChange={(open) => !open && setEditingModel(null)}
        onCreateModel={handleCreateSuccess}
        onUpdateModel={handleUpdateSuccess}
        onDeleteModel={onDeleteModel}
        editingModel={editingModel}
        iconColor={iconColor}
        language={language}
      />

      <ShareModelDialog
        open={!!sharingModel}
        onOpenChange={(open) => !open && setSharingModel(null)}
        model={sharingModel}
        iconColor={iconColor}
      />
    </>
  );
};

export default MAIsManager;