"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Copy, 
  Edit, 
  RotateCcw, 
  MoreHorizontal,
  User,
  Bot,
  Check,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/utils/i18n";
import { showSuccess, showError } from "@/utils/toast";
import * as LucideIcons from "lucide-react";

interface ChatMessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  onEditMessage: (messageId: string, newContent: string) => void;
  onCopyMessage: (content: string) => void;
  onRegenerateResponse?: (messageId: string, newContent: string, options?: { model?: string, length?: 'shorter' | 'longer' }) => void;
  language: string;
  iconColor: string;
  isGenerating?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  role,
  timestamp,
  onEditMessage,
  onCopyMessage,
  onRegenerateResponse,
  language,
  iconColor,
  isGenerating = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const t = useTranslation(language);

  const handleCopy = () => {
    onCopyMessage(content);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content) {
      onEditMessage(id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleRegenerate = (options?: { model?: string, length?: 'shorter' | 'longer' }) => {
    if (onRegenerateResponse) {
      onRegenerateResponse(id, content, options);
    }
  };

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

  const getUserAvatar = () => {
    const savedAvatar = localStorage.getItem('userAvatar');
    return savedAvatar || '';
  };

  const getAIAvatar = () => {
    const savedAIAvatar = localStorage.getItem('aiAvatar');
    return savedAIAvatar || '';
  };

  const getUserAvatarIcon = () => {
    return localStorage.getItem('userAvatarIcon') || 'user';
  };

  const getAIAvatarIcon = () => {
    return localStorage.getItem('aiAvatarIcon') || 'star';
  };

  const renderIcon = (iconName: string, className: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const IconComponent = (LucideIcons as any)[formattedIconName] || User;
    return <IconComponent className={className} />;
  };

  const formatContent = (text: string) => {
    // Gestion des erreurs d'API
    if (text.includes('User not found') || text.includes('Erreur:')) {
      return (
        <div className="text-red-500">
          <p className="font-medium">Erreur de connexion</p>
          <p className="text-sm">Veuillez vérifier votre connexion et réessayer.</p>
        </div>
      );
    }

    // Gestion des images
    const imageMatch = text.match(/!\[.*?\]\((.*?)\)/);
    if (imageMatch) {
      return (
        <div className="space-y-2">
          <p>{text.replace(/!\[.*?\]\(.*?\)/, '').trim()}</p>
          <img 
            src={imageMatch[1]} 
            alt="Image générée" 
            className="max-w-full h-auto rounded-lg border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    // Formatage du texte avec sauts de ligne
    return text.split('\n').map((line, index) => (
      <p key={index} className={index > 0 ? 'mt-2' : ''}>
        {line}
      </p>
    ));
  };

  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar et contenu de l'IA (à gauche) */}
      {!isUser && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            {getAIAvatar() ? (
              <AvatarImage src={getAIAvatar()} alt="AI Avatar" />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white">
                {renderIcon(getAIAvatarIcon(), "w-4 h-4")}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}

      {/* Message */}
      <div className={`flex-1 ${isUser ? 'max-w-[80%]' : 'max-w-[80%]'}`}>
        <Card className={`p-4 ${isUser ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md resize-none min-h-[100px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <X className="w-3 h-3 mr-1" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="w-3 h-3 mr-1" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="prose dark:prose-invert max-w-none">
                {isGenerating ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-pulse bg-gray-300 rounded-full w-2 h-2"></div>
                    <div className="animate-pulse bg-gray-300 rounded-full w-2 h-2" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-pulse bg-gray-300 rounded-full w-2 h-2" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  formatContent(content)
                )}
              </div>
              
              <div className={`flex items-center justify-between mt-3 text-xs text-gray-500 ${isUser ? 'flex-row-reverse' : ''}`}>
                <span>{timestamp.toLocaleTimeString()}</span>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-6 w-6 text-gray-400 hover:text-gray-600"
                    title={t.messages.copy}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  
                  {isUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleEdit}
                      className="h-6 w-6 text-gray-400 hover:text-gray-600"
                      title={t.messages.edit}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                  
                  {!isUser && onRegenerateResponse && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          title="Régénérer la réponse"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRegenerate()}>
                          Régénérer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerate({ length: 'shorter' })}>
                          Plus court
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerate({ length: 'longer' })}>
                          Plus long
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Avatar de l'utilisateur (à droite) */}
      {isUser && (
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            {getUserAvatar() ? (
              <AvatarImage src={getUserAvatar()} alt="User Avatar" />
            ) : (
              <AvatarFallback className="bg-gray-500 text-white">
                {renderIcon(getUserAvatarIcon(), "w-4 h-4")}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;