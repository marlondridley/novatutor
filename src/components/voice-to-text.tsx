/**
 * Voice-to-Text Component
 * 
 * Uses browser's Web Speech API for real-time speech recognition.
 * Premium Voice users get OpenAI Whisper for better accuracy.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';

interface VoiceToTextProps {
  onTranscript?: (text: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

export default function VoiceToText({ 
  onTranscript,
  placeholder = "Your words will appear here as you speak...",
  title = "🎙️ Talk It Out",
  description = "Click the mic, speak clearly, and watch your words appear!",
}: VoiceToTextProps) {
  const { user } = useAuth();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const hasPremiumVoice = user?.premium_voice_enabled === true;

  // Initialize Web Speech API for standard users
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasPremiumVoice) return; // Premium uses recording + API
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      
      setTranscript(fullTranscript);
      onTranscript?.(fullTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Please allow microphone access in your browser settings.');
      } else {
        setError('Speech recognition error. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [hasPremiumVoice, onTranscript]);

  // Start listening (standard) or recording (premium)
  const startListening = useCallback(async () => {
    setError(null);
    
    if (hasPremiumVoice) {
      // Premium: Record audio for OpenAI transcription
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });
        
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000);
        setIsListening(true);
      } catch (err) {
        setError('Could not access microphone. Please allow access.');
      }
    } else {
      // Standard: Use Web Speech API
      if (!recognitionRef.current) return;
      
      setTranscript('');
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Start error:', err);
      }
    }
  }, [hasPremiumVoice]);

  // Stop listening/recording
  const stopListening = useCallback(async () => {
    if (hasPremiumVoice && mediaRecorderRef.current) {
      // Premium: Stop recording and send to OpenAI
      const mediaRecorder = mediaRecorderRef.current;
      
      return new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
          
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType 
          });
          
          if (audioBlob.size < 1000) {
            setError('Recording too short. Please speak for longer.');
            setIsListening(false);
            resolve();
            return;
          }

          try {
            setIsTranscribing(true);
            const text = await transcribeWithOpenAI(audioBlob);
            setTranscript(text);
            onTranscript?.(text);
          } catch (err: any) {
            setError('Transcription failed. Please try again.');
          } finally {
            setIsTranscribing(false);
          }
          
          resolve();
        };
        
        mediaRecorder.stop();
      });
    } else if (recognitionRef.current) {
      // Standard: Stop Web Speech API
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Stop error:', err);
      }
    }
    
    setIsListening(false);
  }, [hasPremiumVoice, onTranscript]);

  const transcribeWithOpenAI = async (audioBlob: Blob): Promise<string> => {
    const base64 = await blobToBase64(audioBlob);
    
    const response = await fetch('/api/stt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioDataUri: base64, language: 'en' }),
    });
    
    if (!response.ok) throw new Error('Transcription failed');
    
    const data = await response.json();
    return data.data?.transcript || '';
  };

  const clearTranscript = () => {
    if (transcript && !confirm('Clear the current transcript?')) return;
    setTranscript('');
    setError(null);
    onTranscript?.('');
  };

  if (!isSupported && !hasPremiumVoice) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your browser doesn't support voice input. Try using Chrome or Edge!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isListening ? (
            <>
              <Mic className="h-5 w-5 text-red-500 animate-pulse" />
              <span className="text-red-500">Listening...</span>
            </>
          ) : isTranscribing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Transcribing...</span>
            </>
          ) : (
            <>
              <MicOff className="h-5 w-5 text-muted-foreground" />
              <span>{title}</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {description}
          {hasPremiumVoice && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              ✨ Premium Voice
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        
        <Textarea
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscript?.(e.target.value);
          }}
          className="min-h-[120px]"
          placeholder={placeholder}
        />
        
        <div className="flex flex-wrap gap-2">
          {!isListening ? (
            <Button onClick={startListening} disabled={isTranscribing}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopListening} variant="destructive">
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
          
          {transcript && (
            <Button onClick={clearTranscript} variant="outline">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}

          {!transcript && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const sample = "Can you explain fractions with a quick example?";
                setTranscript(sample);
                onTranscript?.(sample);
              }}
            >
              ✨ Try a sample question
            </Button>
          )}
        </div>

        {isListening && (
          <p className="text-sm text-muted-foreground">
            🎤 Listening... Speak now!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
