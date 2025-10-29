
"use client";

import { useState, useRef, FormEvent, useEffect, ReactNode, useContext } from "react";
import Link from "next/link";
import { SendHorizonal, Sparkles, User, Bot, Camera, BookOpen, FileQuestion, X, Mic, MicOff, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { HomeworkHelper } from "./homework-helper";
import { TestPrep } from "./test-prep";
import { BlockMath, InlineMath } from 'react-katex';
import { MathSketch } from "./math-sketch";
import { AppStateContext } from "@/context/app-state-context";

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

export function EducationalAssistantChat() {
  const { hasCompletedPlanner } = useContext(AppStateContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subject, setSubject] = useState<Subject>("Math");
  const [loading, setLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [isTestPrepModalOpen, setIsTestPrepModalOpen] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    setTimeout(() => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Fetch educational assistant response
    const response = await getEducationalAssistantResponse({ subject, studentQuestion, homeworkImage });

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
        description: response.error,
      });
      setMessages((prev) => prev.slice(0, -1)); // remove user message on error
    }

    setLoading(false);
    if (formRef.current) {
        (formRef.current.elements.namedItem('question') as HTMLTextAreaElement).value = '';
    }
  }


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
                    description: response.error,
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
        <h2 className="text-lg font-semibold">Select Subject:</h2>
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
        <div className="flex items-center gap-2 ml-auto">
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
                <div>{message.content}</div>
                 {message.sketch && (
                    <MathSketch drawing={message.sketch.drawing} caption={message.sketch.caption} />
                )}
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

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-start gap-4"
      >
        <Textarea
          name="question"
          placeholder={`Ask your Educational Assistant a ${subject} question...`}
          className="min-h-[4rem] flex-1"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={handleToggleRecording} 
          disabled={loading} 
          size="icon" 
          className={cn("h-16 w-16", isRecording && "bg-red-500 hover:bg-red-600")}
        >
          {isRecording ? <MicOff /> : <Mic />}
          <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </Button>
        <Button type="submit" disabled={loading} size="icon" className="h-16 w-16">
          <SendHorizonal />
          <span className="sr-only">Send</span>
        </Button>
      </form>
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
