"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Message mAI..."
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            {/* Attachment Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-400 hover:text-gray-600"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="min-h-[60px] max-h-32 resize-none pr-12 py-3"
                rows={1}
              />
              
              {/* Voice Input Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-10 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
              size="lg"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
        
        {/* Disclaimer */}
        <p className="text-xs text-center text-gray-500 mt-3">
          mAI peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;