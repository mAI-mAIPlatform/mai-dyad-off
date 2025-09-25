"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Share2, 
  Star,
  Folder,
  Search,
  X,
  Settings,
  Download,
  Upload,
  Copy,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import CustomModelDialog, { CustomModel } from "./CustomModelDialog";
import ShareModelDialog from "./ShareModelDialog";
import { useTranslation } from "@/utils/i18n";
import * as LucideIcons from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

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
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState('');
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

  const filteredModels = customModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.baseModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (model: CustomModel) => {
    if (model.customIcon) {
      return (
        <img 
          src={model.customIcon} 
          alt={model.name}
          className="w-8 h-8 object-contain rounded-lg border"
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.')) {
      onDeleteModel(modelId);
    }
  };

  const handleCreateSuccess = (model: CustomModel) => {
    onCreateModel(model);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSuccess = (model: CustomModel) => {
    onUpdateModel(model);
    setEditingModel(null);
  };

  const handleExport = (model: CustomModel) => {
    const modelData = {
      ...model,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt?.toISOString()
    };
    
    const dataStr = JSON.stringify(modelData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${model.name.replace(/\s+/g, '-').toLowerCase()}.mai.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess(`Modèle "${model.name}" exporté avec succès`);
  };

  const handleImport = () => {
    try {
      const modelData = JSON.parse(importData);
      
      // Valider les données d'importation
      if (!modelData.name || !modelData.baseModel) {
        throw new Error('Données de modèle invalides');
      }
      
      const newModel: CustomModel = {
        ...modelData,
        id: `custom-${Date.now()}`,
        createdAt: new Date(modelData.createdAt || new Date()),
        updatedAt: modelData.updatedAt ? new Date(modelData.updatedAt) : new Date()
      };
      
      onCreateModel(newModel);
      setImportDialogOpen(false);
      setImportData('');
      showSuccess(`Modèle "${newModel.name}" importé avec succès`);
      
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      showError('Erreur lors de l\'importation. Vérifiez le format du fichier JSON.');
    }
  };

  const handleQuickUse = (model: CustomModel) => {
    setSelectedModel(model.id);
    showSuccess(`Modèle "${model.name}" sélectionné pour utilisation rapide`);
    // Ici vous pourriez ajouter une logique pour utiliser immédiatement le modèle
  };

  const getBaseModelName = (modelId: string) => {
    const baseModels: Record<string, string> = {
      'openai/gpt-4o': 'm-4.0',
      'openai/gpt-4-turbo': 'm-4.3-mini',
      'anthropic/claude-3-5-sonnet': 'm-4.5 Pro',
      'anthropic/claude-3-opus': 'm-4.7o',
      'google/gemini-2.0-flash-thinking-exp': 'm-4.9+'
    };
    return baseModels[modelId] || modelId;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header amélioré */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className={`w-6 h-6 ${getIconColorClass()}`} />
              mAIs Manager
            </h2>
            <p className="text-gray-500">Gérez vos modèles personnalisés d'IA</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              size="sm"
              disabled={!betaFeaturesEnabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={!betaFeaturesEnabled}
              className={!betaFeaturesEnabled ? "bg-gray-400 cursor-not-allowed" : ""}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau mAI
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{customModels.length}</div>
            <div className="text-sm text-gray-500">Modèles créés</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {customModels.filter(m => m.baseModel.includes('openai')).length}
            </div>
            <div className="text-sm text-gray-500">Basés sur OpenAI</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {customModels.filter(m => !m.baseModel.includes('openai')).length}
            </div>
            <div className="text-sm text-gray-500">Autres modèles</div>
          </Card>
        </div>

        {/* Search amélioré */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un modèle par nom, description ou modèle de base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
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

        {/* Models Grid amélioré */}
        {filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="p-4 hover:shadow-lg transition-shadow group relative">
                {selectedModel === model.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10">
                      {renderIcon(model)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                        {model.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getBaseModelName(model.baseModel)}
                      </p>
                    </div>
                  </div>
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">
                  {model.description || 'Aucune description'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Créé le {model.createdAt.toLocaleDateString()}</span>
                  {model.updatedAt && model.updatedAt.getTime() !== model.createdAt.getTime() && (
                    <span title="Dernière modification">
                      Modifié le {model.updatedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions améliorées */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUse(model)}
                    className="text-xs"
                  >
                    Utiliser
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(model)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Exporter
                  </Button>
                </div>

                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(model)}
                    className="flex-1 text-xs"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(model)}
                    className="flex-1 text-xs"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Partager
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(model.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    title="Supprimer"
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
                Créer votre premier mAI
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

      {/* Dialog d'importation */}
      {importDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Importer un modèle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Collez le JSON du modèle
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"name": "Mon modèle", "baseModel": "openai/gpt-4o", ...}'
                  className="w-full h-32 p-3 border rounded-md resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Collez le contenu JSON d'un modèle exporté
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => {
                setImportDialogOpen(false);
                setImportData('');
              }}>
                Annuler
              </Button>
              <Button 
                onClick={handleImport}
                disabled={!importData.trim()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default MAIsManager;