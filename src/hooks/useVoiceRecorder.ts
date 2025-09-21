"use client";

import { useState, useRef, useCallback } from 'react';
import { showError } from '@/utils/toast';

interface VoiceRecorderHook {
  isRecording: boolean;
  audioBlob: Blob | null;
  startRecording: () => void;
  stopRecording: () => void;
  hasRecordingSupport: boolean;
  resetRecording: () => void;
}

export const useVoiceRecorder = (): VoiceRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasRecordingSupport, setHasRecordingSupport] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const checkRecordingSupport = useCallback(() => {
    const hasSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setHasRecordingSupport(hasSupport);
    return hasSupport;
  }, []);

  const startRecording = useCallback(async () => {
    if (!checkRecordingSupport()) {
      showError("L'enregistrement vocal n'est pas supporté par votre navigateur");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(audioBlob);
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      showError("Impossible d'accéder au microphone");
    }
  }, [checkRecordingSupport]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    hasRecordingSupport,
    resetRecording
  };
};