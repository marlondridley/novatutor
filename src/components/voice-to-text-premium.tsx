'use client';

import React, { useState } from 'react';
import VoiceToText from '@/components/voice-to-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface VoiceToTextPremiumProps {
  onTranscript?: (text: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
}

export function VoiceToTextPremium({
  onTranscript,
  placeholder,
  title,
  description,
}: VoiceToTextPremiumProps) {
  const { user } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  // Check if user has premium voice (TODO: Connect to real subscription data)
  const hasPremiumVoice = user?.premium_voice_enabled || false;

  const handleTranscript = (transcript: string) => {
    // Track retries (if user clears and starts over multiple times)
    if (transcript.length < lastTranscript.length - 10) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      // Show upgrade prompt after 3 retries
      if (newRetryCount >= 3 && !hasPremiumVoice) {
        setShowUpgradePrompt(true);
      }
    }

    setLastTranscript(transcript);
    onTranscript?.(transcript);
  };

  const handleUpgrade = () => {
    // Redirect to Stripe payment link for Study Coach + Premium Voice bundle
    window.location.href = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05';
  };

  return (
    <div className="space-y-4">
      {/* Premium Badge */}
      {hasPremiumVoice && (
        <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200">
          <Crown className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Premium Voice Active 🎤✨
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            You're using advanced AI for 99% accuracy in any language!
          </AlertDescription>
        </Alert>
      )}

      {/* Upgrade Prompt (after 3 retries) */}
      {showUpgradePrompt && !hasPremiumVoice && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              💡 Having issues with voice accuracy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>Premium Voice</strong> gives you <strong>99% accuracy</strong> with 
              advanced AI — perfect for accents, multiple languages, background noise, 
              and technical vocabulary.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleUpgrade} className="flex-1" size="sm">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium Voice
              </Button>
              <Button 
                onClick={() => setShowUpgradePrompt(false)} 
                variant="ghost" 
                size="sm"
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Just $2/month add-on • Cancel anytime • 99% accuracy guaranteed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Voice Input Component */}
      <div className="relative">
        {hasPremiumVoice && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
          >
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
        <VoiceToText
          onTranscript={handleTranscript}
          placeholder={placeholder}
          title={title}
          description={description}
        />
      </div>

      {/* Premium Voice Benefits (for free users) */}
      {!hasPremiumVoice && !showUpgradePrompt && (
        <Card className="bg-accent/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Having issues with voice accuracy?
                </p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Premium Voice for $2/mo — perfect for accents, 
                  multiple languages, and technical vocabulary.
                </p>
                <Button 
                  onClick={handleUpgrade} 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs"
                >
                  Upgrade now →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

