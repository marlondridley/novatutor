/**
 * Speech-to-Text Hook
 * 
 * Uses the browser's built-in Web Speech API for speech recognition.
 * This works reliably without needing to download any models.
 * 
 * For Premium Voice users, we use OpenAI Whisper API instead.
 * 
 * Usage:
 *   const { startListening, stopListening, transcript, isListening } = useLocalWhisper();
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseLocalWhisperReturn {
  transcribe: (audioBlob: Blob) => Promise<string>;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  isModelLoaded: boolean;
  isModelLoading: boolean;
  isTranscribing: boolean;
  isListening: boolean;
  loadProgress: number;
  error: string | null;
  isSupported: boolean;
}

export function useLocalWhisper(): UseLocalWhisperReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error || 'Speech recognition error');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // Already started, ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
      // Already stopped, ignore
    }
  }, []);

  /**
   * Transcribe audio blob (for compatibility with existing code)
   * Falls back to returning empty since Web Speech API is real-time
   */
  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    // Web Speech API doesn't support file transcription
    // This is a placeholder for API compatibility
    setIsTranscribing(true);
    
    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsTranscribing(false);
    return transcript;
  }, [transcript]);

  return {
    transcribe,
    startListening,
    stopListening,
    transcript,
    isModelLoaded: isSupported, // Always "loaded" for Web Speech API
    isModelLoading: false,
    isTranscribing,
    isListening,
    loadProgress: 100,
    error,
    isSupported,
  };
}
