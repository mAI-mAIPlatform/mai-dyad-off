"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, MicOff, FileText, X, Volume2 } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useFileUpload } from "@/hooks/useFileUpload";
import { SpeechToTextService } from "@/services/speechToText";
import { showSuccess, showError } from "@/utils/toast";
import { useTranslation } from "@/utils/i18n";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  language: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder,
  language
}) => {
  const [input, setInput] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript
  } = useSpeechRecognition();

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    hasRecordingSupport,
    resetRecording
  } = useVoiceRecorder();

  const {
    selectedFile,
    isUploading,
    handleFileSelect,
    handleFileUpload,
    resetFile
  } = useFileUpload(language);
  
  const t = useTranslation(language);

  // Mettre à jour l'input avec la transcription vocale
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Gérer l'enregistrement audio et la transcription
  useEffect(() => {
    const handleAudioTranscription = async () => {
      if (audioBlob && !isTranscribing) {
        setIsTranscribing(true);
        
        try {
          const result = await SpeechToTextService.transcribeAudio(audioBlob);
          
          if (result.error) {
            showError(`Erreur de transcription: ${result.error}`);
          } else if (result.text.trim()) {
            setInput(result.text.trim());
            // Envoyer automatiquement le message transcrit
            onSendMessage(result.text.trim());
            setInput('');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          showError("Erreur lors de la transcription audio");
        } finally {
          setIsTranscribing(false);
          resetRecording();
        }
      }
    };

    handleAudioTranscription();
  }, [audioBlob, isTranscribing, onSendMessage, resetRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Arrêter la dictée si elle est active
    if (isListening) {
      stopListening();
    }
    
    // Arrêter l'enregistrement si actif
    if (isRecording) {
      stopRecording();
      return; // La transcription se fera automatiquement via l'effet
    }
    
    // Si un fichier est sélectionné mais pas encore uploadé
    if (selectedFile && !isUploading) {
      try {
        const fileContent = await handleFileUpload();
        onSendMessage(`${t.chat.sendFile} ${selectedFile.name}:\n\n${fileContent}`);
        resetFile();
        return;
      } catch (error) {
        showError(t.chat.fileUploadError);
        return;
      }
    }

    // Envoyer le message normal
    if (input.trim() && !isLoading && !isTranscribing) {
      onSendMessage(input.trim());
      setInput('');
      resetFile();
      resetTranscript();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else if (isListening) {
      stopListening();
    } else {
      // Préférer l'enregistrement audio si supporté
      if (hasRecordingSupport) {
        startRecording();
      } else if (hasRecognitionSupport) {
        startListening();
      } else {
        showError("Aucune méthode de saisie vocale disponible");
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    resetFile();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVoiceButtonState = () => {
    if (isRecording) return 'recording';
    if (isListening) return 'listening';
    if (isTranscribing) return 'transcribing';
    return 'idle';
  };

  const getVoiceButtonIcon = () => {
    const state = getVoiceButtonState();
    switch (state) {
      case 'recording':
        return <MicOff className="w-4 h-4" />;
      case 'transcribing':
        return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
      default:
        return <Mic className="w-4 h-4" />;
    }
  };

  const getVoiceButtonColor = () => {
    const state = getVoiceButtonState();
    switch (state) {
      case 'recording':
        return 'text-red-500 hover:text-red-600 animate-pulse';
      case 'transcribing':
        return 'text-blue-500 hover:text-blue-600';
      default:
        return 'text-gray-400 hover:text-gray-600';
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        {/* Afficher le fichier sélectionné */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-blue-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
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
          </div>
        )}

        {/* Indicateur d'enregistrement */}
        {isRecording && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-700 dark:text-red-300">
                Enregistrement en cours... Parlez maintenant
              </span>
            </div>
          </div>
        )}

        {/* Indicateur de transcription */}
        {isTranscribing && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Transcription audio en cours...
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            {/* File Input (hidden) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.csv,.xls,.xlsx"
            />

            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-400 hover:text-gray-600"
              onClick={handleFileButtonClick}
              disabled={isUploading || isRecording || isTranscribing}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder || t.chat.placeholder}
                disabled={isLoading || isUploading || isRecording || isTranscribing}
                className="min-h-[60px] max-h-32 resize-none pr-12 py-3 text-base"
                rows={1}
              />
              
              {/* Voice Input Button */}
              {(hasRecordingSupport || hasRecognitionSupport) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`absolute right-2 bottom-2 h-8 w-8 ${getVoiceButtonColor()}`}
                  onClick={toggleVoiceInput}
                  disabled={isUploading || isTranscribing}
                >
                  {getVoiceButtonIcon()}
                </Button>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={(!input.trim() && !selectedFile && !isRecording) || isLoading || isUploading || isTranscribing}
              className="h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
              size="lg"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <Volume2 className="w-4 h-4" />
              ) : selectedFile ? (
                t.chat.sendFile
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
        
        {/* Indicateur de dictée */}
        {isListening && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-500">{t.chat.listening}</span>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-gray-500 mt-3">
          {t.chat.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default ChatInput;