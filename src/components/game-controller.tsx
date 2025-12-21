/**
 * 🎮 Nintendo Switch-Style Learning Controller
 * 
 * A full-screen immersive interface for students!
 * LARGE and READABLE for kids to use easily.
 */

'use client';

import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  Mic,
  Sparkles,
  Trophy,
  Calculator,
  TestTube,
  ScrollText,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getEducationalAssistantResponse, getCoachingResponse } from '@/lib/actions';
import { speakNaturally } from '@/lib/natural-speech';
import { ControllerPlanDisplay } from './controller-plan-display';
import { 
  playClick, 
  playConfirm, 
  playListeningStart, 
  playListeningStop,
  playSuccess,
} from '@/lib/audio-feedback';
import { 
  SubjectContext,
  applyGuardrails,
  buildContext,
  SUBJECT_CONFIG,
} from '@/ai/behavior-control';
import { useBehaviorFlags } from '@/hooks/use-behavior-flags';
import { useProgressiveEnhancement, triggerHaptic } from '@/hooks/use-progressive-enhancement';
import { getAgeOptimizations } from '@/config/age-optimizations';
import { useAuth } from '@/context/auth-context';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface PlanTask {
  task: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  subject?: string;
}

// Quick subject options for plan creation
const QUICK_SUBJECTS = [
  { id: 'math', label: '📐 Math', icon: '📐' },
  { id: 'science', label: '🔬 Science', icon: '🔬' },
  { id: 'reading', label: '📖 Reading', icon: '📖' },
  { id: 'history', label: '🏛️ History', icon: '🏛️' },
  { id: 'writing', label: '✍️ Writing', icon: '✍️' },
  { id: 'other', label: '📚 Other', icon: '📚' },
];

interface GameControllerProps {
  children?: ReactNode;
  className?: string;
  onVoiceTranscript?: (text: string) => void;
  onSubjectChange?: (subject: string) => void;
  plan?: PlanTask[];
  onStartQuest?: () => void;
  onTaskComplete?: (taskIndex: number) => void;
}

export function GameController({ children, className, onVoiceTranscript, onSubjectChange, plan, onStartQuest, onTaskComplete }: GameControllerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectContext>('general');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, isTyping?: boolean}>>([]);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [announcement, setAnnouncement] = useState<string>(''); // For screen readers
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  
  // 📋 INTERNAL PLAN STATE - Allow students to create plans in-controller
  const [internalPlan, setInternalPlan] = useState<PlanTask[]>([]);
  const [showPlanSetup, setShowPlanSetup] = useState(false);
  const [planSubjects, setPlanSubjects] = useState<string[]>([]);
  const [planTopics, setPlanTopics] = useState<Record<string, string>>({});
  const [planDuration, setPlanDuration] = useState<Record<string, number>>({});
  
  // Use internal plan if no external plan provided
  const activePlan = plan && plan.length > 0 ? plan : internalPlan;
  
  // 🎤 REACT-SPEECH-RECOGNITION HOOK - Much more reliable than raw Web Speech API
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();
  
  // Track if we have an unprocessed transcript
  const lastProcessedTranscript = useRef<string>('');
  
  // Track the 2-second buffer after button release
  const [isInBufferPeriod, setIsInBufferPeriod] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // 🧠 COACHING MODE - Toggle between tutor mode and executive function coaching
  const [isCoachingMode, setIsCoachingMode] = useState(false);
  const [coachingSession, setCoachingSession] = useState<{
    confidenceLevel?: number;
    focusGoal?: string;
    sessionStartTime?: Date;
  }>({});
  
  // 🎯 BEHAVIOR FLAGS - Loaded from Parent Settings!
  const { behaviorFlags, setBehaviorFlags } = useBehaviorFlags();
  
  // 🎨 PROGRESSIVE ENHANCEMENT - Respect user preferences!
  const capabilities = useProgressiveEnhancement();
  
  // 🎂 AGE-BASED OPTIMIZATIONS - Adapt to student's age
  const ageOptimizations = getAgeOptimizations(behaviorFlags.gradeLevel);
  const hasPremiumVoice = user?.premium_voice_enabled === true;

  // Mic permission status (best-effort; some browsers don’t support Permissions API for mic)
  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const perms = (navigator as any).permissions;
        if (!perms?.query) return;
        const status = await perms.query({ name: 'microphone' });
        if (cancelled) return;
        setMicPermission(status.state === 'granted' ? 'granted' : status.state === 'denied' ? 'denied' : 'unknown');
        status.onchange = () => {
          setMicPermission(status.state === 'granted' ? 'granted' : status.state === 'denied' ? 'denied' : 'unknown');
        };
      } catch {
        // ignore
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      setAnnouncement('Microphone enabled');
    } catch (e) {
      console.error('Mic permission request failed:', e);
      setMicPermission('denied');
      setAnnouncement('Microphone blocked');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I can't hear you yet—please allow microphone access in your browser, then try again.",
        },
      ]);
    }
  }, []);

  // Keep latest values in refs to avoid stale closures inside speech callbacks
  const coachingModeRef = useRef(isCoachingMode);
  const messagesRef = useRef(messages);
  const coachingSessionRef = useRef(coachingSession);
  const selectedSubjectRef = useRef(selectedSubject);
  const uploadedImageRef = useRef(uploadedImage);
  const behaviorFlagsRef = useRef(behaviorFlags);
  const handleTranscriptRef = useRef<(transcript: string) => Promise<void>>();

  useEffect(() => { coachingModeRef.current = isCoachingMode; }, [isCoachingMode]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { coachingSessionRef.current = coachingSession; }, [coachingSession]);
  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { uploadedImageRef.current = uploadedImage; }, [uploadedImage]);
  useEffect(() => { behaviorFlagsRef.current = behaviorFlags; }, [behaviorFlags]);

  const handleTranscript = useCallback(async (transcriptRaw: string) => {
    const transcript = (transcriptRaw || '').trim();
    console.log('[handleTranscript] Called with:', transcript);
    if (!transcript) {
      console.log('[handleTranscript] Empty transcript, ignoring');
      return;
    }

    // Add user message to chat
    console.log('[handleTranscript] Adding user message to chat');
    setMessages(prev => [...prev, { role: 'user', content: transcript }]);

    // 🎯 Choose AI mode: Coaching or Tutoring
    setIsAIResponding(true);
    try {
      let aiMessage = '';

      const isCoach = coachingModeRef.current;
      console.log('[handleTranscript] Mode:', isCoach ? 'COACHING' : 'TUTOR');
      const conversationHistory = messagesRef.current.slice(-6); // last 3 exchanges

      if (isCoach) {
        // 🧠 COACHING MODE
        console.log('[handleTranscript] Calling getCoachingResponse...');
        const response = await getCoachingResponse({
          studentQuestion: transcript,
          conversationHistory,
          sessionContext: {
            confidenceLevel: coachingSessionRef.current.confidenceLevel,
            focusGoal: coachingSessionRef.current.focusGoal,
            subject: selectedSubjectRef.current,
          },
        });

        console.log('[handleTranscript] Coaching response:', response);
        if (response.success && response.data) {
          aiMessage = response.data.coachResponse;

          // Extract confidence level if mentioned (e.g., "I'm at a 5")
          const confidenceMatch = transcript.match(/(\d+)\s*(?:\/10|out of 10)?/i);
          if (confidenceMatch) {
            const level = parseInt(confidenceMatch[1]);
            if (level >= 1 && level <= 10) {
              setCoachingSession(prev => ({ ...prev, confidenceLevel: level }));
            }
          }
        }
      } else {
        // 📚 TUTOR MODE
        console.log('[handleTranscript] Calling getEducationalAssistantResponse...');
        const response = await getEducationalAssistantResponse({
          subject: behaviorFlagsRef.current.subject,
          studentQuestion: transcript,
          homeworkImage: uploadedImageRef.current || undefined,
          // Context flags for adaptive behavior
          mode: 'deep', // Always use deep mode for controller (voice + screen)
          grade: user?.grade_level || undefined,
          confidenceLevel: 'low', // Default to low for more support
          efNeeds: ['planning', 'checking work'], // Default EF support
        });

        console.log('[handleTranscript] Tutor response:', response);
        if (response.success && response.data) {
          aiMessage = response.data.tutorResponse;

          // Clear uploaded image after processing
          if (uploadedImageRef.current) {
            setUploadedImage(null);
            playSuccess();
          }
        } else if (!response.success) {
          console.error('[handleTranscript] Tutor response failed:', response.error);
        }
      }

      if (aiMessage) {
        console.log('[handleTranscript] Got AI message, applying guardrails...');
        const { response: safeResponse, warnings } = applyGuardrails(aiMessage, behaviorFlagsRef.current);
        if (warnings.length > 0) console.log('[Behavior Control]', warnings);
        console.log('[handleTranscript] Adding AI message to chat');
        setMessages(prev => [...prev, { role: 'assistant', content: safeResponse }]);
        console.log('[handleTranscript] Speaking response...');
        await speakNaturally(safeResponse, 'question');
      } else {
        console.warn('[handleTranscript] No AI message received');
      }
    } catch (error) {
      console.error('[handleTranscript] Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I didn't catch that. Could you try again?" }]);
    } finally {
      setIsAIResponding(false);
    }

    // Optional callback (dashboard uses this only to show "You said: ...")
    onVoiceTranscript?.(transcript);
  }, []); // Empty dependencies - use refs for all state

  // Keep handleTranscript ref updated
  useEffect(() => {
    handleTranscriptRef.current = handleTranscript;
  }, [handleTranscript]);
  
  // Override modality and verbosity for controller mode
  useEffect(() => {
    setBehaviorFlags(prev => ({
      ...prev,
      modality: 'voice', // Always voice in controller mode
      verbosity: 'short', // Kids need concise responses
    }));
  }, []);

  // 🎤 REACT-SPEECH-RECOGNITION: Process transcript when listening stops
  useEffect(() => {
    // When listening stops and we have a new transcript, process it
    // ONLY process if we're not in the buffer period (to avoid duplicate processing)
    if (!listening && !isInBufferPeriod && transcript && transcript !== lastProcessedTranscript.current) {
      console.log('[Speech] Got transcript:', transcript);
      lastProcessedTranscript.current = transcript;
      setIsRecording(false);
      
      // Process the transcript through our AI handler
      if (handleTranscriptRef.current) {
        console.log('[Speech] Processing transcript once...');
        handleTranscriptRef.current(transcript);
      }
      
      // Reset for next recording
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript, isInBufferPeriod]);

  // Sync isRecording with listening state
  useEffect(() => {
    if (listening !== isRecording) {
      setIsRecording(listening);
    }
  }, [listening, isRecording]);

  // Push-to-talk handlers with audio + haptic feedback
  const startRecording = useCallback(() => {
    console.log('[Big TALK] startRecording called, browserSupport:', browserSupportsSpeechRecognition, 'listening:', listening);
    
    // Primary: react-speech-recognition (wraps Web Speech API)
    if (browserSupportsSpeechRecognition && !listening) {
      try {
        console.log('[Big TALK] Starting speech recognition via react-speech-recognition...');
        
        // Cancel any pending delayed stop from previous recording
        if (stopDelayRef.current) {
          clearTimeout(stopDelayRef.current);
          stopDelayRef.current = null;
        }
        
        // Reset previous transcript before starting new recording
        resetTranscript();
        lastProcessedTranscript.current = '';
        
        // Start listening
        SpeechRecognition.startListening({ 
          continuous: false,
          language: 'en-US' 
        });
        
        setIsRecording(true);
        if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) playListeningStart();
        triggerHaptic(capabilities, [10, 50, 30]);
        setAnnouncement('Listening for your question');
        console.log('[Big TALK] Speech recognition STARTED');
        
      } catch (e: any) { 
        console.error('[Big TALK] Failed to start recognition:', e);
        setIsRecording(false);
      }
      return;
    }

    // Fallback: Premium Voice ONLY (when Web Speech isn't available)
    if (!browserSupportsSpeechRecognition && hasPremiumVoice && !isRecording) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined,
          } as any);

          audioChunksRef.current = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start(250);
          setIsRecording(true);
          if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) playListeningStart();
          triggerHaptic(capabilities, [10, 50, 30]);
          setAnnouncement('Recording…');
        } catch (e) {
          console.error('Premium voice recording failed:', e);
          setAnnouncement('Microphone not available');
        }
      })();
      return;
    }

    // No supported voice path
    if (!browserSupportsSpeechRecognition) {
      setAnnouncement('Voice input is not supported in this browser');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, your browser doesn't support voice input. Try Chrome, Edge, or Safari."
      }]);
    }
  }, [listening, browserSupportsSpeechRecognition, isRecording, capabilities, resetTranscript, hasPremiumVoice, ageOptimizations.audioEnabled]);

  // Ref to track delayed stop timeout
  const stopDelayRef = useRef<NodeJS.Timeout | null>(null);
  
  const stopRecording = useCallback(() => {
    console.log('[Big TALK] stopRecording called, listening:', listening);
    
    // Primary: react-speech-recognition - wait 2 seconds after release to capture trailing words
    if (listening) {
      // Clear any existing delayed stop
      if (stopDelayRef.current) {
        clearTimeout(stopDelayRef.current);
      }
      
      console.log('[Big TALK] Waiting 2 seconds to capture trailing speech...');
      setAnnouncement('Still listening... keep talking!');
      setIsInBufferPeriod(true);
      
      // Delay stop by 2 seconds to capture end of sentence
      stopDelayRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
        console.log('[Big TALK] Speech recognition STOPPED (after 2s delay)');
        setIsInBufferPeriod(false);
        
        // Audio feedback (if supported and enabled for age)
        if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
          playListeningStop(); // 🔊 Falling tone
        }
        
        // Haptic feedback (stop pattern: long-short)
        triggerHaptic(capabilities, [30, 50, 10]);
        
        // Screen reader announcement
        setAnnouncement('Processing your question');
        
        stopDelayRef.current = null;
      }, 2000); // 2 second delay
      
      return; // Don't do immediate feedback yet
    }
    // Fallback: Premium Voice ONLY (when Web Speech isn't available)
    if (!browserSupportsSpeechRecognition && hasPremiumVoice && isRecording && mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      setIsRecording(false);
      if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) playListeningStop();
      triggerHaptic(capabilities, [30, 50, 10]);
      setAnnouncement('Transcribing…');

      recorder.onstop = async () => {
        try {
          recorder.stream.getTracks().forEach(t => t.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          if (audioBlob.size < 1000) {
            setAnnouncement('Recording too short');
            return;
          }

          const form = new FormData();
          form.append('audio', new File([audioBlob], 'audio.webm', { type: audioBlob.type }));
          form.append('language', 'en');

          const res = await fetch('/api/voice/transcribe-premium', { method: 'POST', body: form });
          if (!res.ok) throw new Error('Transcription failed');
          const data = await res.json();
          const text = (data.text || '').toString();
          setAnnouncement('Processing your question');
          if (handleTranscriptRef.current) {
            handleTranscriptRef.current(text);
          }
        } catch (e) {
          console.error('Premium transcription failed:', e);
          setAnnouncement('Could not transcribe. Try again.');
        }
      };

      try { recorder.stop(); } catch {}
    }
  }, [listening, isRecording, capabilities, browserSupportsSpeechRecognition, hasPremiumVoice, ageOptimizations.audioEnabled]);

  // Button press animation with audio + haptic feedback
  const handleButtonPress = (name: string, action: () => void) => {
    setActiveButton(name);
    
    // Audio feedback (only if supported, enabled for age, and not muted)
    if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
      playClick(); // 🔊 Soft click sound
    }
    
    // Haptic feedback (mobile)
    triggerHaptic(capabilities, 10); // Light tap
    
    action();
    
    // Reset animation (respect reduced motion)
    const duration = capabilities.prefersReducedMotion ? 0 : 150;
    setTimeout(() => setActiveButton(null), duration);
  };

  // Subject selection handler - Updates behavior flags (NOT prompts!)
  const handleSubjectChange = useCallback((subject: SubjectContext) => {
    setSelectedSubject(subject);
    
    // Update behavior flags
    setBehaviorFlags(prev => ({
      ...prev,
      subject: subject,
    }));
    
    onSubjectChange?.(subject);
    
    // Audio feedback for subject change (if supported and enabled for age)
    if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
      playConfirm(); // 🔊 Pleasant confirmation sound
    }
    
    // Haptic feedback (double tap for confirmation)
    triggerHaptic(capabilities, [15, 30, 15]);
    
    // Screen reader announcement
    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    setAnnouncement(`${subjectName} subject selected`);
    
    // Visual feedback
    const config = SUBJECT_CONFIG[subject];
    console.log(`[Subject Change] ${subject} (${config.color})`);
  }, [setBehaviorFlags, onSubjectChange, capabilities]);

  // 📋 PASTE IMAGE - Ctrl+V to paste images from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setUploadedImage(dataUrl);
              playConfirm(); // 🔊 Confirmation sound
              setAnnouncement('Image pasted! Press talk button to ask about it.');
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // 🖼️ DRAG AND DROP - Drag images into the controller
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedImage(dataUrl);
        playConfirm(); // 🔊 Confirmation sound
        setAnnouncement('Image dropped! Press talk button to ask about it.');
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  // ⌨️ KEYBOARD NAVIGATION - D-pad works with arrow keys!
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleSubjectChange('math');
          if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
            playClick();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSubjectChange('science');
          if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
            playClick();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSubjectChange('reading');
          if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
            playClick();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSubjectChange('history');
          if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
            playClick();
          }
          break;
        case ' ':
        case 'Enter':
          // Spacebar or Enter = Push-to-talk
          if (!isRecording && e.type === 'keydown') {
            e.preventDefault();
            startRecording();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, handleSubjectChange, startRecording, stopRecording, capabilities, ageOptimizations]);

  return (
    <main 
      className={cn("w-full h-screen flex items-center justify-center p-2 md:p-4 relative overflow-hidden", className)}
      role="application"
      aria-label="BestTutorEver Learning Controller"
    >
      {/* 🔊 SCREEN READER ANNOUNCEMENTS */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* ⛏️ MINECRAFT BACKGROUND */}
      <div className="absolute inset-0 minecraft-bg" aria-hidden="true" />
      
      {/* Floating Minecraft particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Nintendo Switch Body - Responsive */}
      <div className="relative w-full h-full flex items-stretch max-w-[1800px] max-h-[900px] z-10">
        
        {/* ==================== LEFT JOY-CON (Diamond Ore Blue) ==================== */}
        <div className="relative w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] flex-shrink-0">
          {/* Joy-Con Shell - Diamond Ore inspired */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-300 via-cyan-500 to-cyan-700 rounded-l-[4rem] shadow-2xl border-4 border-cyan-800">
            {/* Pixelated texture overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 16px),
                               repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 16px)`,
              borderRadius: 'inherit'
            }} />
            {/* Rail */}
            <div className="absolute right-0 top-12 bottom-12 w-2 bg-black/50 rounded-full" />
          </div>
          
          {/* Joy-Con Controls */}
          <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 md:py-12 px-6">
            
            {/* Parent Portal Button (top minus button) */}
            <button
              onClick={() => handleButtonPress('parent-portal', () => router.push('/parent-dashboard'))}
              className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity"
              aria-label="Parent Portal"
              title="Parent Portal"
            >
              <div className="w-10 h-3 bg-slate-800 rounded-full shadow-lg" />
              <span className="text-[11px] sm:text-xs md:text-sm text-white font-black tracking-wide">
                PORTAL
              </span>
            </button>
            
            {/* Analog Stick */}
            <div 
              className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-900 rounded-full shadow-xl border-[3px] border-slate-700 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full shadow-inner" />
            </div>
            
            {/* ===== D-PAD SUBJECT SELECTION ===== */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 my-2 md:my-4">
              {/* D-Pad Cross Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 sm:w-12 md:w-14 h-full bg-slate-800 rounded-lg shadow-xl" />
                <div className="absolute w-full h-10 sm:h-12 md:h-14 bg-slate-800 rounded-lg shadow-xl" />
              </div>

              {/* Up - Math */}
              <button
                onClick={() => handleButtonPress('up', () => handleSubjectChange('math'))}
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex flex-col items-center justify-center transition-all rounded-t-lg",
                  activeButton === 'up' ? 'scale-90 bg-blue-600' : 'hover:bg-slate-700',
                  selectedSubject === 'math' && 'ring-2 ring-blue-400 bg-blue-700'
                )}
                title="Math Subject"
              >
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Down - Science */}
              <button
                onClick={() => handleButtonPress('down', () => handleSubjectChange('science'))}
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex flex-col items-center justify-center transition-all rounded-b-lg",
                  activeButton === 'down' ? 'scale-90 bg-green-600' : 'hover:bg-slate-700',
                  selectedSubject === 'science' && 'ring-2 ring-green-400 bg-green-700'
                )}
                title="Science Subject"
              >
                <TestTube className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Left - Reading */}
              <button
                onClick={() => handleButtonPress('left', () => handleSubjectChange('reading'))}
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex flex-col items-center justify-center transition-all rounded-l-lg",
                  activeButton === 'left' ? 'scale-90 bg-purple-600' : 'hover:bg-slate-700',
                  selectedSubject === 'reading' && 'ring-2 ring-purple-400 bg-purple-700'
                )}
                title="Reading Subject"
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Right - History */}
              <button
                onClick={() => handleButtonPress('right', () => handleSubjectChange('history'))}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex flex-col items-center justify-center transition-all rounded-r-lg",
                  activeButton === 'right' ? 'scale-90 bg-orange-600' : 'hover:bg-slate-700',
                  selectedSubject === 'history' && 'ring-2 ring-orange-400 bg-orange-700'
                )}
                title="History Subject"
              >
                <ScrollText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* D-Pad Labels - Clear Subject Names */}
            <div className="mt-2 text-sm sm:text-base md:text-lg text-white/90 text-center font-black tracking-wide space-y-1">
              <div className={cn("transition-colors", selectedSubject === 'math' && 'text-blue-300')}>↑ MATH</div>
              <div className={cn("transition-colors", selectedSubject === 'science' && 'text-green-300')}>↓ SCIENCE</div>
              <div className={cn("transition-colors", selectedSubject === 'reading' && 'text-purple-300')}>← READING</div>
              <div className={cn("transition-colors", selectedSubject === 'history' && 'text-orange-300')}>→ HISTORY</div>
            </div>

            {/* ===== MODE TOGGLE BUTTONS ===== */}
            <div className="flex flex-col gap-3">
              {/* Coaching Mode Toggle */}
              <button
                onClick={() => {
                  handleButtonPress('coaching', () => {
                    setIsCoachingMode(!isCoachingMode);
                    if (!isCoachingMode) {
                      // Entering coaching mode
                      setCoachingSession({ sessionStartTime: new Date() });
                      setMessages([]);
                      playConfirm();
                      setAnnouncement('Coaching mode activated. I\'m here to help you build executive function skills!');
                    } else {
                      // Exiting coaching mode
                      setCoachingSession({});
                      playClick();
                      setAnnouncement('Tutor mode activated. Let\'s learn together!');
                    }
                  });
                }}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg flex flex-col items-center justify-center transition-all border-4",
                  isCoachingMode
                    ? "bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-200 ring-4 ring-cyan-300"
                    : activeButton === 'coaching'
                    ? "bg-gradient-to-br from-slate-500 to-slate-700 border-slate-300 scale-95"
                    : "bg-gradient-to-br from-slate-600 to-slate-800 border-slate-400 hover:from-slate-500 hover:to-slate-700 hover:scale-105"
                )}
                title={isCoachingMode ? "Coaching Mode Active" : "Switch to Coaching Mode"}
                aria-label={isCoachingMode ? "Coaching mode active, click to switch to tutor mode" : "Click to switch to coaching mode"}
              >
                <Brain className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
                  isCoachingMode ? "text-white animate-pulse" : "text-white"
                )} />
                <span className={cn(
                  "text-[10px] sm:text-[11px] md:text-xs font-black mt-1 tracking-wide",
                  isCoachingMode ? "text-white" : "text-white/80"
                )}>
                  {isCoachingMode ? "COACH" : "COACH"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== CENTER SCREEN ==================== */}
        <div 
          className="flex-1 relative bg-[#1a1a1a] border-y-8 border-[#2a2a2a]"
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Screen Display - Clean gradient */}
          <div className={cn(
            "absolute inset-0 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900",
            isDragging && "ring-4 ring-blue-500 ring-inset"
          )}>
            
            {/* 📸 IMAGE DROP ZONE OVERLAY */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center max-w-sm">
                  <div className="text-6xl mb-4">📸</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-2">
                    Drop Image Here!
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    I'll help you with your homework
                  </div>
                </div>
              </div>
            )}

            {/* 🖼️ UPLOADED IMAGE PREVIEW */}
            {uploadedImage && !isDragging && (
              <div className="absolute top-4 right-4 z-40">
                <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-2 border-4 border-green-500">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded homework" 
                    className="w-32 h-32 object-contain rounded"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      playClick();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                  <div className="text-[10px] text-green-600 dark:text-green-400 font-bold text-center mt-1">
                    📸 Ready!
                  </div>
                </div>
              </div>
            )}
            
            {/* Screen Content - Always show chatbox */}
            <div className="h-full flex flex-col pb-16">
              {activePlan && activePlan.length > 0 ? (
                <ControllerPlanDisplay
                  plan={activePlan}
                  onStartQuest={onStartQuest}
                  onTaskComplete={(idx) => {
                    onTaskComplete?.(idx);
                    // Update internal plan if using it
                    if (!plan || plan.length === 0) {
                      setInternalPlan(prev => prev.map((t, i) => 
                        i === idx ? { ...t, completed: true } : t
                      ));
                    }
                  }}
                />
              ) : showPlanSetup ? (
                /* 📋 QUICK PLAN SETUP */
                <div className="p-4 space-y-4 overflow-y-auto">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-purple-600">📋 Let's Make a Plan!</h2>
                    <p className="text-sm text-muted-foreground">What are you studying today?</p>
                  </div>
                  
                  {/* Subject Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_SUBJECTS.map(subject => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          if (planSubjects.includes(subject.id)) {
                            setPlanSubjects(prev => prev.filter(s => s !== subject.id));
                          } else {
                            setPlanSubjects(prev => [...prev, subject.id]);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-xl font-bold text-sm transition-all",
                          planSubjects.includes(subject.id)
                            ? "bg-purple-500 text-white shadow-lg scale-105"
                            : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                      >
                        <div className="text-2xl mb-1">{subject.icon}</div>
                        {subject.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                  
                  {/* Topic & Duration for each selected subject */}
                  {planSubjects.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {planSubjects.map(subjectId => {
                        const subject = QUICK_SUBJECTS.find(s => s.id === subjectId);
                        return (
                          <div key={subjectId} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{subject?.icon}</span>
                              <span className="font-bold">{subject?.label.split(' ')[1]}</span>
                            </div>
                            <input
                              type="text"
                              placeholder="What are you working on?"
                              value={planTopics[subjectId] || ''}
                              onChange={(e) => setPlanTopics(prev => ({ ...prev, [subjectId]: e.target.value }))}
                              className="w-full p-2 rounded-lg border text-sm mb-2"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Time:</span>
                              <select
                                value={planDuration[subjectId] || 30}
                                onChange={(e) => setPlanDuration(prev => ({ ...prev, [subjectId]: parseInt(e.target.value) }))}
                                className="p-2 rounded-lg border text-sm"
                              >
                                <option value={15}>15 min</option>
                                <option value={20}>20 min</option>
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>1 hour</option>
                                <option value={90}>1.5 hours</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Create Plan Button */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowPlanSetup(false)}
                      className="flex-1 py-3 px-6 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Create the plan
                        const newPlan: PlanTask[] = planSubjects.map(subjectId => ({
                          task: planTopics[subjectId] || `${QUICK_SUBJECTS.find(s => s.id === subjectId)?.label.split(' ')[1]} homework`,
                          subject: subjectId,
                          estimatedTime: planDuration[subjectId] || 30,
                          difficulty: 'medium' as const,
                          completed: false,
                        }));
                        setInternalPlan(newPlan);
                        setShowPlanSetup(false);
                        // Reset form
                        setPlanSubjects([]);
                        setPlanTopics({});
                        setPlanDuration({});
                      }}
                      disabled={planSubjects.length === 0}
                      className={cn(
                        "flex-1 py-3 px-6 rounded-xl font-bold text-white transition-all",
                        planSubjects.length > 0
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          : "bg-gray-400 cursor-not-allowed"
                      )}
                    >
                      🎸 Let's Go!
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quick Action Cards - Compact row at top */}
                  <div className="flex gap-2 p-3 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => router.push('/tutor')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>My Coach</span>
                    </button>
                    <button
                      onClick={() => router.push('/progress')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>My Journey</span>
                    </button>
                    <button
                      onClick={() => router.push('/summarizer')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Smart Tools</span>
                    </button>
                    <button
                      onClick={() => router.push('/test-generator')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Practice Test</span>
                    </button>
                  </div>
                  
                  {/* 💬 CHATBOX AREA - Always visible */}
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {messages.length > 0 ? (
                        <div className="space-y-3">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={cn(
                                "flex",
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[85%] p-4 rounded-2xl text-base shadow-md",
                                  message.role === 'user'
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
                                    : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-bl-sm'
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                                  <p className="leading-relaxed">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {isAIResponding && (
                            <div className="flex justify-start">
                              <div className="bg-gradient-to-br from-slate-600 to-slate-700 text-white p-4 rounded-2xl rounded-bl-sm shadow-md">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">🤖</span>
                                  <div className="flex gap-1">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                  <span className="text-sm opacity-80">Claude is thinking...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Empty state - Ready to Talk OR Create Plan */
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                          {/* CREATE STUDY PLAN - Primary CTA */}
                          <button
                            onClick={() => setShowPlanSetup(true)}
                            className="border-4 border-dashed border-green-400 dark:border-green-600 rounded-3xl p-6 max-w-lg text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                          >
                            <div className="text-5xl mb-3">📋</div>
                            <h3 className="text-xl font-black text-green-700 dark:text-green-300 mb-2">
                              Create Your Study Plan
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Pick your subjects, set your time, and let's <span className="font-black">ROCK N ROLL!</span>
                            </p>
                          </button>
                          
                          {/* OR TALK - Secondary option */}
                          <div className="border-4 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 max-w-lg text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                            <div className="text-4xl mb-2">🎤</div>
                            <h3 className="text-lg font-black text-purple-700 dark:text-purple-300 mb-1">
                              Or Just Ask Me!
                            </h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mb-3">
                              Hold the <span className="text-red-500 font-black">big red TALK button</span>
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center text-xs">
                              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-full font-semibold text-slate-600 dark:text-slate-400">
                                "Help me with math"
                              </span>
                              <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-full font-semibold text-slate-600 dark:text-slate-400">
                                "Quiz me on science"
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Live transcript display while speaking */}
                    {(listening || transcript) && (
                      <div className="px-4 pb-4">
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/50 dark:to-pink-900/50 border-2 border-red-300 dark:border-red-600 rounded-2xl p-4 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded-full",
                              listening ? "bg-red-500 animate-pulse" : "bg-gray-400"
                            )} />
                            <span className="font-bold text-red-700 dark:text-red-300">
                              {listening ? '🎤 Listening...' : '✅ Got it!'}
                            </span>
                          </div>
                          {transcript && (
                            <p className="mt-2 text-lg font-medium text-slate-800 dark:text-slate-200 italic">
                              "{transcript}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 text-white px-6 py-3 flex justify-between items-center text-sm md:text-base font-mono">
              <div className="flex items-center gap-3">
                {isCoachingMode ? (
                  <>
                    <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span className="font-black text-cyan-400 text-base md:text-lg">EXECUTIVE FUNCTION COACH</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="font-black text-base md:text-lg">BEST TUTOR EVER</span>
                  </>
                )}
                <div className="flex items-center gap-2 ml-4">
                  {!isCoachingMode && (
                    <>
                      <span className="text-sm md:text-base font-black text-slate-200 tracking-wide">SUBJECT:</span>
                      <span className={cn(
                        "font-black text-sm md:text-base px-2 py-1 rounded tracking-wide",
                        selectedSubject === 'math' && 'bg-blue-600',
                        selectedSubject === 'science' && 'bg-green-600',
                        selectedSubject === 'reading' && 'bg-purple-600',
                        selectedSubject === 'history' && 'bg-orange-600'
                      )}>
                        {selectedSubject.toUpperCase()}
                      </span>
                    </>
                  )}
                  {isCoachingMode && coachingSession.confidenceLevel && (
                    <>
                      <span className="text-sm md:text-base font-black text-slate-200 tracking-wide">CONFIDENCE:</span>
                      <span className="font-black text-sm md:text-base px-2 py-1 rounded bg-cyan-600 tracking-wide">
                        {coachingSession.confidenceLevel}/10
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Mic status + quick fix */}
                {!browserSupportsSpeechRecognition && (
                  <div className="text-xs md:text-sm font-black text-yellow-300">NO SPEECH API</div>
                )}
                {browserSupportsSpeechRecognition && !isMicrophoneAvailable && (
                  <button
                    onClick={requestMicPermission}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-xs md:text-sm font-black"
                    title="Click to request microphone permission"
                  >
                    MIC BLOCKED — FIX
                  </button>
                )}
                {browserSupportsSpeechRecognition && isMicrophoneAvailable && (
                  <div className="text-xs md:text-sm font-black text-green-300">MIC OK</div>
                )}
                {isRecording && !isInBufferPeriod && (
                  <div className="flex items-center gap-2 text-red-400 animate-pulse font-black text-base md:text-lg">
                    <Mic className="w-5 h-5" />
                    <span>LISTENING...</span>
                  </div>
                )}
                {isInBufferPeriod && (
                  <div className="flex items-center gap-2 text-yellow-400 animate-pulse font-black text-base md:text-lg">
                    <Mic className="w-5 h-5" />
                    <span>KEEP TALKING... 2s</span>
                  </div>
                )}
                {isAIResponding && (
                  <div className="flex items-center gap-2 text-blue-400 font-black text-base md:text-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full thinking-dot" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full thinking-dot" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full thinking-dot" />
                    </div>
                    <span>AI THINKING...</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="font-black text-sm md:text-base">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT JOY-CON (Redstone/Lava) ==================== */}
        <div className="relative w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] flex-shrink-0">
          {/* Joy-Con Shell - Redstone inspired */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-400 via-red-600 to-red-800 rounded-r-[4rem] shadow-2xl border-4 border-red-900">
            {/* Pixelated texture overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 16px),
                               repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 16px)`,
              borderRadius: 'inherit'
            }} />
            {/* Glowing redstone effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-transparent to-red-900/30 rounded-r-[4rem] animate-pulse" style={{ animationDuration: '3s' }} />
            {/* Rail */}
            <div className="absolute left-0 top-12 bottom-12 w-2 bg-black/50 rounded-full" />
          </div>
          
          {/* Joy-Con Controls */}
          <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 md:py-12 px-6">

            {/* Admin Button (top minus button - exact copy of PORTAL button) */}
            <button
              onClick={() => handleButtonPress('admin', () => router.push('/parent-settings'))}
              className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity"
              aria-label="Admin"
              title="Admin"
            >
              <div className="w-10 h-3 bg-slate-800 rounded-full shadow-lg" />
              <span className="text-[11px] sm:text-xs md:text-sm text-white font-black tracking-wide">
                ADMIN
              </span>
            </button>

            
            {/* ===== BIG RED TALK BUTTON ===== */}
            <div className="relative my-4 md:my-6">
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  console.log('[BIG TALK BUTTON] Pointer down - calling startRecording()');
                  startRecording();
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  console.log('[BIG TALK BUTTON] Pointer up - calling stopRecording()');
                  stopRecording();
                }}
                onPointerCancel={(e) => {
                  e.preventDefault();
                  console.log('[BIG TALK BUTTON] Pointer cancel - calling stopRecording()');
                  stopRecording();
                }}
                className={cn(
                  // Add extra padding for "sticky" touch area
                  "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-150 border-[6px] md:border-8",
                  // Extra invisible touch zone
                  "before:absolute before:inset-[-20px] before:rounded-full before:content-['']",
                  isRecording
                    ? "bg-gradient-to-br from-red-400 to-red-600 border-white scale-95 animate-pulse"
                    : "bg-gradient-to-br from-red-500 to-red-700 border-red-300 hover:from-red-400 hover:to-red-600 hover:scale-105 active:scale-95"
                )}
              >
                <Mic className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white", isRecording && "animate-bounce")} />
                <span className="text-sm sm:text-base md:text-lg text-white font-black mt-1 tracking-wide">
                  {isRecording ? "🎤" : "TALK"}
                </span>
              </button>
              
              {/* Glow effect when recording */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-400/40 animate-ping pointer-events-none" />
              )}
            </div>

            {/* Analog Stick */}
            <div 
              className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-slate-900 rounded-full shadow-xl border-[3px] border-slate-700 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full shadow-inner" />
            </div>
            
            {/* Home Button */}
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors shadow-lg flex items-center justify-center"
              aria-label="Home - Return to dashboard"
            >
              <div className="w-5 h-5 border-2 border-white rounded-full" aria-hidden="true" />
            </button>
            
            {/* Button Labels - Clear Workflow */}
            <div className="mt-4 text-sm sm:text-base md:text-lg text-white/90 text-center font-black tracking-wide space-y-1.5">
              <div className="text-green-200">B = SMART TOOLS</div>
              <div className="text-purple-200">Y = HOMEWORK HELP</div>
              <div className="text-orange-200">A = TEST PRACTICE</div>
              <div className="text-red-300 mt-2 text-base sm:text-lg md:text-xl">🔴 HOLD TO TALK</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
