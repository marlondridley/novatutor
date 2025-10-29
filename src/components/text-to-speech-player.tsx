'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Volume2, VolumeX, Loader2, Play, Pause } from 'lucide-react';

interface TextToSpeechPlayerProps {
  text: string;
  autoPlay?: boolean;
  className?: string;
}

type Voice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

const VOICE_OPTIONS: { value: Voice; label: string; description: string }[] = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral and balanced' },
  { value: 'echo', label: 'Echo', description: 'Clear and articulate' },
  { value: 'fable', label: 'Fable', description: 'Warm and expressive' },
  { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
  { value: 'nova', label: 'Nova', description: 'Bright and energetic' },
  { value: 'shimmer', label: 'Shimmer', description: 'Soft and friendly' },
];

export function TextToSpeechPlayer({ text, autoPlay = false, className = '' }: TextToSpeechPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [voice, setVoice] = useState<Voice>('alloy');
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = (e) => {
      console.error('Audio playback error:', e);
      setError('Playback error occurred');
      setIsPlaying(false);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const playStreamingAudio = async () => {
    if (!text) {
      setError('No text to convert');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch streaming audio from API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice, speed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Read the stream and create a blob URL for playback
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
        }
      }

      // Combine all chunks into a single blob
      const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error('TTS Error:', err);
      setError(err.message || 'Failed to generate speech');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await playStreamingAudio();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`flex flex-col gap-4 p-4 border rounded-lg ${className}`}>
      {/* Voice Selection */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Voice:</label>
        <Select value={voice} onValueChange={(v) => setVoice(v as Voice)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VOICE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Speed:</label>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground">0.25x</span>
          <Slider
            value={[speed]}
            onValueChange={(value) => setSpeed(value[0])}
            min={0.25}
            max={4.0}
            step={0.25}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">4.0x</span>
          <span className="text-sm font-medium w-12 text-center">{speed}x</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={togglePlayPause}
          disabled={isLoading || !text}
          variant="default"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Play
            </>
          )}
        </Button>

        <Button
          onClick={toggleMute}
          disabled={!isPlaying}
          variant="outline"
          size="icon"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}

      {/* Text Preview */}
      <div className="text-sm text-muted-foreground border-t pt-2">
        <strong>Text to speak:</strong>
        <p className="mt-1 italic">{text.substring(0, 100)}{text.length > 100 ? '...' : ''}</p>
      </div>
    </div>
  );
}

