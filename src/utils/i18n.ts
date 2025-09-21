"use client";

export interface Translation {
  settings: {
    title: string;
    description: string;
    userName: string;
    language: string;
    model: string;
    darkMode: string;
    save: string;
    version: string;
  };
  chat: {
    newConversation: string;
    placeholder: string;
    disclaimer: string;
    listening: string;
    sendFile: string;
    fileUploadError: string;
    fileTypeError: string;
    fileSizeError: string;
  };
  messages: {
    copy: string;
    edit: string;
    save: string;
    cancel: string;
    copied: string;
    technicalError: string;
    generating: string;
  };
  languages: {
    fr: string;
    en: string;
    es: string;
    de: string;
    pt: string;
  };
  models: {
    'm-4.0': string;
    'm-4.3-mini': string;
    'm-4.5 Pro': string;
    'm-4.7o': string;
    'm-4.9+': string;
  };
  actions: {
    delete: string;
    rename: string;
  };
}

export const translations: Record<string, Translation> = {
  fr: {
    settings: {
      title: "Paramètres",
      description: "Configurez vos préférences d'application.",
      userName: "Votre nom",
      language: "Langue",
      model: "Modèle IA",
      darkMode: "Mode sombre",
      save: "Sauvegarder",
      version: "26 0.8 (Public Update)"
    },
    chat: {
      newConversation: "Nouvelle conversation",
      placeholder: "Message mAI...",
      disclaimer: "mAI peut faire des erreurs. Vérifiez les informations importantes.",
      listening: "En écoute... (cliquez sur le micro pour arrêter)",
      sendFile: "Envoyer fichier",
      fileUploadError: "Erreur lors de l'upload du fichier",
      fileTypeError: "Type de fichier non supporté. Formats acceptés: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX",
      fileSizeError: "Le fichier ne doit pas dépasser 5MB"
    },
    messages: {
      copy: "Copier",
      edit: "Modifier",
      save: "Enregistrer",
      cancel: "Annuler",
      copied: "Message copié",
      technicalError: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?",
      generating: "Génération en cours..."
    },
    languages: {
      fr: "Français",
      en: "Anglais",
      es: "Espagnol",
      de: "Allemand",
      pt: "Portugais"
    },
    models: {
      'm-4.0': 'Pour les tâches quotidiennes, rapide',
      'm-4.3-mini': 'Ecologique, court',
      'm-4.5 Pro': 'Professionnel, précis',
      'm-4.7o': 'Précis, long',
      'm-4.9+': 'Rapide, court'
    },
    actions: {
      delete: "Supprimer",
      rename: "Renommer"
    }
  },
  en: {
    settings: {
      title: "Settings",
      description: "Configure your application preferences.",
      userName: "Your name",
      language: "Language",
      model: "AI Model",
      darkMode: "Dark mode",
      save: "Save",
      version: "26 0.8 (Public Update)"
    },
    chat: {
      newConversation: "New conversation",
      placeholder: "Message mAI...",
      disclaimer: "mAI may make mistakes. Check important information.",
      listening: "Listening... (click mic to stop)",
      sendFile: "Send file",
      fileUploadError: "Error uploading file",
      fileTypeError: "File type not supported. Accepted formats: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX",
      fileSizeError: "File must not exceed 5MB"
    },
    messages: {
      copy: "Copy",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      copied: "Message copied",
      technicalError: "Sorry, I'm experiencing technical difficulties. Please try again.",
      generating: "Generating..."
    },
    languages: {
      fr: "French",
      en: "English",
      es: "Spanish",
      de: "German",
      pt: "Portuguese"
    },
    models: {
      'm-4.0': 'For daily tasks, fast',
      'm-4.3-mini': 'Eco-friendly, short',
      'm-4.5 Pro': 'Professional, precise',
      'm-4.7o': 'Precise, long',
      'm-4.9+': 'Fast, short'
    },
    actions: {
      delete: "Delete",
      rename: "Rename"
    }
  },
  es: {
    settings: {
      title: "Configuración",
      description: "Configure sus preferencias de aplicación.",
      userName: "Tu nombre",
      language: "Idioma",
      model: "Modelo de IA",
      darkMode: "Modo oscuro",
      save: "Guardar",
      version: "26 0.8 (Public Update)"
    },
    chat: {
      newConversation: "Nueva conversación",
      placeholder: "Mensaje mAI...",
      disclaimer: "mAI puede cometer errores. Verifique información importante.",
      listening: "Escuchando... (haga clic en el micrófono para detener)",
      sendFile: "Enviar archivo",
      fileUploadError: "Error al subir archivo",
      fileTypeError: "Tipo de archivo no compatible. Formatos aceptados: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX",
      fileSizeError: "El archivo no debe exceder 5MB"
    },
    messages: {
      copy: "Copiar",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      copied: "Mensaje copiado",
      technicalError: "Lo siento, estoy experimentando dificultades técnicas. Por favor, inténtelo de nuevo.",
      generating: "Generando..."
    },
    languages: {
      fr: "Francés",
      en: "Inglés",
      es: "Español",
      de: "Alemán",
      pt: "Portugués"
    },
    models: {
      'm-4.0': 'Para tareas diarias, rápido',
      'm-4.3-mini': 'Ecológico, corto',
      'm-4.5 Pro': 'Profesional, preciso',
      'm-4.7o': 'Preciso, largo',
      'm-4.9+': 'Rápido, corto'
    },
    actions: {
      delete: "Eliminar",
      rename: "Renombrar"
    }
  },
  de: {
    settings: {
      title: "Einstellungen",
      description: "Konfigurieren Sie Ihre Anwendungseinstellungen.",
      userName: "Ihr Name",
      language: "Sprache",
      model: "KI-Modell",
      darkMode: "Dunkelmodus",
      save: "Speichern",
      version: "26 0.8 (Public Update)"
    },
    chat: {
      newConversation: "Neue Konversation",
      placeholder: "Nachricht mAI...",
      disclaimer: "mAI kann Fehler machen. Überprüfen Sie wichtige Informationen.",
      listening: "Höre zu... (Mikrofon anklicken zum Stoppen)",
      sendFile: "Datei senden",
      fileUploadError: "Fehler beim Hochladen der Datei",
      fileTypeError: "Dateityp nicht unterstützt. Akzeptierte Formate: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX",
      fileSizeError: "Datei darf 5MB nicht überschreiten"
    },
    messages: {
      copy: "Kopieren",
      edit: "Bearbeiten",
      save: "Speichern",
      cancel: "Abbrechen",
      copied: "Nachricht kopiert",
      technicalError: "Entschuldigung, ich habe technische Schwierigkeiten. Bitte versuchen Sie es erneut.",
      generating: "Wird generiert..."
    },
    languages: {
      fr: "Französisch",
      en: "Englisch",
      es: "Spanisch",
      de: "Deutsch",
      pt: "Portugiesisch"
    },
    models: {
      'm-4.0': 'Für tägliche Aufgaben, schnell',
      'm-4.3-mini': 'Umweltfreundlich, kurz',
      'm-4.5 Pro': 'Professionell, präzise',
      'm-4.7o': 'Präzise, lang',
      'm-4.9+': 'Schnell, kurz'
    },
    actions: {
      delete: "Löschen",
      rename: "Umbenennen"
    }
  },
  pt: {
    settings: {
      title: "Configurações",
      description: "Configure suas preferências de aplicativo.",
      userName: "Seu nome",
      language: "Idioma",
      model: "Modelo de IA",
      darkMode: "Modo escuro",
      save: "Salvar",
      version: "26 0.8 (Public Update)"
    },
    chat: {
      newConversation: "Nova conversa",
      placeholder: "Mensagem mAI...",
      disclaimer: "mAI pode cometer erros. Verifique informações importantes.",
      listening: "Ouvindo... (clique no microfone para parar)",
      sendFile: "Enviar arquivo",
      fileUploadError: "Erro ao enviar arquivo",
      fileTypeError: "Tipo de arquivo não suportado. Formatos aceitos: TXT, PDF, DOC, DOCX, CSV, XLS, XLSX",
      fileSizeError: "O arquivo não deve exceder 5MB"
    },
    messages: {
      copy: "Copiar",
      edit: "Editar",
      save: "Salvar",
      cancel: "Cancelar",
      copied: "Mensagem copiada",
      technicalError: "Desculpe, estou com dificuldades técnicas. Por favor, tente novamente.",
      generating: "Gerando..."
    },
    languages: {
      fr: "Francês",
      en: "Inglês",
      es: "Espanhol",
      de: "Alemão",
      pt: "Português"
    },
    models: {
      'm-4.0': 'Para tarefas diárias, rápido',
      'm-4.3-mini': 'Ecológico, curto',
      'm-4.5 Pro': 'Profissional, preciso',
      'm-4.7o': 'Preciso, longo',
      'm-4.9+': 'Rápido, curto'
    },
    actions: {
      delete: "Excluir",
      rename: "Renomear"
    }
  }
};

export const useTranslation = (language: string = 'fr') => {
  return translations[language] || translations.fr;
};