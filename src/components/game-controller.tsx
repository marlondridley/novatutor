/**
 * 🎮 Nintendo Switch-Style Learning Controller
 * 
 * A full-screen immersive interface for students!
 * LARGE and READABLE for kids to use easily.
 */

'use client';

import { ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import {
  Home,
  BookOpen,
  GraduationCap,
  Settings,
  Mic,
  MessageCircle,
  Sparkles,
  Trophy,
  PenTool,
  Calculator,
  TestTube,
  ScrollText,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getEducationalAssistantResponse } from '@/lib/actions';
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

interface PlanTask {
  task: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
}

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
  const [isRecording, setIsRecording] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectContext>('general');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string, isTyping?: boolean}>>([]);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [announcement, setAnnouncement] = useState<string>(''); // For screen readers
  const recognitionRef = useRef<any>(null);
  
  // 🎯 BEHAVIOR FLAGS - Loaded from Parent Settings!
  const { behaviorFlags, setBehaviorFlags } = useBehaviorFlags();
  
  // 🎨 PROGRESSIVE ENHANCEMENT - Respect user preferences!
  const capabilities = useProgressiveEnhancement();
  
  // 🎂 AGE-BASED OPTIMIZATIONS - Adapt to student's age
  const ageOptimizations = getAgeOptimizations(behaviorFlags.gradeLevel);
  
  // Override modality and verbosity for controller mode
  useEffect(() => {
    setBehaviorFlags(prev => ({
      ...prev,
      modality: 'voice', // Always voice in controller mode
      verbosity: 'short', // Kids need concise responses
    }));
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: transcript }]);

        // 🎯 Use behavior flags (NOT dynamic prompts!)
        setIsAIResponding(true);
        try {
          const response = await getEducationalAssistantResponse({
            subject: behaviorFlags.subject,
            studentQuestion: transcript
          });

          if (response.success && response.data) {
            let aiMessage = response.data.tutorResponse;
            
            // Apply guardrails (post-processing filters, NOT prompt changes!)
            const { response: safeResponse, warnings } = applyGuardrails(aiMessage, behaviorFlags);
            
            // Log warnings for debugging (not shown to user)
            if (warnings.length > 0) {
              console.log('[Behavior Control]', warnings);
            }
            
            setMessages(prev => [...prev, { role: 'assistant', content: safeResponse }]);

            // Speak the response
            await speakNaturally(safeResponse, 'question');
          }
        } catch (error) {
          console.error('AI response error:', error);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I'm sorry, I didn't catch that. Could you try again?"
          }]);
        }
        setIsAIResponding(false);

        onVoiceTranscript?.(transcript);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
    return () => recognitionRef.current?.abort();
  }, [onVoiceTranscript]);

  // Push-to-talk handlers with audio + haptic feedback
  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        
        // Audio feedback (if supported and enabled for age)
        if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
          playListeningStart(); // 🔊 Rising tone
        }
        
        // Haptic feedback (start pattern: short-long)
        triggerHaptic(capabilities, [10, 50, 30]);
        
        // Screen reader announcement
        setAnnouncement('Listening for your question');
      } catch (e) { /* already started */ }
    }
  }, [isRecording, capabilities]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Audio feedback (if supported and enabled for age)
      if (capabilities.hasAudioSupport && ageOptimizations.audioEnabled) {
        playListeningStop(); // 🔊 Falling tone
      }
      
      // Haptic feedback (stop pattern: long-short)
      triggerHaptic(capabilities, [30, 50, 10]);
      
      // Screen reader announcement
      setAnnouncement('Processing your question');
    }
  }, [isRecording, capabilities]);

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
            
            {/* Minus Button */}
            <button 
              className="w-10 h-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors shadow-lg"
              aria-label="Options menu"
            />
            
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
            <div className="mt-2 text-[9px] sm:text-[10px] text-white/90 text-center font-bold space-y-0.5">
              <div className={cn("transition-colors", selectedSubject === 'math' && 'text-blue-300')}>↑ MATH</div>
              <div className={cn("transition-colors", selectedSubject === 'science' && 'text-green-300')}>↓ SCIENCE</div>
              <div className={cn("transition-colors", selectedSubject === 'reading' && 'text-purple-300')}>← READING</div>
              <div className={cn("transition-colors", selectedSubject === 'history' && 'text-orange-300')}>→ HISTORY</div>
            </div>

            {/* ===== ADMINISTRATOR BUTTON ===== */}
            <button
              onClick={() => handleButtonPress('admin', () => router.push('/parent-settings'))}
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-lg flex flex-col items-center justify-center transition-all border-4",
                activeButton === 'admin'
                  ? "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-200 scale-95"
                  : "bg-gradient-to-br from-amber-500 to-amber-700 border-amber-300 hover:from-amber-400 hover:to-amber-600 hover:scale-105"
              )}
              title="Administrator Settings"
            >
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              <span className="text-[8px] sm:text-[9px] text-white font-bold mt-0.5">ADMIN</span>
            </button>
          </div>
        </div>

        {/* ==================== CENTER SCREEN ==================== */}
        <div className="flex-1 relative bg-[#1a1a1a] border-y-8 border-[#2a2a2a]">
          {/* Screen Display - Clean gradient */}
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900">
            
            {/* Screen Content */}
            <div className="h-full overflow-y-auto pb-16">
              {plan && plan.length > 0 ? (
                <ControllerPlanDisplay
                  plan={plan}
                  onStartQuest={onStartQuest}
                  onTaskComplete={onTaskComplete}
                />
              ) : messages.length > 0 ? (
                <div className="p-4 space-y-4">
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
                          "max-w-[80%] p-3 rounded-lg text-sm",
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-white'
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isAIResponding && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-white p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-white rounded-full thinking-dot" />
                            <div className="w-2 h-2 bg-white rounded-full thinking-dot" />
                            <div className="w-2 h-2 bg-white rounded-full thinking-dot" />
                          </div>
                          <span className="text-sm">🤔 Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : children || (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                  <Sparkles className="w-24 h-24 text-purple-500 animate-bounce" />
                  <h2 className="text-4xl md:text-5xl font-black text-purple-700 dark:text-purple-300">
                    Let's Learn Together!
                  </h2>

                  {/* Visual Steps - Kid-Friendly! */}
                  <div className="space-y-6 max-w-2xl">
                    {/* Step 1: Choose Subject */}
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 p-6 rounded-3xl shadow-lg border-4 border-blue-300 dark:border-blue-700">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg">1</div>
                        <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100">Choose Your Subject</h3>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-4xl mb-2">
                        <Calculator className="w-12 h-12 text-blue-600" />
                        <TestTube className="w-12 h-12 text-green-600" />
                        <BookOpen className="w-12 h-12 text-purple-600" />
                        <ScrollText className="w-12 h-12 text-orange-600" />
                      </div>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        👈 Press the blue D-pad buttons
                      </p>
                      <p className="text-xl font-black text-blue-900 dark:text-blue-100 mt-2 bg-white/50 dark:bg-black/20 py-2 px-4 rounded-full">
                        Current: {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
                      </p>
                    </div>

                    {/* Step 2: Talk! */}
                    <div className="bg-gradient-to-r from-red-100 to-pink-50 dark:from-red-900 dark:to-red-950 p-6 rounded-3xl shadow-lg border-4 border-red-300 dark:border-red-700">
                      <div className="flex items-center justify-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg">2</div>
                        <h3 className="text-2xl font-black text-red-900 dark:text-red-100">Hold & Talk!</h3>
                      </div>
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                          <Mic className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-red-800 dark:text-red-200">
                        👉 Hold the BIG RED BUTTON and ask your question!
                      </p>
                    </div>
                  </div>

                  <p className="text-lg text-muted-foreground max-w-lg font-semibold">
                    That's it! I'm here to help you learn 🎓
                  </p>
                </div>
              )}
            </div>
            
            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/95 text-white px-6 py-3 flex justify-between items-center text-sm md:text-base font-mono">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="font-bold">BEST TUTOR EVER</span>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-slate-300">SUBJECT:</span>
                  <span className={cn(
                    "font-bold text-xs px-2 py-1 rounded",
                    selectedSubject === 'math' && 'bg-blue-600',
                    selectedSubject === 'science' && 'bg-green-600',
                    selectedSubject === 'reading' && 'bg-purple-600',
                    selectedSubject === 'history' && 'bg-orange-600'
                  )}>
                    {selectedSubject.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400 animate-pulse font-bold">
                    <Mic className="w-5 h-5" />
                    <span>LISTENING...</span>
                  </div>
                )}
                {isAIResponding && (
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
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
                  <span className="font-bold">READY</span>
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
            
            {/* Admin Button */}
            <button
              onClick={() => handleButtonPress('admin', () => router.push('/parent-dashboard'))}
              className={cn(
                "w-12 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all shadow-lg flex flex-col items-center justify-center border-2 border-slate-600",
                activeButton === 'admin' ? 'scale-90 bg-slate-600' : ''
              )}
              title="Parent Admin Panel"
            >
              <div className="w-6 h-1 bg-white/60 mb-0.5" />
              <div className="w-1 h-4 bg-white/60" />
              <div className="text-[8px] text-white/80 font-bold mt-0.5">ADMIN</div>
            </button>

            {/* ===== ACTION BUTTONS (Core Learning Workflow) ===== */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36">
              {/* X - Talk to Coach (Top) - PRIMARY ACTION */}
              <button
                onClick={() => handleButtonPress('X', () => {
                  // Show coach chat on center screen
                  setMessages([]);
                  // Add welcome message from coach
                  setMessages([{
                    role: 'assistant',
                    content: `Hi! I'm your ${selectedSubject} coach. What would you like to learn today? Let's start by planning your homework together! 📚`
                  }]);
                })}
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-500 rounded-full shadow-xl flex flex-col items-center justify-center border-[3px] border-blue-400 transition-all",
                  activeButton === 'X' ? 'scale-90 bg-blue-700' : ''
                )}
                title="Talk to Your Coach"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-[8px] sm:text-[10px] text-white font-bold">X</span>
              </button>

              {/* B - My Plan (Bottom) */}
              <button
                onClick={() => handleButtonPress('B', () => router.push('/learning-path'))}
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-600 hover:bg-green-500 rounded-full shadow-xl flex flex-col items-center justify-center border-[3px] border-green-400 transition-all",
                  activeButton === 'B' ? 'scale-90 bg-green-700' : ''
                )}
                title="View My Learning Plan"
              >
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-[8px] sm:text-[10px] text-white font-bold">B</span>
              </button>

              {/* Y - Homework Help (Left) */}
              <button
                onClick={() => handleButtonPress('Y', () => {
                  if (messages.length === 0) {
                    // Prompt to talk to coach first
                    setMessages([{
                      role: 'assistant',
                      content: '👋 First, let\'s chat with your coach to plan your homework! Click the X button above to get started. 📝'
                    }]);
                  } else {
                    router.push('/tutor');
                  }
                })}
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-purple-600 hover:bg-purple-500 rounded-full shadow-xl flex flex-col items-center justify-center border-[3px] border-purple-400 transition-all",
                  activeButton === 'Y' ? 'scale-90 bg-purple-700' : ''
                )}
                title="Get Homework Help"
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-[8px] sm:text-[10px] text-white font-bold">Y</span>
              </button>

              {/* A - Test Practice (Right) */}
              <button
                onClick={() => handleButtonPress('A', () => {
                  if (messages.length === 0) {
                    // Prompt to talk to coach first
                    setMessages([{
                      role: 'assistant',
                      content: '🎯 Ready for test practice? Let\'s plan your study session first! Click X to chat with your coach. 📚'
                    }]);
                  } else {
                    router.push('/test-generator');
                  }
                })}
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-orange-600 hover:bg-orange-500 rounded-full shadow-xl flex flex-col items-center justify-center border-[3px] border-orange-400 transition-all",
                  activeButton === 'A' ? 'scale-90 bg-orange-700' : ''
                )}
                title="Practice Tests & Quizzes"
              >
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="text-[8px] sm:text-[10px] text-white font-bold">A</span>
              </button>
            </div>
            
            {/* ===== BIG RED TALK BUTTON ===== */}
            <div className="relative my-4 md:my-6">
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={cn(
                  "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all duration-150 border-[6px] md:border-8",
                  isRecording
                    ? "bg-gradient-to-br from-red-400 to-red-600 border-white scale-95 animate-pulse"
                    : "bg-gradient-to-br from-red-500 to-red-700 border-red-300 hover:from-red-400 hover:to-red-600 hover:scale-105 active:scale-95"
                )}
              >
                <Mic className={cn("w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white", isRecording && "animate-bounce")} />
                <span className="text-xs sm:text-sm md:text-base text-white font-black mt-1">
                  {isRecording ? "🎤" : "TALK"}
                </span>
              </button>
              
              {/* Glow effect when recording */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-400/40 animate-ping" />
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
            <div className="mt-4 text-[9px] sm:text-[10px] text-white/90 text-center font-bold space-y-0.5">
              <div className="text-blue-200">X=TALK TO COACH</div>
              <div className="text-green-200">B=MY PLAN</div>
              <div className="text-purple-200">Y=HOMEWORK HELP</div>
              <div className="text-orange-200">A=TEST PRACTICE</div>
              <div className="text-blue-300 text-[8px] sm:text-[9px] mt-1">🔵 ADMIN</div>
              <div className="text-red-300 text-[8px] sm:text-[9px]">🔴 HOLD TO TALK</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
