/**
 * Custom hook for continuous voice session with wake word detection
 * and periodic check-ins from the coach
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface CoachVoiceSessionOptions {
  wakeWord?: string; // Default: "hey coach"
  checkInInterval?: number; // Minutes between check-ins (default: 5)
  onWakeWordDetected?: () => void;
  onCheckIn?: () => void;
  onTranscript?: (text: string) => void;
}

export function useCoachVoiceSession({
  wakeWord = 'hey coach',
  checkInInterval = 5,
  onWakeWordDetected,
  onCheckIn,
  onTranscript,
}: CoachVoiceSessionOptions = {}) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [isListeningForCommand, setIsListeningForCommand] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState<Date | null>(null);
  const checkInTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Detect wake word in transcript
  useEffect(() => {
    if (isListeningForWakeWord && transcript) {
      const normalized = transcript.toLowerCase().trim();
      
      console.log('🎤 Listening for wake word... transcript:', normalized);
      
      // Check for wake word variations
      const wakeWordVariations = [
        wakeWord.toLowerCase(),
        wakeWord.replace('hey ', '').toLowerCase(),
        wakeWord.replace(' ', '').toLowerCase(),
        'hey coach',
        'coach',
        'heycoach',
        'a coach',
        'hey couch', // Common misrecognition
      ];

      const detected = wakeWordVariations.find(variation => normalized.includes(variation));
      
      if (detected) {
        console.log('✅ Wake word DETECTED! Variation:', detected, 'Full transcript:', normalized);
        setIsListeningForWakeWord(false);
        setIsListeningForCommand(true);
        
        // Call callback immediately
        onWakeWordDetected?.();
        
        // Wait a moment, then clear transcript to start fresh for the command
        setTimeout(() => {
          resetTranscript();
          console.log('🔄 Transcript cleared, ready for command...');
        }, 500);
      }
    }
  }, [transcript, isListeningForWakeWord, wakeWord, onWakeWordDetected, resetTranscript]);

  // Pass command transcript to parent
  useEffect(() => {
    if (isListeningForCommand && transcript && transcript.trim().length > 10) {
      console.log('📝 Command captured:', transcript);
      onTranscript?.(transcript);
    }
  }, [transcript, isListeningForCommand, onTranscript]);

  // Start session with continuous wake word listening
  const startSession = useCallback(async () => {
    if (!browserSupportsSpeechRecognition) {
      console.error('❌ Browser does not support speech recognition');
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }

    console.log('🎤 Starting wake word session...');

    // Request microphone permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release the stream
      console.log('✅ Microphone permission granted');
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      alert('Microphone access is required for wake word detection. Please allow microphone access and try again.');
      return;
    }

    setIsSessionActive(true);
    setIsListeningForWakeWord(true);
    setLastCheckInTime(new Date());
    
    // Start continuous listening
    console.log('🎙️ Starting continuous listening...');
    SpeechRecognition.startListening({ 
      continuous: true, 
      language: 'en-US' 
    });

    // Set up check-in timer
    checkInTimerRef.current = setInterval(() => {
      console.log('⏰ 5-minute check-in triggered');
      onCheckIn?.();
      setLastCheckInTime(new Date());
    }, checkInInterval * 60 * 1000);

    console.log('✅ Wake word session started! Say "Hey Coach" to activate.');

  }, [browserSupportsSpeechRecognition, checkInInterval, onCheckIn]);

  // Stop session
  const stopSession = useCallback(() => {
    setIsSessionActive(false);
    setIsListeningForWakeWord(false);
    setIsListeningForCommand(false);
    SpeechRecognition.stopListening();
    resetTranscript();

    if (checkInTimerRef.current) {
      clearInterval(checkInTimerRef.current);
      checkInTimerRef.current = null;
    }
  }, [resetTranscript]);

  // Reset to listening for wake word after command is processed
  const resetToWakeWord = useCallback(() => {
    setIsListeningForCommand(false);
    setIsListeningForWakeWord(true);
    resetTranscript();
  }, [resetTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    isSessionActive,
    isListeningForWakeWord,
    isListeningForCommand,
    transcript,
    listening,
    lastCheckInTime,
    startSession,
    stopSession,
    resetToWakeWord,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
}

