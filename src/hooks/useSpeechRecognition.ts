"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Vérifier la compatibilité du navigateur
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fr-FR';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscript(finalTranscriptRef.current + interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && hasRecognitionSupport) {
      finalTranscriptRef.current = '';
      setTranscript('');
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("Recognition already started");
      }
    } else {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur");
    }
  }, [hasRecognitionSupport]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && hasRecognitionSupport) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [hasRecognitionSupport]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript
  };
};