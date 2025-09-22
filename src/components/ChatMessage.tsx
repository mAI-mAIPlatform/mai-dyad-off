"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Copy, Edit, Check, X, Star, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess } from "@/utils/toast";
import { useTranslation } from "@/utils/i18n";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isGenerating?: boolean;
  onEditMessage: (id: string, newContent: string) => void;
  onCopyMessage: (content: string) => void;
  onRegenerateResponse?: (messageId: string, newContent: string) => void;
  language: string;
  iconColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  role,
  timestamp,
  isGenerating = false,
  onEditMessage,
  onCopyMessage,
  onRegenerateResponse,
  language,
  iconColor
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const t = useTranslation(language);

  useEffect(() => {
    if (role === 'assistant' && !isGenerating && content) {
      setIsTyping(true);
      setDisplayedText('');
      
      let index = 0;
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedText(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 15);

      return () => clearInterval(timer);
    } else {
      setDisplayedText(content);
      setIsTyping(false);
    }
  }, [content, role, isGenerating]);

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

  const handleCopy = () => {
    onCopyMessage(content);
    showSuccess(t.messages.copied);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== content) {
      onEditMessage(id, editedContent.trim());
      
      // Régénérer la réponse de l'IA si c'est un message utilisateur modifié
      if (role === 'user' && onRegenerateResponse) {
        onRegenerateResponse(id, editedContent.trim());
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Fonction pour extraire les URLs d'images du contenu
  const extractImageUrls = (text: string): string[] => {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*\.(?:jpg|jpeg|png|gif|webp)/gi;
    const matches = text.match(urlRegex);
    return matches ? matches : [];
  };

  const imageUrls = extractImageUrls(content);

  return (
    <div className={`group py-4 ${role === 'user' ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={
                role === 'user' 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-transparent'
              }>
                {role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : isGenerating ? (
                  <Star className={`w-4 h-4 animate-spin ${getIconColorClass()}`} />
                ) : (
                  <Star className={`w-4 h-4 ${getIconColorClass()}`} />
                )}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {role === 'user' ? t.messages.you : 'mAI'}
              </span>
              <span className="text-xs text-gray-500">
                {timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="h-8 px-3 text-xs"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {t.messages.save}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 px-3 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t.messages.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img 
                          {...props} 
                          className="max-w-full h-auto rounded-lg my-2"
                          alt={props.alt || "Image générée"}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="whitespace-pre-wrap leading-relaxed" />
                      )
                    }}
                  >
                    {role === 'assistant' && !isGenerating ? displayedText : content}
                  </ReactMarkdown>
                  {isTyping && (
                    <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse align-middle"></span>
                  )}
                </div>

                {/* Images générées */}
                {imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group/image">
                        <img 
                          src={url} 
                          alt={`Image générée ${index + 1}`} 
                          className="rounded-lg w-full h-auto object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity h-7 px-2 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            showSuccess("URL de l'image copiée");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copier
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions - Masqué pendant la frappe */}
                {!isTyping && (
                  <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={handleCopy}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {t.messages.copy}
                    </Button>
                    {role === 'user' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={handleEdit}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {t.messages.edit}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;