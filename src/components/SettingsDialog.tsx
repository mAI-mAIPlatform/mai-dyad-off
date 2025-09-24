"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Bot, Upload, X, Star } from "lucide-react";
import { useTranslation } from "@/utils/i18n";
import { showSuccess, showError } from "@/utils/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import IconPicker from "@/components/IconPicker";
import * as LucideIcons from "lucide-react";

interface SettingsDialogProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userName: string;
  onUserNameChange: (name: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  betaFeaturesEnabled: boolean;
  onBetaFeaturesChange: (enabled: boolean) => void;
  iconColor: string;
  onIconColorChange: (color: string) => void;
  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;
  selectedPersonality: string;
  onPersonalityChange: (personality: string) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  selectedModel,
  onModelChange,
  userName,
  onUserNameChange,
  selectedLanguage,
  onLanguageChange,
  betaFeaturesEnabled,
  onBetaFeaturesChange,
  iconColor,
  onIconColorChange,
  customInstructions,
  onCustomInstructionsChange,
  selectedPersonality,
  onPersonalityChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localUserName, setLocalUserName] = useState(userName);
  const [localCustomInstructions, setLocalCustomInstructions] = useState(customInstructions);
  const t = useTranslation(selectedLanguage);

  // États pour les icônes des avatars
  const [userAvatarIcon, setUserAvatarIcon] = useState(() => {
    return localStorage.getItem('userAvatarIcon') || 'user';
  });
  
  const [aiAvatarIcon, setAiAvatarIcon] = useState(() => {
    return localStorage.getItem('aiAvatarIcon') || 'star';
  });

  const models = [
    { id: 'openai/gpt-4o', name: 'm-4.0', description: t.models['m-4.0'] },
    { id: 'openai/gpt-4-turbo', name: 'm-4.3-mini', description: t.models['m-4.3-mini'] },
    { id: 'anthropic/claude-3-5-sonnet', name: 'm-4.5 Pro', description: t.models['m-4.5 Pro'] },
    { id: 'anthropic/claude-3-opus', name: 'm-4.7o', description: t.models['m-4.7o'] },
    { id: 'google/gemini-2.0-flash-thinking-exp', name: 'm-4.9+', description: t.models['m-4.9+'] },
  ];

  const languages = [
    { id: 'fr', name: 'Français' },
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'de', name: 'Deutsch' },
    { id: 'it', name: 'Italiano' },
  ];

  const iconColors = [
    { id: 'black', name: 'Noir' },
    { id: 'blue', name: 'Bleu' },
    { id: 'red', name: 'Rouge' },
    { id: 'yellow', name: 'Jaune' },
    { id: 'green', name: 'Vert' },
    { id: 'purple', name: 'Violet' },
    { id: 'pink', name: 'Rose' },
    { id: 'indigo', name: 'Indigo' },
    { id: 'orange', name: 'Orange' },
  ];

  const personalities = [
    { id: 'default', name: 'Standard' },
    { id: 'professional', name: 'Professionnel' },
    { id: 'empathetic', name: 'Empathique' },
    { id: 'genz', name: 'Génération Z' },
    { id: 'depressive', name: 'Dépressif' },
    { id: 'enthusiastic', name: 'Enthousiaste' },
    { id: 'sarcastic', name: 'Sarcastique' },
    { id: 'technical', name: 'Technique' },
  ];

  const handleSave = () => {
    onUserNameChange(localUserName);
    onCustomInstructionsChange(localCustomInstructions);
    
    // Sauvegarder les icônes des avatars
    localStorage.setItem('userAvatarIcon', userAvatarIcon);
    localStorage.setItem('aiAvatarIcon', aiAvatarIcon);
    
    setIsOpen(false);
    showSuccess("Paramètres enregistrés");
  };

  const handleAvatarChange = (type: 'user' | 'ai', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'user') {
        localStorage.setItem('userAvatar', result);
      } else {
        localStorage.setItem('aiAvatar', result);
      }
      showSuccess('Avatar mis à jour');
    };
    reader.onerror = () => {
      showError('Erreur lors du chargement de l\'image');
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = (type: 'user' | 'ai') => {
    if (type === 'user') {
      localStorage.removeItem('userAvatar');
    } else {
      localStorage.removeItem('aiAvatar');
    }
    showSuccess('Avatar supprimé');
  };

  const getUserAvatar = () => {
    return localStorage.getItem('userAvatar');
  };

  const getAIAvatar = () => {
    return localStorage.getItem('aiAvatar');
  };

  const renderIcon = (iconName: string, className: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || Star;
    return <IconComponent className={className} />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.settings.title}</DialogTitle>
          <DialogDescription>
            {t.settings.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section Avatars */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Avatars</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Utilisateur */}
              <div className="space-y-3">
                <Label>Votre avatar</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {getUserAvatar() ? (
                      <>
                        <AvatarImage src={getUserAvatar()} alt="User Avatar" />
                        <AvatarFallback className="bg-gray-500 text-white">
                          <User className="w-8 h-8" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-gray-500 text-white">
                        {renderIcon(userAvatarIcon, "w-8 h-8")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <label>
                          <Upload className="w-4 h-4 mr-2" />
                          Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleAvatarChange('user', file);
                              }
                            }}
                          />
                        </label>
                      </Button>
                      
                      {getUserAvatar() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAvatar('user')}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Icône:</span>
                      <IconPicker
                        selectedIcon={userAvatarIcon}
                        onIconChange={(icon) => {
                          setUserAvatarIcon(icon);
                          // Supprimer l'image si une icône est choisie
                          localStorage.removeItem('userAvatar');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar IA */}
              <div className="space-y-3">
                <Label>Avatar de l'IA</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {getAIAvatar() ? (
                      <>
                        <AvatarImage src={getAIAvatar()} alt="AI Avatar" />
                        <AvatarFallback className="bg-blue-500 text-white">
                          <Bot className="w-8 h-8" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white">
                        {renderIcon(aiAvatarIcon, "w-8 h-8")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <label>
                          <Upload className="w-4 h-4 mr-2" />
                          Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleAvatarChange('ai', file);
                              }
                            }}
                          />
                        </label>
                      </Button>
                      
                      {getAIAvatar() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeAvatar('ai')}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Icône:</span>
                      <IconPicker
                        selectedIcon={aiAvatarIcon}
                        onIconChange={(icon) => {
                          setAiAvatarIcon(icon);
                          // Supprimer l'image si une icône est choisie
                          localStorage.removeItem('aiAvatar');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Utilisateur */}
          <div className="space-y-3">
            <Label htmlFor="userName">{t.settings.userName}</Label>
            <Input
              id="userName"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              placeholder="Entrez votre nom"
            />
          </div>

          {/* Section Modèle par défaut */}
          <div className="space-y-3">
            <Label htmlFor="model">Modèle par défaut</Label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Sélectionnez un modèle" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Langue */}
          <div className="space-y-3">
            <Label htmlFor="language">{t.settings.language}</Label>
            <Select value={selectedLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Couleur des icônes */}
          <div className="space-y-3">
            <Label htmlFor="iconColor">Couleur des icônes</Label>
            <Select value={iconColor} onValueChange={onIconColorChange}>
              <SelectTrigger id="iconColor">
                <SelectValue placeholder="Sélectionnez une couleur" />
              </SelectTrigger>
              <SelectContent>
                {iconColors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    {color.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Fonctionnalités Bêta */}
          <div className="flex items-center justify-between">
            <Label htmlFor="betaFeatures" className="flex-1">
              Fonctionnalités Bêta
              <p className="text-sm text-gray-500 font-normal">
                Activer les fonctionnalités expérimentales
              </p>
            </Label>
            <Switch
              id="betaFeatures"
              checked={betaFeaturesEnabled}
              onCheckedChange={onBetaFeaturesChange}
            />
          </div>

          {/* Section Instructions personnalisées (uniquement si bêta activé) */}
          {betaFeaturesEnabled && (
            <div className="space-y-3">
              <Label htmlFor="customInstructions">Instructions personnalisées</Label>
              <textarea
                id="customInstructions"
                value={localCustomInstructions}
                onChange={(e) => setLocalCustomInstructions(e.target.value)}
                placeholder="Informations supplémentaires sur vous ou vos préférences..."
                className="w-full p-3 border rounded-md resize-none min-h-[100px]"
              />
            </div>
          )}

          {/* Section Personnalité (uniquement si bêta activé) */}
          {betaFeaturesEnabled && (
            <div className="space-y-3">
              <Label htmlFor="personality">Personnalité de l'IA</Label>
              <Select value={selectedPersonality} onValueChange={onPersonalityChange}>
                <SelectTrigger id="personality">
                  <SelectValue placeholder="Sélectionnez une personnalité" />
                </SelectTrigger>
                <SelectContent>
                  {personalities.map((personality) => (
                    <SelectItem key={personality.id} value={personality.id}>
                      {personality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;