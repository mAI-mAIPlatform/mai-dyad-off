"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, FileText, X, Smile } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { showSuccess, showError } from "@/utils/toast";
import { useTranslation } from "@/utils/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  language: string;
  iconColor: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder,
  language,
  iconColor
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

  const insertEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '✨', '🎉', '🙏', '👏', '💯'];

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

            <div className="flex flex-col gap-1">
              {/* Emoji Button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="grid grid-cols-6 gap-1">
                    {emojis.map((emoji, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Attachment Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={handleFileButtonClick}
                disabled={isUploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>

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
              className="h-10 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:text-gray-500 border border-gray-300 text-gray-700"
              size="lg"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
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