'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { speakNaturally, type SpeechStyle } from '@/lib/natural-speech';

export interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  style: SpeechStyle;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice: 'default',
  rate: 0.95,
  pitch: 1.0,
  volume: 1.0,
  style: 'greeting',
};

export function VoiceSettings({ 
  userId, 
  onSave 
}: { 
  userId: string;
  onSave?: (settings: VoiceSettings) => Promise<void>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
        
        // Set default voice if not set
        if (settings.voice === 'default' && voices.length > 0) {
          const defaultVoice = voices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Microsoft') ||
            v.lang.startsWith('en')
          ) || voices[0];
          
          setSettings(prev => ({
            ...prev,
            voice: defaultVoice.name,
          }));
        }
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load saved settings
    loadSettings();

    return () => {
      setLoading(false);
    };
  }, []);

  // Load settings from localStorage or database
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try localStorage first (fast)
      const saved = localStorage.getItem(`voice-settings-${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setLoading(false);
        return;
      }

      // Try database (slower)
      const response = await fetch(`/api/user/voice-settings?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          // Cache in localStorage
          localStorage.setItem(`voice-settings-${userId}`, JSON.stringify(data.settings));
        }
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Save settings
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      // Save to localStorage (fast)
      localStorage.setItem(`voice-settings-${userId}`, JSON.stringify(settings));

      // Save to database (if onSave callback provided)
      if (onSave) {
        await onSave(settings);
      } else {
        // Default: save to database
        const response = await fetch('/api/user/voice-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, settings }),
        });

        if (!response.ok) {
          throw new Error('Failed to save voice settings');
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving voice settings:', error);
      setError(error.message || 'Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  }, [settings, userId, onSave]);

  // Test voice
  const handleTest = useCallback(async () => {
    try {
      setTesting(true);
      setError('');
      
      const testText = "Hello! This is how I'll sound. How does this voice work for you?";
      
      await speakNaturally(
        testText,
        settings.style,
        () => console.log('🗣️ Test started'),
        () => {
          console.log('✅ Test ended');
          setTesting(false);
        }
      );
    } catch (error: any) {
      console.error('Test error:', error);
      setError(error.message || 'Failed to test voice');
      setTesting(false);
    }
  }, [settings]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Settings
        </CardTitle>
        <CardDescription>
          Customize how the coach sounds. Adjust the voice, speed, pitch, and volume to your preference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Voice settings saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select
            value={settings.voice}
            onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}
          >
            <SelectTrigger id="voice">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.length > 0 ? (
                availableVoices.map((voice) => (
                  <SelectItem key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="default">Default Voice</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose a voice that works best for you
          </p>
        </div>

        {/* Speech Rate (Speed) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate">Speed</Label>
            <span className="text-sm text-muted-foreground">
              {settings.rate.toFixed(2)}x
            </span>
          </div>
          <Slider
            id="rate"
            min={0.5}
            max={2.0}
            step={0.05}
            value={[settings.rate]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, rate: value }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pitch">Pitch</Label>
            <span className="text-sm text-muted-foreground">
              {settings.pitch.toFixed(2)}x
            </span>
          </div>
          <Slider
            id="pitch"
            min={0.0}
            max={2.0}
            step={0.05}
            value={[settings.pitch]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, pitch: value }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="volume">Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <Slider
            id="volume"
            min={0.0}
            max={1.0}
            step={0.05}
            value={[settings.volume]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Quiet</span>
            <span>Normal</span>
            <span>Loud</span>
          </div>
        </div>

        {/* Speech Style */}
        <div className="space-y-2">
          <Label htmlFor="style">Speech Style</Label>
          <Select
            value={settings.style}
            onValueChange={(value) => setSettings(prev => ({ ...prev, style: value as SpeechStyle }))}
          >
            <SelectTrigger id="style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="greeting">Greeting (Warm, welcoming)</SelectItem>
              <SelectItem value="question">Question (Curious, inviting)</SelectItem>
              <SelectItem value="encouragement">Encouragement (Supportive, confident)</SelectItem>
              <SelectItem value="explanation">Explanation (Clear, measured)</SelectItem>
              <SelectItem value="celebration">Celebration (Excited, energetic)</SelectItem>
              <SelectItem value="reflection">Reflection (Thoughtful, calm)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the tone that matches the conversation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="outline"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Volume2 className="mr-2 h-4 w-4" />
                Test Voice
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

