/**
 * 🎤 Floating Microphone Button
 * 
 * A magical, always-visible microphone button that kids can tap
 * to talk to BestTutorEver from anywhere in the app!
 * 
 * Uses browser's Web Speech API (works everywhere, no downloads!)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Sparkles, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';

interface FloatingMicButtonProps {
  className?: string;
}

export function FloatingMicButton({ className }: FloatingMicButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false); // Trigger for auto-submit
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>(''); // Track latest transcript for auto-submit

  // Map routes to page contexts for AI understanding
  const getPageContext = (): string => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/tutor')) return 'Tutor';
    if (pathname.includes('/planner')) return 'Homework Planner';
    if (pathname.includes('/journal')) return 'Learning Journal';
    if (pathname.includes('/summarizer')) return 'Smart Tools';
    if (pathname.includes('/focus')) return 'Stay on Track';
    if (pathname.includes('/learning-path')) return 'Learning Path';
    if (pathname.includes('/parent-dashboard')) return 'Parent Dashboard';
    return 'Tutor'; // Default
  };

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => {
          const updated = prev + finalTranscript;
          transcriptRef.current = updated; // Keep ref in sync
          return updated;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Please allow microphone access! 🎤');
      } else {
        setError('Oops! Try again 🔄');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Trigger auto-submit via state change if we have a transcript
      if (transcriptRef.current.trim().length > 0) {
        // Small delay to ensure UI updates, then trigger auto-submit
        setTimeout(() => {
          setShouldAutoSubmit(true);
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    setTranscript('');
    transcriptRef.current = '';
    setError(null);
    setIsExpanded(true);
    setShouldAutoSubmit(false); // Reset auto-submit flag
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Start error:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Stop error:', err);
    }
    setIsListening(false);
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const submitTranscript = useCallback(() => {
    const text = transcriptRef.current.trim();
    if (!text) return;

    // 1) Try current focused element
    if (injectIntoFocusedField(text)) {
      closePanel();
      return;
    }

    // 2) Try a likely visible text field on the page
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'textarea:not([disabled]), input[type="text"]:not([disabled]), [contenteditable="true"]'
      )
    );
    for (const el of candidates) {
      if (injectIntoFocusedField(text)) {
        closePanel();
        return;
      }
      // Manually focus then insert
      el.focus();
      if (injectIntoFocusedField(text)) {
        closePanel();
        return;
      }
    }

    // 3) Fallback: route to tutor with query and page context
    const encoded = encodeURIComponent(text);
    const context = getPageContext();
    router.push(`/tutor?q=${encoded}&context=${encodeURIComponent(context)}`);
    closePanel();
  }, [router, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit effect - triggered when shouldAutoSubmit becomes true
  useEffect(() => {
    if (shouldAutoSubmit) {
      submitTranscript();
      setShouldAutoSubmit(false); // Reset flag
    }
  }, [shouldAutoSubmit, submitTranscript]);

  const handleSendToTutor = () => {
    submitTranscript();
  };

  const closePanel = () => {
    stopListening();
    setIsExpanded(false);
    setTranscript('');
    transcriptRef.current = '';
    setShouldAutoSubmit(false);
    setError(null);
  };

  const injectIntoFocusedField = (value: string) => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return false;
    if ((el as HTMLInputElement).value !== undefined && (el as HTMLInputElement).setRangeText) {
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.setRangeText(value, start, end, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    if (el.isContentEditable) {
      el.textContent = (el.textContent || '') + value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  };

  // Don't show if not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Expanded panel with transcript */}
      {isExpanded && (
        <div className="absolute bottom-24 right-0 w-80 bg-white dark:bg-gray-900 
                        rounded-3xl shadow-2xl border-4 border-purple-400 p-4 
                        animate-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={closePanel}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 
                       w-8 h-8 flex items-center justify-center rounded-full 
                       hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-600 font-bold">
              <Sparkles className="w-5 h-5" />
              <span>Talk to your tutor!</span>
            </div>
            
            {isListening && (
              <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-semibold">Listening...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}
            
            {transcript && (
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  "{transcript}"
                </p>
              </div>
            )}
            
            {transcript && !isListening && (
              <button
                onClick={handleSendToTutor}
                className="w-full flex items-center justify-center gap-2 
                           bg-gradient-to-r from-purple-500 to-pink-500 
                           text-white font-bold py-3 rounded-xl
                           hover:from-purple-600 hover:to-pink-600 
                           transition-all shadow-lg"
              >
                <Send className="w-4 h-4" />
                Ask My Tutor!
              </button>
            )}
            
            <p className="text-xs text-gray-500 text-center">
              {isListening ? 'Tap the mic when done!' : 'Tap the mic to start talking'}
            </p>
          </div>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={handleMicClick}
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center",
          "shadow-2xl transition-all duration-300 transform",
          "hover:scale-110 active:scale-95",
          isListening 
            ? "bg-gradient-to-br from-red-500 to-pink-600 recording-pulse" 
            : "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 pulse-glow"
        )}
      >
        {/* Sparkle decorations */}
        <span className="absolute -top-1 -left-1 text-2xl">✨</span>
        <span className="absolute -bottom-1 -right-1 text-xl">⭐</span>
        
        {isListening ? (
          <MicOff className="w-10 h-10 text-white drop-shadow-lg" />
        ) : (
          <Mic className="w-10 h-10 text-white drop-shadow-lg" />
        )}
        
        {/* Recording indicator ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping" />
        )}
      </button>

      {/* Helper text */}
      {!isExpanded && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap 
                        bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg 
                        text-sm font-bold text-purple-600 animate-bounce">
          Ask my tutor 🎤
        </div>
      )}
    </div>
  );
}
