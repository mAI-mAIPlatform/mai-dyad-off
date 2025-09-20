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
      <div className="text-center max-w-2xl mx-auto">
        {/* Avatar centré */}
        <div className="flex justify-center mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-green-500 text-white">
              <Star className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Message de salutation */}
        <div className="prose prose-2xl dark:prose-invert">
          <p className="text-3xl text-gray-800 dark:text-gray-100 font-light leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GreetingMessage;