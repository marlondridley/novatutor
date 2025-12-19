
"use client";

import { useState, useRef, FormEvent, useEffect, ReactNode, useContext, useCallback } from "react";
import React from "react";
import Link from "next/link";
import { SendHorizonal, Sparkles, User, Bot, Camera, BookOpen, FileQuestion, X, Mic, MicOff, Wand2, Volume2, VolumeX, Settings, Type, Square, Radio, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getEducationalAssistantResponse, getJokeAction, speechToTextAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { Message, Subject } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HomeworkHelper } from "./homework-helper";
import { TestPrep } from "./test-prep";
import { BlockMath, InlineMath } from 'react-katex';
import { MathSketch } from "./math-sketch";
import { AppStateContext } from "@/context/app-state-context";
import { useCoachVoiceSession } from "@/hooks/use-coach-voice-session";
import { VoiceToTextPremium } from "@/components/voice-to-text-premium";

const subjects: Subject[] = ["Math", "Science", "Writing"];
const JOKE_INTERVAL = 2; // Tell a joke every 2 user messages

const MemoizedBlockMath = ({ children }: { children: string }) => {
  return <BlockMath math={children} />;
};
MemoizedBlockMath.displayName = 'MemoizedBlockMath';

const MemoizedInlineMath = ({ children }: { children: string }) => {
    return <InlineMath math={children} />;
};
MemoizedInlineMath.displayName = 'MemoizedInlineMath';

function MathRenderer({ text }: { text: string }) {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <MemoizedBlockMath key={index}>{part.substring(2, part.length - 2)}</MemoizedBlockMath>;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <MemoizedInlineMath key={index}>{part.substring(1, part.length - 1)}</MemoizedInlineMath>;
        }
        return part;
      })}
    </>
  );
}

interface EducationalAssistantChatProps {
  initialQuery?: string;
  pageContext?: string;
}

export function EducationalAssistantChat({ initialQuery, pageContext }: EducationalAssistantChatProps = {}) {
  const { hasCompletedPlanner } = useContext(AppStateContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState<Subject>("Math");
  const [loading, setLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [currentPageContext] = useState(pageContext || 'Tutor');
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isTestPrepModalOpen, setIsTestPrepModalOpen] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Voice Assistant settings
  const [autoPlayTTS, setAutoPlayTTS] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ voice: 'alloy' as const, speed: 1.0 });
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Wake word & continuous voice session
  const coachSession = useCoachVoiceSession({
    wakeWord: 'hey coach',
    checkInInterval: 5,
    onWakeWordDetected: () => {
      console.log('🎤 Wake word detected! Ready for your question...');
      toast({
        title: "👋 I'm listening!",
        description: "Go ahead, ask me anything.",
      });
      speak("Yes? How can I help you?", 'question');
    },
    onCheckIn: () => {
      console.log('⏰ 5-minute check-in');
      const checkInMessages = [
        "Hey, just checking in! How's it going with your work?",
        "Quick check — do you need help with anything?",
        "I'm here if you need me! How's your focus?",
        "Time for a quick breather — how are you doing?",
      ];
      const randomCheckIn = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      
      const checkInMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⏰ ${randomCheckIn}`,
      };
      setMessages(prev => [...prev, checkInMsg]);
      speak(randomCheckIn, 'reflection');
      scrollToBottom();
    },
    onTranscript: (text) => {
      console.log('📝 Voice command captured:', text);
      // Auto-submit the voice command
      if (text.trim().length > 10) {
        handleVoiceCommand(text);
      }
    },
  });

  // Natural speech function for wake word & check-ins
  const speak = async (text: string, style: 'greeting' | 'question' | 'encouragement' | 'reflection' = 'question') => {
    console.log('🔊 Attempting to speak:', text, `[${style}]`);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Use natural speech synthesis
    if ('speechSynthesis' in window) {
      try {
        const { speakNaturally } = await import('@/lib/natural-speech');
        
        await speakNaturally(
          text,
          style,
          () => console.log('🗣️ Natural speech started'),
          () => console.log('✅ Natural speech ended')
        );
        console.log('✅ Using natural speech');
        return;
      } catch (error) {
        console.warn('⚠️ Natural speech failed:', error);
      }
    }

    // Try API TTS (if available)
    try {
      console.log('🌐 Trying API TTS...');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('⚠️ API TTS returned:', response.status);
        throw new Error('TTS API failed');
      }

      const audioBlob = await response.blob();
      console.log('📦 Audio blob received:', audioBlob.size, 'bytes');
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => console.log('✅ Audio loaded');
      audio.onplay = () => console.log('▶️ Audio playing');
      audio.onended = () => {
        console.log('✅ Audio ended');
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = (e) => console.error('❌ Audio playback error:', e);

      await audio.play();
      console.log('✅ API TTS playing');
    } catch (error) {
      console.error('❌ TTS error:', error);
      toast({
        title: "Audio not available",
        description: "Text-to-speech is not working. Check console for details.",
        variant: "destructive",
      });
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    console.log('🔇 Coach stopped speaking');
  };

  // Handle voice command from wake word session
  const handleVoiceCommand = async (text: string) => {
    console.log('🎤 Processing voice command:', text);
    coachSession.resetToWakeWord(); // Reset to listening for wake word
    await processQuestion(text);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  // Extract text content from ReactNode for TTS
  const extractTextFromContent = (content: ReactNode): string => {
    if (typeof content === 'string') {
      // Remove LaTeX math expressions for cleaner speech
      return content.replace(/\$\$[\s\S]*?\$\$/g, '[math equation]').replace(/\$[\s\S]*?\$/g, '[math]');
    }
    if (React.isValidElement(content) && typeof content.props?.children === 'string') {
      return extractTextFromContent(content.props.children);
    }
    if (Array.isArray(content)) {
      return content.map(c => extractTextFromContent(c)).join(' ').replace(/\$\$[\s\S]*?\$\$/g, '[math equation]').replace(/\$[\s\S]*?\$/g, '[math]');
    }
    return '';
  };

  // Play TTS for a message
  const handlePlayTTS = useCallback(async (messageId: string, content: ReactNode) => {
    if (playingMessageId === messageId) {
      // Stop if already playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setPlayingMessageId(null);
      return;
    }

    const text = extractTextFromContent(content);
    if (!text || text.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "No text to speak",
        description: "This message doesn't contain readable text.",
      });
      return;
    }

    setIsTTSLoading(true);
    setPlayingMessageId(messageId);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 4000), voice: voiceSettings.voice, speed: voiceSettings.speed }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      const blobParts = chunks as unknown as BlobPart[];
      const audioBlob = new Blob(blobParts, { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.onended = () => {
          setPlayingMessageId(null);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setPlayingMessageId(null);
          URL.revokeObjectURL(audioUrl);
          toast({
            variant: "destructive",
            title: "Playback Error",
            description: "Failed to play audio.",
          });
        };
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (err: any) {
      setPlayingMessageId(null);
      toast({
        variant: "destructive",
        title: "TTS Error",
        description: err.message || 'Failed to generate speech',
      });
    } finally {
      setIsTTSLoading(false);
    }
  }, [voiceSettings, toast, playingMessageId]);

  // Auto-play TTS for new assistant messages
  useEffect(() => {
    if (autoPlayTTS && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !playingMessageId) {
        handlePlayTTS(lastMessage.id, lastMessage.content);
      }
    }
  }, [messages, autoPlayTTS, playingMessageId, handlePlayTTS]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle initial query from URL params
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      processQuestion(initialQuery);
    }
  }, [initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = (role: "user" | "assistant", content: ReactNode, isMath?: boolean, sketch?: Message['sketch']) => {
    const finalContent = isMath && typeof content === 'string' ? <MathRenderer text={content} /> : content;
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content: finalContent,
      sketch,
    };
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value as Subject);
    setMessages([]);
    setUserMessageCount(0);
  };
  
  const processQuestion = async (studentQuestion: string, homeworkImage?: string) => {
    if (!studentQuestion.trim() && !homeworkImage) return;

    let userContent: ReactNode = studentQuestion;
    if (homeworkImage) {
        userContent = (
            <div>
                {studentQuestion && <p>{studentQuestion}</p>}
                <img src={homeworkImage} alt="Homework" className="rounded-md mt-2 max-w-sm" />
            </div>
        )
    }

    addMessage("user", userContent);
    setLastQuestion(studentQuestion);
    setLoading(true);

    const newInteractionCount = userMessageCount + 1;

    // Add page context to the question for better AI understanding
    const contextualQuestion = currentPageContext !== 'Tutor' 
      ? `[Page Context: ${currentPageContext}] ${studentQuestion}`
      : studentQuestion;

    // Fetch educational assistant response
    const response = await getEducationalAssistantResponse({ 
      subject, 
      studentQuestion: contextualQuestion, 
      homeworkImage 
    });

    if (response.success && response.data) {
      addMessage("assistant", response.data.tutorResponse, subject === 'Math', response.data.sketch);
      setUserMessageCount(newInteractionCount);

      // Check if it's time for a joke
      if (newInteractionCount % JOKE_INTERVAL === 0) {
        const jokeResponse = await getJokeAction({ subject });
        if (jokeResponse.success && jokeResponse.data) {
          addMessage("assistant", jokeResponse.data.joke);
        }
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response from tutor",
      });
      setMessages((prev) => prev.slice(0, -1)); // remove user message on error
    }

    setLoading(false);
    if (formRef.current) {
        (formRef.current.elements.namedItem('question') as HTMLTextAreaElement).value = '';
    }
  }

  // Handle voice transcript from Speak to Coach button
  const handleVoiceTranscript = async (text: string) => {
    if (text.trim().length > 10) {
      // Auto-submit when enough content is captured
      setShowVoiceInput(false);
      await processQuestion(text.trim());
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studentQuestion = formData.get("question") as string;
    await processQuestion(studentQuestion);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            setLoading(true);
            const response = await speechToTextAction({ audioDataUri: base64Audio });
            if (response.success && response.data) {
                await processQuestion(response.data.transcript);
            } else {
                toast({
                    variant: "destructive",
                    title: "Transcription Failed",
                    description: "Could not transcribe audio",
                });
            }
            setLoading(false);
          };
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Microphone Error",
          description: "Could not access microphone. Please check permissions.",
        });
      }
    }
  };

  const onHomeworkCheck = (imageDataUri: string) => {
    const question = (formRef.current?.elements.namedItem('question') as HTMLTextAreaElement)?.value || "Can you help me with this problem?";
    processQuestion(question, imageDataUri);
    setIsHomeworkModalOpen(false);
  }

  if (!hasCompletedPlanner) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed rounded-lg">
        <Wand2 className="w-16 h-16 mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Let's Get a Plan!</h2>
        <p className="text-muted-foreground mb-4">Please create a homework plan on the dashboard before using the Educational Assistant.</p>
        <Link href="/dashboard">
          <Button>Go to Homework Planner</Button>
        </Link>
      </div>
    )
  }


  return (
    <>
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">My Coach</h2>
        </div>
        <Select
          value={subject}
          onValueChange={handleSubjectChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Speak to Coach Button */}
          <Button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            size="sm"
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
          >
            <Mic className={`h-4 w-4 ${showVoiceInput ? 'animate-pulse' : ''}`} />
            {showVoiceInput ? 'Stop Voice' : 'Speak to Coach'}
          </Button>
            {/* Wake Word Session Button */}
            <Button 
              variant={coachSession.isSessionActive ? "default" : "outline"}
              size="sm"
              onClick={() => coachSession.isSessionActive ? coachSession.stopSession() : coachSession.startSession()}
              className={coachSession.isSessionActive ? "bg-primary animate-pulse" : ""}
              title={coachSession.isSessionActive ? "Stop listening for 'Hey Coach'" : "Start wake word session"}
            >
              {coachSession.isSessionActive ? (
                <><Radio className="h-4 w-4 mr-2 animate-ping"/> Live Session</>
              ) : (
                <><Mic className="h-4 w-4 mr-2"/> Wake Word</>
              )}
            </Button>

            {coachSession.isSessionActive && (
              <Badge variant="secondary" className="animate-pulse">
                {coachSession.isListeningForWakeWord && <><Mic className="h-3 w-3 mr-1"/> Say "Hey Coach"</>}
                {coachSession.isListeningForCommand && <><Radio className="h-3 w-3 mr-1"/> Listening...</>}
              </Badge>
            )}

            {/* Debug: Show what's being heard */}
            {coachSession.isSessionActive && coachSession.transcript && (
              <Card className="absolute top-16 right-0 w-80 z-50 shadow-lg">
                <CardContent className="p-3">
                  <p className="text-xs font-mono text-muted-foreground mb-1">
                    🎤 Hearing: {coachSession.listening ? '(active)' : '(paused)'}
                  </p>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    "{coachSession.transcript}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {coachSession.isListeningForWakeWord && '⏳ Waiting for "Hey Coach"...'}
                    {coachSession.isListeningForCommand && '✅ Capturing your question...'}
                  </p>
                </CardContent>
              </Card>
            )}

            {coachSession.isSessionActive && coachSession.lastCheckInTime && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1"/>
                Next check-in: {Math.ceil((5 * 60 * 1000 - (Date.now() - coachSession.lastCheckInTime.getTime())) / 1000 / 60)}min
              </Badge>
            )}

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => speak("Testing audio. Can you hear me?")}
              title="Test your speakers"
            >
              <Volume2 className="h-4 w-4 mr-2"/>
              Test Audio
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={autoPlayTTS ? "bg-primary/10" : ""}
              title="Voice Assistant Settings"
            >
              <Settings className="h-4 w-4 mr-2"/>
              Voice
            </Button>
            <Button variant="outline" onClick={() => setIsHomeworkModalOpen(true)}>
                <Camera className="mr-2"/>
                Homework Helper
            </Button>
            <Button variant="outline" onClick={() => setIsTestPrepModalOpen(true)}>
                <FileQuestion className="mr-2"/>
                Test Prep
            </Button>
        </div>
      </div>

      {/* Speak to Coach Voice Input */}
      {showVoiceInput && (
        <div className="mb-4">
          <VoiceToTextPremium
            onTranscript={handleVoiceTranscript}
            title="🎙️ Just talk — I'm listening"
            description="Click 'Start Recording' to begin. Ask me anything about your subject!"
            placeholder="Your question will appear here as you speak..."
            autoStart={true}
          />
        </div>
      )}

      {showVoiceSettings && (
        <div className="mb-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Voice Assistant Settings</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowVoiceSettings(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoPlayTTS"
                checked={autoPlayTTS}
                onChange={(e) => setAutoPlayTTS(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoPlayTTS" className="text-sm cursor-pointer">
                Automatically read assistant responses aloud
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Voice</label>
                <Select 
                  value={voiceSettings.voice} 
                  onValueChange={(value: any) => setVoiceSettings({ ...voiceSettings, voice: value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                    <SelectItem value="echo">Echo (Clear)</SelectItem>
                    <SelectItem value="fable">Fable (Warm)</SelectItem>
                    <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                    <SelectItem value="nova">Nova (Energetic)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Friendly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Speed: {voiceSettings.speed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 mb-4 pr-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <p>Ask a question to start your {subject} session with the Educational Assistant.</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div>{message.content}</div>
                    {message.sketch && (
                      <MathSketch drawing={message.sketch.drawing} caption={message.sketch.caption} />
                    )}
                  </div>
                  {message.role === "assistant" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handlePlayTTS(message.id, message.content)}
                      disabled={isTTSLoading}
                      title={playingMessageId === message.id ? "Stop reading" : "Read aloud"}
                    >
                      {playingMessageId === message.id ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {message.role === "user" && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {loading && (
            <div className="flex items-start gap-4">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Tabs defaultValue="text" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Type It Out</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Talk It Out 🎤</span>
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Show Me</span>
          </TabsTrigger>
        </TabsList>

        {/* Text Input Tab */}
        <TabsContent value="text" className="space-y-2 m-0">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex items-start gap-4">
              <Textarea
                name="question"
                placeholder={`What would you like help with?`}
                className="min-h-[4rem] flex-1"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <Button type="submit" disabled={loading} size="icon" className="h-16 w-16">
                <SendHorizonal />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Voice Input Tab */}
        <TabsContent value="voice" className="space-y-4 m-0">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20">
            {!isRecording ? (
              <>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Click below and explain what's confusing you...
                </p>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleToggleRecording}
                  disabled={loading}
                  className="w-full max-w-xs"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium">Recording... speak freely!</p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  variant="destructive"
                  onClick={handleToggleRecording}
                  className="w-full max-w-xs"
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop & Send
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* Photo/Homework Tab */}
        <TabsContent value="photo" className="space-y-4 m-0">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Show me your homework or problem
            </p>
            <Button
              type="button"
              size="lg"
              onClick={() => setIsHomeworkModalOpen(true)}
              className="w-full max-w-xs"
              disabled={loading}
            >
              <Camera className="mr-2 h-5 w-5" />
              Take or Upload Photo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    <Dialog open={isHomeworkModalOpen} onOpenChange={setIsHomeworkModalOpen}>
        <DialogContent className="max-w-4xl flex flex-col">
            <DialogHeader>
                <DialogTitle>Homework Helper</DialogTitle>
                <DialogDescription>
                    Get help with your homework. Point your camera at your work and click "Get Help". You can also type a question about it.
                </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              <HomeworkHelper subject={subject} onCheck={onHomeworkCheck} />
            </div>
        </DialogContent>
    </Dialog>

    <Dialog open={isTestPrepModalOpen} onOpenChange={setIsTestPrepModalOpen}>
        <DialogContent className="max-w-4xl">
             <DialogHeader>
                <DialogTitle>Test Prep Generator</DialogTitle>
                <DialogDescription>
                    Create quizzes or flashcards to help you study for your tests.
                </DialogDescription>
            </DialogHeader>
            <TestPrep subject={subject} topic={lastQuestion} />
        </DialogContent>
    </Dialog>

    </>
  );
}
