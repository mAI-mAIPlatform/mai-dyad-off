"use client";

import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  onFeedback?: (isPositive: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
  onFeedback
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      showSuccess("Message copié !");
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

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
                  : 'bg-green-500 text-white'
              }>
                {role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {role === 'user' ? 'Vous' : 'mAI'}
              </span>
              <span className="text-xs text-gray-500">
                {timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
            </div>

            {/* Actions */}
            {role === 'assistant' && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleCopy}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onFeedback?.(true)}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onFeedback?.(false)}
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;