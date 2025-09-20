"use client";

import React from 'react';
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface GreetingMessageProps {
  content: string;
}

const GreetingMessage: React.FC<GreetingMessageProps> = ({ content }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md mx-auto">
        {/* Avatar centré */}
        <div className="flex justify-center mb-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-green-500 text-white">
              <Star className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Message de salutation */}
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingMessage;