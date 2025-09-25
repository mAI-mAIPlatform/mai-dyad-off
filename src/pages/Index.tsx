"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from "next-themes";
import { showSuccess, showError } from "@/utils/toast";
import { OpenRouterService, OpenRouterMessage } from "@/services/openrouter";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import SettingsDialog from "@/components/SettingsDialog";
import GreetingMessage from "@/components/GreetingMessage";
import { generateGreetingMessages } from "@/utils/greetings";
import { useTranslation } from "@/utils/i18n";
import ModelDropdown from "@/components/ModelDropdown";
import { CustomModel } from "@/components/CustomModelDialog";
import { Button } from "@/components/ui/button"; // Import manquant ajouté
import { X } from "lucide-react"; // Import manquant ajouté

// ... (le reste du code reste inchangé jusqu'à la fonction handleBetaFeaturesChange)

const handleBetaFeaturesChange = (enabled: boolean) => { // Correction: ajout de '=>'
  setBetaFeaturesEnabled(enabled);
  localStorage.setItem('betaFeaturesEnabled', enabled.toString());
};

// ... (le reste du code reste inchangé jusqu'à la bannière d'erreur API)

{apiError && (
  <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3">
    <div className="max-w-4xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-red-600 dark:text-red-400 text-sm">
          ⚠️ {apiError}
        </span>
      </div>
      <Button // Erreur corrigée: import ajouté
        variant="ghost"
        size="sm"
        onClick={() => setApiError(null)}
        className="text-red-600 hover:text-red-700"
      >
        <X className="w-4 h-4" /> // Erreur corrigée: import ajouté
      </Button> // Erreur corrigée: import ajouté
    </div>
  </div>
)}

// ... (le reste du code reste inchangé)