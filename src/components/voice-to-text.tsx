'use client';

import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  description = "Hit the mic button and explain what you're working on — your coach is listening."
}: VoiceToTextProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Send transcript to parent when it changes
  React.useEffect(() => {
    if (onTranscript) onTranscript(transcript);
  }, [transcript, onTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Hmm, your browser doesn't support voice input yet. Try using Chrome or Edge, or just type your notes below!
        </AlertDescription>
      </Alert>
    );
  }

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {listening ? (
            <>
              <Mic className="h-5 w-5 text-red-500 animate-pulse" />
              <span className="text-red-500">Listening...</span>
            </>
          ) : (
            <>
              <MicOff className="h-5 w-5 text-muted-foreground" />
              <span>{title}</span>
            </>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={transcript}
          readOnly
          className="min-h-[120px] bg-slate-50 dark:bg-slate-900"
          placeholder={placeholder}
        />
        
        <div className="flex flex-wrap gap-2">
          {!listening ? (
            <Button
              onClick={handleStartListening}
              className="bg-primary hover:bg-primary/90"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={handleStopListening}
              variant="destructive"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
          
          <Button
            onClick={resetTranscript}
            variant="outline"
            disabled={!transcript}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {transcript && (
          <p className="text-sm text-muted-foreground">
            ✨ Great! You can edit this text above, or click "Stop Recording" when you're done.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

