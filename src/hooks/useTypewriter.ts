"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({ text, speed = 20, onComplete }: UseTypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    setDisplayedText('');
  }, []);

  useEffect(() => {
    if (!text || !isTyping) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, isTyping, onComplete]);

  return {
    displayedText,
    isTyping,
    startTyping
  };
};