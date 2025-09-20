"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MessageSquare, Trash2, Settings } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  onSelectConversation,
  currentConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'default',
      title: "Nouvelle conversation",
      timestamp: new Date()
    }
  ]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      timestamp: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    onNewChat();
    showSuccess("Nouvelle conversation créée");
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length > 1) {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      if (currentConversationId === id) {
        onSelectConversation(conversations.find(conv => conv.id !== id)?.id || 'default');
      }
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className={`p-3 cursor-pointer transition-colors ${
                currentConversationId === conversation.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {conversation.title}
                  </span>
                </div>
                {conversation.id !== 'default' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {conversation.timestamp.toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-gray-400"
        >
          <Settings className="w-4 h-4 mr-2" />
          Paramètres
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;