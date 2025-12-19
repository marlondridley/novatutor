
"use client";

import { useState, useContext, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Plus, Trash2, Loader2, Sparkles, Wand2, Volume2, VolumeX, MessageCircle, SendHorizonal, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createHomeworkPlanAction } from "@/lib/actions";
import type { HomeworkPlannerOutput } from "@/ai/flows/homework-planner-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AppStateContext } from "@/context/app-state-context";
import { useAuth } from "@/context/auth-context";
import { VoiceToTextPremium } from "@/components/voice-to-text-premium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { YouTubeRecommendations } from "@/components/youtube-recommendations";

const formSchema = z.object({
  tasks: z.array(z.object({
    subject: z.string().min(1, "Subject is required."),
    topic: z.string().min(1, "Topic is required."),
    estimatedTime: z.coerce.number().min(1, "Time must be greater than 0."),
  })).min(1, "Please add at least one task."),
});

type HomeworkFormValues = z.infer<typeof formSchema>;

type ConversationStage = 'greeting' | 'question' | 'plan';

export function HomeworkPlanner() {
  const router = useRouter();
  const { setHasCompletedPlanner } = useContext(AppStateContext);
  const { user, supabaseUser } = useAuth();
  const [stage, setStage] = useState<ConversationStage>('greeting');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<HomeworkPlannerOutput | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<string>("");
  const [studentResponse, setStudentResponse] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);
  const { toast } = useToast();

  const form = useForm<HomeworkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks: [{ subject: "", topic: "", estimatedTime: 30 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  // Text-to-Speech function with natural pacing
  const speak = async (text: string, style: 'greeting' | 'question' | 'encouragement' | 'explanation' = 'explanation') => {
    console.log('🔊 Coach speaking:', text.substring(0, 50) + '...', `[${style}]`);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsSpeaking(true);

    // Use natural speech synthesis
    if ('speechSynthesis' in window) {
      try {
        const { speakNaturally } = await import('@/lib/natural-speech');
        
        await speakNaturally(
          text,
          style,
          () => {
            console.log('🗣️ Coach started speaking');
            setIsSpeaking(true);
          },
          () => {
            console.log('✅ Coach finished speaking');
            setIsSpeaking(false);
          }
        );
        return;
      } catch (error) {
        // Only log genuine errors
        const errorMessage = (error as any)?.error || '';
        if (errorMessage !== 'not-allowed') {
          console.warn('⚠️ Natural speech failed:', error);
        }
        setIsSpeaking(false);
      }
    }

    // Fallback: Try API TTS (optional, higher quality)
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('API TTS not available');
        setIsSpeaking(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        console.warn('Audio playback failed');
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
      console.log('✅ Using API TTS');
    } catch (error) {
      console.warn('API TTS not available:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    console.log('🔇 Coach stopped speaking');
  };

  // Don't auto-speak on mount - browsers block autoplay without user interaction
  // Speech will be triggered by user actions (button clicks, etc.)

  const handleContinueToQuestion = () => {
    stopSpeaking();
    setStage('question');
    const question = `Thanks for sharing. Now, tell me what you're working on today. What subjects or assignments do you need to focus on? Take your time — I'm listening.`;
    speak(question, 'question');
  };

  // Store refs for stable callbacks
  const studentResponseRef = useRef(studentResponse);
  const loadingRef = useRef(loading);
  const voiceNotesRef = useRef(voiceNotes);
  const onSubmitRef = useRef<(data: HomeworkFormValues) => Promise<void>>();
  
  // Update refs when values change
  useEffect(() => {
    studentResponseRef.current = studentResponse;
  }, [studentResponse]);
  
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  
  useEffect(() => {
    voiceNotesRef.current = voiceNotes;
  }, [voiceNotes]);

  // Define onSubmit first so it can be used in handleVoiceTranscript
  const onSubmit = useCallback(async (data: HomeworkFormValues) => {
    setLoading(true);
    
    // Get current values from refs
    const currentVoiceNotes = voiceNotesRef.current;
    const currentStudentResponse = studentResponseRef.current;
    
    // Combine student's emotional check-in with their work notes
    let combinedNotes = '';
    
    // If we're answering questions, include context about the questions
    if (isAnsweringQuestions && askedQuestions.length > 0) {
      const answers = `${currentStudentResponse} ${currentVoiceNotes}`.trim();
      // Create a detailed context that includes the questions and answers
      combinedNotes = `The student was asked these questions:\n${askedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nHere are the student's answers:\n${answers}\n\nPlease create a focus plan based on this information.`;
    } else {
      // Initial input - combine feelings and work details
      const studentInput = `${currentStudentResponse} ${currentVoiceNotes}`.trim();
      combinedNotes = studentInput || 'Not specified';
    }
    
    // Create tasks from the combined notes
    let tasksToSubmit = data.tasks;
    if (combinedNotes && combinedNotes !== 'Not specified') {
      tasksToSubmit = [{
        subject: "Today's Focus",
        topic: combinedNotes,
        estimatedTime: 45
      }];
    }
    
    const response = await createHomeworkPlanAction({
      studentName: user?.name || "Student",
      tasks: tasksToSubmit,
    });

    if (!response.success) {
      // Handle error case - TypeScript knows response.error exists here
      toast({
        variant: "destructive",
        title: "Hmm, something went wrong",
        description: response.error || "Let's try that again together.",
      });
    } else if (response.data) {
      // If AI needs clarification and we're not already answering questions
      if (response.data.needsClarification && response.data.questions && !isAnsweringQuestions) {
        setPlan(response.data);
        setAskedQuestions(response.data.questions);
        setIsAnsweringQuestions(true);
        setStage('question');
        setVoiceNotes(''); // Clear for new answers
        setStudentResponse(''); // Clear for new answers
      } else {
        // Plan is ready - either from initial input or after answering questions
        setPlan(response.data);
        setHasCompletedPlanner(true);
        setStage('plan');
        setIsAnsweringQuestions(false);
        setAskedQuestions([]);
        
        // Speak the summary with encouragement
        if (response.data.summary) {
          speak(response.data.summary, 'encouragement');
        }
      }
    }
    setLoading(false);
  }, [user, supabaseUser, setHasCompletedPlanner, setStage, speak, toast, isAnsweringQuestions, askedQuestions]);

  // Update ref when onSubmit changes
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Auto-submit when voice input is captured
  const handleVoiceTranscript = useCallback((text: string) => {
    // Update voice notes state (using functional update to avoid dependency)
    setVoiceNotes(prev => {
      // Only update if text actually changed
      if (prev !== text) {
        voiceNotesRef.current = text; // Update ref
        return text;
      }
      return prev;
    });
    
    // Check if this is similar to last attempt (retry detection)
    const normalizedText = text.toLowerCase().trim();
    const normalizedLast = lastTranscriptRef.current.toLowerCase().trim();
    const isRetry = normalizedText === normalizedLast && text.length > 10 && normalizedLast.length > 10;
    
    if (isRetry) {
      setRetryCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) { // After 3rd attempt
          setShowPremiumPrompt(true);
        }
        return newCount;
      });
    } else if (normalizedText !== normalizedLast) {
      // Reset retry count if text actually changed
      setRetryCount(0);
    }
    
    // Update last transcript ref
    lastTranscriptRef.current = text;
    
    // Clear existing timeout if any
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
    
    // Auto-submit if we have enough content (30+ characters) and haven't submitted yet
    const trimmedText = text.trim();
    if (trimmedText.length >= 30 && !loadingRef.current && !hasSubmittedRef.current) {
      console.log('📝 Auto-submitting voice input:', trimmedText);
      
      // Debounce submission to prevent rapid-fire submissions
      submitTimeoutRef.current = setTimeout(() => {
        if (hasSubmittedRef.current || loadingRef.current) return; // Double-check
        
        hasSubmittedRef.current = true;
        stopSpeaking();
        const combinedNotes = `${studentResponseRef.current} ${trimmedText}`.trim();
        
        // Use ref to call onSubmit to avoid dependency
        if (onSubmitRef.current) {
          onSubmitRef.current({ tasks: [{ subject: "Today's Focus", topic: combinedNotes, estimatedTime: 45 }] });
        }
        
        // Reset after submission completes
        setTimeout(() => {
          hasSubmittedRef.current = false;
        }, 3000);
      }, 1000); // 1s debounce
    }
  }, [stopSpeaking]);
  
  const handleCreateNewPlan = () => {
    stopSpeaking();
    setPlan(null);
    setStage('greeting');
    setStudentResponse("");
    setVoiceNotes("");
    setRetryCount(0);
    setShowPremiumPrompt(false);
    setAskedQuestions([]);
    setIsAnsweringQuestions(false);
    lastTranscriptRef.current = "";
    form.reset();
    setHasCompletedPlanner(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> 🧭 Your Learning Coach
            </CardTitle>
            <CardDescription>
              {stage === 'greeting' && "Let's check in before we plan..."}
              {stage === 'question' && isAnsweringQuestions ? "Answer the questions below to create your plan..." : "Tell me what you're working on..."}
              {stage === 'plan' && "Your personalized focus plan is ready!"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Badge variant="secondary" className="animate-pulse">
                <Volume2 className="h-3 w-3 mr-1" />
                Coach is speaking...
              </Badge>
            )}
            <Button
              onClick={() => {
                setShowVoiceInput(!showVoiceInput);
                // If opening voice input, switch to question stage if not already there
                if (!showVoiceInput && stage === 'greeting') {
                  setStage('question');
                }
              }}
              size="sm"
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
            >
              <Mic className={`h-4 w-4 ${showVoiceInput ? 'animate-pulse' : ''}`} />
              {showVoiceInput ? 'Stop Voice' : 'Speak to Coach'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* STAGE 1: Greeting */}
        {stage === 'greeting' && (
          <div className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <Bot className="h-5 w-5 text-primary" />
              <AlertTitle className="text-lg">Hey there! 👋</AlertTitle>
              <AlertDescription className="text-base mt-2">
                I'm your learning coach. Before we dive into planning, I want to check in with you.
                <br /><br />
                <strong>How are you feeling about your schoolwork today?</strong>
              </AlertDescription>
              <div className="mt-3">
                <Button
                  onClick={() => {
                    const greeting = `Hey there! I'm your learning coach. Before we dive into planning, I want to check in with you. How are you feeling about your schoolwork today?`;
                    speak(greeting, 'greeting');
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isSpeaking}
                  className="mt-2"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  {isSpeaking ? 'Speaking...' : 'Hear this message'}
                </Button>
              </div>
            </Alert>

            <div className="space-y-3">
              <Textarea
                placeholder="I'm feeling... (stressed, confident, confused, ready to learn, etc.)"
                value={studentResponse}
                onChange={(e) => setStudentResponse(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                💡 This helps me understand where you're at so I can support you better.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleContinueToQuestion} 
                disabled={!studentResponse.trim()}
                className="flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Continue
              </Button>
              <Button 
                onClick={() => setStage('question')} 
                variant="ghost"
                size="sm"
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

            {/* STAGE 2: Question - What are you working on? */}
            {stage === 'question' && (
              <div className="space-y-6">
                {plan?.needsClarification && plan?.questions ? (
                  // Show AI's clarifying questions with example answers
                  <div className="space-y-4">
                    <Alert className="bg-accent/10 border-accent/30">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <AlertTitle className="text-lg">Let me understand better! 💭</AlertTitle>
                      <AlertDescription className="text-base mt-2 space-y-2">
                        {plan.questions.map((question, idx) => (
                          <p key={idx} className="mb-2">
                            <strong>{idx + 1}.</strong> {question}
                          </p>
                        ))}
                      </AlertDescription>
                    </Alert>
                    
                    {/* Example answers */}
                    <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-sm text-blue-900 dark:text-blue-100">
                        💡 Example Answer:
                      </AlertTitle>
                      <AlertDescription className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                        <p className="italic">
                          "I'm studying geometry, focusing on triangles. I have about 45 minutes. 
                          I feel a bit confused about area formulas. I want to review my notes first, 
                          then practice problems. I can start now."
                        </p>
                        <p className="mt-2 text-xs">
                          Just answer the questions naturally - I'll create your plan automatically!
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  // Default question stage
                  <Alert className="bg-accent/10 border-accent/30">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-lg">
                      {studentResponse ? "Thanks for sharing!" : "Let's get started"}
                    </AlertTitle>
                    <AlertDescription className="text-base mt-2">
                      Now, tell me what you're working on today. What subjects or assignments do you need to focus on?
                      <br /><br />
                      <strong>Take your time — I'm listening. 🎧</strong>
                    </AlertDescription>
                  </Alert>
                )}

            <div className="space-y-4">
              {/* Show premium prompt only after 3 retries */}
              {showPremiumPrompt && (
                <Alert className="bg-accent/10 border-accent">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Having trouble with voice accuracy?</AlertTitle>
                  <AlertDescription className="text-sm">
                    Upgrade to Premium Voice for 99% accuracy with advanced AI — perfect for accents and technical vocabulary.
                    <Button variant="link" className="h-auto p-0 ml-1" onClick={() => window.location.href = 'https://buy.stripe.com/4gM28rfBb0Fr3sl1L92VG05'}>
                      Upgrade for $2/month →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Voice Input - shown when button is clicked */}
              {showVoiceInput && (
                <div className="space-y-3">
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>How to respond:</strong> {
                        isAnsweringQuestions
                          ? "Click 'Start Recording', then answer the questions above naturally. When you're done, click 'Stop Recording' and I'll automatically create your plan!"
                          : "Click 'Start Recording', then just talk naturally about your homework. When you're done, click 'Stop Recording' and then 'Submit Now' below. Or keep talking for 30+ words and I'll auto-create your plan!"
                      }
                    </AlertDescription>
                  </Alert>
                  
                  <VoiceToTextPremium 
                    onTranscript={handleVoiceTranscript}
                    title="🎙️ Just talk — I'm listening"
                    description={
                      isAnsweringQuestions
                        ? "Click 'Start Recording' to begin. Answer the questions above naturally. Click 'Stop Recording' when you're done."
                        : "Click 'Start Recording' to begin. Speak naturally about what you're working on. Click 'Stop Recording' when you're done."
                    }
                    placeholder="Your words will appear here as you speak..."
                  />
                  
                  {voiceNotes && (
                    <div className="p-4 bg-accent/10 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium">✨ What you said:</p>
                        {voiceNotes.length >= 30 && !loading && (
                          <Badge variant="secondary" className="ml-2">
                            Auto-submitting in a moment...
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{voiceNotes}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {voiceNotes.length < 30 
                            ? isAnsweringQuestions
                              ? `Keep going... Answer the questions above (${30 - voiceNotes.length} more characters needed).`
                              : `Keep going... ${30 - voiceNotes.length} more characters needed.`
                            : loading 
                            ? isAnsweringQuestions
                              ? "🎉 Creating your plan from your answers..."
                              : "🎉 Creating your plan..."
                            : isAnsweringQuestions
                            ? "✅ Got it! Creating your plan automatically..."
                            : "✅ Got it! Auto-submitting..."}
                        </p>
                        {voiceNotes.length >= 10 && (
                          <Button
                            onClick={() => {
                              const currentVoiceNotes = voiceNotesRef.current || voiceNotes;
                              const currentStudentResponse = studentResponseRef.current || studentResponse;
                              
                              stopSpeaking();
                              const combinedNotes = `${currentStudentResponse} ${currentVoiceNotes}`.trim();
                              onSubmit({ tasks: [{ subject: "Today's Focus", topic: combinedNotes, estimatedTime: 45 }] });
                            }}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                          >
                            {loading ? (
                              <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> {isAnsweringQuestions ? "Creating plan..." : "Creating..."}</>
                            ) : (
                              <><SendHorizonal className="mr-2 h-3 w-3" /> {isAnsweringQuestions ? "Create My Plan" : "Submit Now"}</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input - always visible */}
              <div className="space-y-4">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Type your response:</strong> {
                      plan?.needsClarification 
                        ? "Answer the questions above to help me create your perfect focus plan."
                        : "Tell me what you're working on today. Type at least a few sentences, then click 'Send' to create your plan."
                    }
                  </AlertDescription>
                </Alert>
                
                <Textarea
                  placeholder={
                    plan?.needsClarification
                      ? "For example: 'I'm studying geometry, focusing on triangles. I have about 45 minutes. I feel a bit confused about area formulas. I want to review my notes first, then practice problems. I can start now.'"
                      : "Example: 'I have algebra homework on chapter 3, need to finish my history essay, and study for a Spanish quiz...'"
                  }
                  value={voiceNotes}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    voiceNotesRef.current = newValue; // Update ref immediately
                    setVoiceNotes(newValue);
                  }}
                  onKeyDown={(e) => {
                    // Submit on Ctrl+Enter or Cmd+Enter
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      const currentVoiceNotes = voiceNotesRef.current || voiceNotes;
                      const currentStudentResponse = studentResponseRef.current || studentResponse;
                      
                      if (currentVoiceNotes.trim().length >= 10 && !loading) {
                        stopSpeaking();
                        const combinedNotes = `${currentStudentResponse} ${currentVoiceNotes}`.trim();
                        onSubmit({ tasks: [{ subject: "Today's Focus", topic: combinedNotes, estimatedTime: 45 }] });
                      }
                    }
                  }}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Enter</kbd> to send quickly
                  </p>
                  <Button
                    onClick={() => {
                      const currentVoiceNotes = voiceNotesRef.current || voiceNotes;
                      const currentStudentResponse = studentResponseRef.current || studentResponse;
                      
                      if (currentVoiceNotes.trim().length >= 10) {
                        stopSpeaking();
                        const combinedNotes = `${currentStudentResponse} ${currentVoiceNotes}`.trim();
                        onSubmit({ tasks: [{ subject: "Today's Focus", topic: combinedNotes, estimatedTime: 45 }] });
                      } else {
                        toast({
                          title: "Tell me more",
                          description: isAnsweringQuestions 
                            ? "Answer the questions above to help me create your plan."
                            : "Share at least a few sentences about what you're working on.",
                        });
                      }
                    }}
                    disabled={loading || !voiceNotes.trim() || voiceNotes.trim().length < 10}
                    className="ml-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isAnsweringQuestions ? "Creating your plan..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <SendHorizonal className="mr-2 h-4 w-4" />
                        {isAnsweringQuestions ? "Create My Plan" : "Send"}
                      </>
                    )}
                  </Button>
                </div>
                {voiceNotes.trim().length > 0 && voiceNotes.trim().length < 10 && (
                  <p className="text-xs text-muted-foreground">
                    📝 {10 - voiceNotes.trim().length} more characters needed to send
                  </p>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center p-4 bg-primary/5 rounded-lg">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Creating your personalized plan...</span>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: Plan Display */}
        {stage === 'plan' && plan && plan.plan && (
            <div className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-900 dark:text-green-100">
                      🧭 Your Learning Coach
                      <br />
                      ✨ Your Focus Plan is Ready!
                    </AlertTitle>
                    {plan.summary && (
                      <AlertDescription className="text-green-700 dark:text-green-300 mt-2">
                        {plan.summary}
                      </AlertDescription>
                    )}
                </Alert>

                {studentResponse && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-1">💭 How you're feeling:</p>
                    <p className="text-sm text-muted-foreground italic">"{studentResponse}"</p>
                  </div>
                )}

                <div className="space-y-4">
                    {plan.plan.map((task, index) => (
                        <Card key={index} className="bg-background/50 border-l-4 border-l-primary">
                            <CardHeader>
                                <CardTitle className="text-base">
                                  Today's Focus: {task.subject} — {task.topic}
                                </CardTitle>
                                <CardDescription>⏱️ Estimated Time: {task.estimatedTime} minutes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Show steps if available */}
                                {task.steps && task.steps.length > 0 && (
                                  <div className="space-y-2">
                                    {task.steps.map((step, stepIdx) => (
                                      <div key={stepIdx} className="flex items-start gap-2">
                                        <span className="text-primary font-bold">🪄 Step {stepIdx + 1}:</span>
                                        <p className="text-sm text-foreground flex-1">{step}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Show encouragement */}
                                {task.encouragement && (
                                  <div className="pt-2 border-t">
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">💬 Encouragement:</span> {task.encouragement}
                                    </p>
                                  </div>
                                )}
                                
                                {/* YouTube Video Recommendations */}
                                <div className="pt-3 border-t">
                                  <YouTubeRecommendations 
                                    topic={task.topic}
                                    subject={task.subject}
                                    maxResults={2}
                                  />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Show follow-up question if available */}
                {plan.followUpQuestion && (
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-900 dark:text-blue-100">
                      {plan.followUpQuestion}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {/* Primary CTA: Start Working */}
                  <Button 
                    onClick={() => {
                      if (!plan?.plan) return;
                      
                      // Build plan summary for context
                      const planSummary = plan.plan
                        .map((task, idx) => 
                          `${idx + 1}. ${task.subject} - ${task.topic} (${task.estimatedTime} min)`
                        )
                        .join('\n');
                      
                      const contextMessage = `My Focus Plan:\n${planSummary}\n\n${plan.summary || ''}`;
                      
                      toast({
                        title: "🚀 Let's do this!",
                        description: "Opening your coach with your plan ready!",
                      });
                      
                      // Redirect to tutor with plan context
                      const encoded = encodeURIComponent(contextMessage);
                      router.push(`/tutor?q=${encoded}&context=Homework+Planner`);
                    }} 
                    className="w-full text-lg py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Working with My Coach! 🎯
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateNewPlan} variant="outline" className="flex-1">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Make a New Plan
                    </Button>
                    {isSpeaking && (
                      <Button onClick={stopSpeaking} variant="ghost" size="icon">
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
