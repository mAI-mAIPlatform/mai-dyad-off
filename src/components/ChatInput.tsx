"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, FileText, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { showSuccess, showError } from "@/utils/toast";
import { useTranslation } from "@/utils/i18n";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  language: string;
  iconColor?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder,
  language,
  iconColor = 'black'
}) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    selectedFile,
    isUploading,
    handleFileSelect,
    handleFileUpload,
    resetFile
  } = useFileUpload();
  
  const t = useTranslation(language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      resetFile();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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

  const getIconColorClass = () => {
    switch (iconColor) {
      case 'blue': return 'text-blue-500';
      case 'red': return 'text-red-500';
      case 'yellow': return 'text-yellow-500';
      case 'gray': return 'text-gray-500';
      case 'green': return 'text-green-500';
      case 'purple': return 'text-purple-500';
      default: return 'text-black dark:text-white';
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
                <FileText className={`w-4 h-4 ${getIconColorClass()}`} />
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
              disabled={isUploading}
            >
              <Paperclip className={`w-5 h-5 ${getIconColorClass()}`} />
            </Button>

            {/* Textarea - Même hauteur que les boutons */}
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder || t.chat.placeholder}
                disabled={isLoading || isUploading}
                className="min-h-[60px] h-10 max-h-32 resize-none pr-12 py-3 text-base"
                rows={1}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isLoading || isUploading}
              className="h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
              size="lg"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : selectedFile ? (
                t.chat.sendFile
              ) : (
                <Send className={`w-4 h-4 ${getIconColorClass()}`} />
              )}
            </Button>
          </div>
        </form>

        {/* Disclaimer */}
        <p className="text-xs text-center text-gray-500 mt-3">
          {t.chat.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default ChatInput;