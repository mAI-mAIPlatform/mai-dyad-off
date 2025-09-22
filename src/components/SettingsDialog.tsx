"use client";

import React, { useState } from 'react';
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { showSuccess } from "@/utils/toast";

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
  const [localUserName, setLocalUserName] = useState(userName);
  const { theme, setTheme } = useTheme();
  const [localSelectedModel, setLocalSelectedModel] = useState(selectedModel);
  const [localSelectedLanguage, setLocalSelectedLanguage] = useState(selectedLanguage);
  const [localBetaFeaturesEnabled, setLocalBetaFeaturesEnabled] = useState(betaFeaturesEnabled);
  const [localIconColor, setLocalIconColor] = useState(iconColor);
  const [localCustomInstructions, setLocalCustomInstructions] = useState(customInstructions);
  const [localSelectedPersonality, setLocalSelectedPersonality] = useState(selectedPersonality);

  const models = [
    { id: 'openai/gpt-4o', name: 'm-4.0', description: 'Pour les tâches quotidiennes, rapide' },
    { id: 'openai/gpt-4-turbo', name: 'm-4.3-mini', description: 'Ecologique, court' },
    { id: 'anthropic/claude-3-5-sonnet', name: 'm-4.5 Pro', description: 'Professionnel, précis' },
    { id: 'anthropic/claude-3-opus', name: 'm-4.7o', description: 'Précis, long' },
    { id: 'google/gemini-2.0-flash-thinking-exp', name: 'm-4.9+', description: 'Rapide, court' }
  ];

  const languages = [
    { id: 'fr', name: 'Français', flag: 'FR' },
    { id: 'en', name: 'Anglais', flag: 'EN' },
    { id: 'es', name: 'Espagnol', flag: 'ES' },
    { id: 'de', name: 'Allemand', flag: 'DE' },
    { id: 'pt', name: 'Portugais', flag: 'PT' }
  ];

  const iconColors = [
    { id: 'black', name: 'Noir', value: 'black' },
    { id: 'blue', name: 'Bleu', value: 'blue-600' },
    { id: 'red', name: 'Rouge', value: 'red-600' },
    { id: 'yellow', name: 'Jaune', value: 'yellow-600' },
    { id: 'gray', name: 'Gris', value: 'gray-500' },
    { id: 'green', name: 'Vert', value: 'green-600' },
    { id: 'purple', name: 'Violet', value: 'purple-600' },
    { id: 'pink', name: 'Rose', value: 'pink-600' },
    { id: 'indigo', name: 'Indigo', value: 'indigo-600' },
    { id: 'orange', name: 'Orange', value: 'orange-600' }
  ];

  const personalities = [
    { id: 'default', name: 'Défaut', description: 'Personnalité standard et neutre' },
    { id: 'professional', name: 'Professionnel', description: 'Formel, précis et orienté résultats' },
    { id: 'empathetic', name: 'Empathique', description: 'Bienveillant, compréhensif et encourageant' },
    { id: 'genz', name: 'Génération Z', description: 'Décontracté, moderne avec des expressions actuelles' },
    { id: 'depressive', name: 'Dépressif', description: 'Pessimiste et mélancolique' },
    { id: 'enthusiastic', name: 'Enthousiaste', description: 'Énergique et positif' },
    { id: 'sarcastic', name: 'Sarcastique', description: 'Ironique et humoristique' },
    { id: 'technical', name: 'Technique', description: 'Précis, détaillé et orienté données' }
  ];

  const handleSave = () => {
    onUserNameChange(localUserName);
    onModelChange(localSelectedModel);
    onLanguageChange(localSelectedLanguage);
    onBetaFeaturesChange(localBetaFeaturesEnabled);
    onIconColorChange(localIconColor);
    onCustomInstructionsChange(localCustomInstructions);
    onPersonalityChange(localSelectedPersonality);
    
    // Sauvegarder les paramètres dans localStorage
    localStorage.setItem('userName', localUserName);
    localStorage.setItem('defaultModel', localSelectedModel);
    localStorage.setItem('selectedLanguage', localSelectedLanguage);
    localStorage.setItem('betaFeaturesEnabled', localBetaFeaturesEnabled.toString());
    localStorage.setItem('iconColor', localIconColor);
    localStorage.setItem('theme', theme || 'system');
    localStorage.setItem('customInstructions', localCustomInstructions);
    localStorage.setItem('selectedPersonality', localSelectedPersonality);
    
    showSuccess("Paramètres sauvegardés avec succès");
  };

  const getVersionText = () => {
    return localBetaFeaturesEnabled 
      ? "26 1.0 (Bêta Update)" 
      : "26 0.8 (Public Update)";
  };

  const getColorClass = (colorId: string) => {
    const color = iconColors.find(c => c.id === colorId);
    return color ? `text-${color.value}` : 'text-black dark:text-white';
  };

  const getPersonalityDescription = (personalityId: string) => {
    const personality = personalities.find(p => p.id === personalityId);
    return personality ? personality.description : '';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>
            Configurez vos préférences d'application.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Nom utilisateur */}
          <div className="grid gap-2">
            <Label htmlFor="userName">Votre nom</Label>
            <Input
              id="userName"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              placeholder="Entrez votre nom"
            />
          </div>

          {/* Fonctions Bêta */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="beta-features">Fonctions Bêta</Label>
              <Switch
                id="beta-features"
                checked={localBetaFeaturesEnabled}
                onCheckedChange={setLocalBetaFeaturesEnabled}
              />
            </div>
            <p className="text-xs text-gray-500">
              Activez les fonctionnalités Bêta d'mAI, ces fonctionnalités peuvent contenir des bugs.
            </p>
          </div>

          {/* Personnalisation Bêta */}
          {localBetaFeaturesEnabled && (
            <>
              {/* Personnalité */}
              <div className="grid gap-2">
                <Label htmlFor="personality">Personnalité (Bêta)</Label>
                <Select 
                  value={localSelectedPersonality} 
                  onValueChange={setLocalSelectedPersonality}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une personnalité">
                      {personalities.find(p => p.id === localSelectedPersonality)?.name || 'Défaut'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {personalities.map((personality) => (
                      <SelectItem key={personality.id} value={personality.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{personality.name}</span>
                          <span className="text-xs text-gray-500">{personality.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Choisissez le ton et le style de réponse d'mAI
                </p>
              </div>

              {/* Instructions personnalisées */}
              <div className="grid gap-2">
                <Label htmlFor="custom-instructions">Instructions personnalisées (Bêta)</Label>
                <Textarea
                  id="custom-instructions"
                  value={localCustomInstructions}
                  onChange={(e) => setLocalCustomInstructions(e.target.value)}
                  placeholder="Ex: Je suis développeur web, parle-moi en termes techniques. Mes préférences sont..."
                  className="min-h-[80px] resize-none"
                />
                <p className="text-xs text-gray-500">
                  Fournissez des informations sur vous pour personnaliser les réponses d'mAI
                </p>
              </div>
            </>
          )}

          {/* Couleur des icônes */}
          <div className="grid gap-2">
            <Label htmlFor="icon-color">Couleur des icônes (Bêta)</Label>
            <Select 
              value={localIconColor} 
              onValueChange={setLocalIconColor}
              disabled={!localBetaFeaturesEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une couleur">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${getColorClass(localIconColor)} bg-current`} />
                    <span>{iconColors.find(c => c.id === localIconColor)?.name || 'Couleur'}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {iconColors.map((color) => (
                  <SelectItem key={color.id} value={color.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getColorClass(color.id)} bg-current`} />
                      <span>{color.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Couleur des icônes de projets, étoiles et autres éléments
            </p>
          </div>

          {/* Langue */}
          <div className="grid gap-2">
            <Label htmlFor="language">Langue (Bêta)</Label>
            <Select 
              value={localSelectedLanguage} 
              onValueChange={setLocalSelectedLanguage}
              disabled={!localBetaFeaturesEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <span>{language.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modèle IA par défaut */}
          <div className="grid gap-2">
            <Label htmlFor="model">Modèle IA par défaut</Label>
            <Select value={localSelectedModel} onValueChange={setLocalSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un modèle d'mAI" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Ce modèle sera utilisé pour les nouvelles conversations
            </p>
          </div>

          {/* Thème */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Mode sombre</Label>
            <Switch
              id="theme"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Version et bouton sauvegarder */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">
            {getVersionText()}
          </div>
          <Button onClick={handleSave} size="sm">
            Sauvegarder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;