"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  Trophy,
  RefreshCw,
  Brain,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface QuizResult {
  topic: string;
  subject: string;
  mode: string;
  quiz: QuizQuestion[];
  metadata: {
    generatedAt: string;
    source: string;
    difficulty: string;
    contextUsed: boolean;
  };
}

export function AdaptiveTestGenerator() {
  const { toast } = useToast();
  
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<string>("adaptive");
  const [count, setCount] = useState(5);
  
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  
  const [result, setResult] = useState<QuizResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const startGeneration = async () => {
    if (!subject && !topic) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide at least a subject or topic",
      });
      return;
    }

    setGenerating(true);
    setProgress(0);
    setProgressMessage("Starting...");
    setResult(null);
    setUserAnswers({});
    setSubmitted(false);

    try {
      const response = await fetch('/api/test/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, topic, mode, count }),
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz generation');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));

            switch (data.type) {
              case 'progress':
                setProgressMessage(data.message);
                setProgress(prev => Math.min(prev + 20, 90));
                break;

              case 'info':
                toast({
                  title: "Info",
                  description: data.message,
                });
                break;

              case 'complete':
                setProgress(100);
                setProgressMessage("Quiz ready!");
                setResult(data.data);
                
                setTimeout(() => {
                  setGenerating(false);
                  setProgress(0);
                  setProgressMessage("");
                }, 500);
                
                toast({
                  title: "✅ Quiz Generated!",
                  description: `${data.data.quiz.length} ${data.data.mode} questions ready!`,
                });
                break;

              case 'error':
                throw new Error(data.message);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || 'Something went wrong',
      });
      setGenerating(false);
      setProgress(0);
    }
  };

  const handleAnswer = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const calculateScore = () => {
    if (!result) return 0;
    let correct = 0;
    result.quiz.forEach((q, i) => {
      if (userAnswers[i] === q.answer) correct++;
    });
    return Math.round((correct / result.quiz.length) * 100);
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'practice':
        return <Zap className="h-4 w-4" />;
      case 'challenge':
        return <Target className="h-4 w-4" />;
      case 'mastery':
        return <Brain className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'practice':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'challenge':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'mastery':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quiz Generator Form */}
      {!result && !generating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              🧩 Adaptive Test Generator
            </CardTitle>
            <CardDescription>
              Create personalized quizzes based on your recent notes and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Math, Science"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Leave empty to use your most recent subject
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Quadratic Equations"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Leave empty to use your most recent topic
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Difficulty Mode</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adaptive">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Adaptive (Recommended)
                      </div>
                    </SelectItem>
                    <SelectItem value="practice">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Practice (Easy)
                      </div>
                    </SelectItem>
                    <SelectItem value="challenge">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Challenge (Medium)
                      </div>
                    </SelectItem>
                    <SelectItem value="mastery">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Mastery (Hard)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of Questions</Label>
                <Select value={count.toString()} onValueChange={(v) => setCount(parseInt(v))}>
                  <SelectTrigger id="count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={startGeneration} size="lg" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generating Progress */}
      {generating && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{progressMessage}</h3>
                <Progress value={progress} className="w-64" />
                <p className="text-sm text-muted-foreground">
                  This usually takes less than 5 seconds...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Display */}
      {result && !generating && (
        <div className="space-y-4">
          {/* Quiz Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {result.topic}
                    <Badge className={cn("ml-2", getDifficultyColor(result.mode))}>
                      {getDifficultyIcon(result.mode)}
                      {result.mode}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {result.subject} • {result.quiz.length} questions
                    {result.metadata.contextUsed && " • Based on your notes ✨"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Quiz
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Questions */}
          {result.quiz.map((q, i) => (
            <Card
              key={i}
              className={cn(
                "transition-all",
                submitted && userAnswers[i] === q.answer && "border-green-500 bg-green-50 dark:bg-green-950",
                submitted && userAnswers[i] && userAnswers[i] !== q.answer && "border-red-500 bg-red-50 dark:bg-red-950"
              )}
            >
              <CardHeader>
                <CardTitle className="text-base">
                  Question {i + 1}
                </CardTitle>
                <p className="text-sm">{q.question}</p>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userAnswers[i]}
                  onValueChange={(val) => handleAnswer(i, val)}
                  disabled={submitted}
                  className="space-y-2"
                >
                  {q.options.map((opt, j) => (
                    <div key={j} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`q${i}o${j}`} />
                      <Label
                        htmlFor={`q${i}o${j}`}
                        className={cn(
                          "flex-1 cursor-pointer",
                          submitted && opt === q.answer && "font-bold text-green-600",
                          submitted && userAnswers[i] === opt && opt !== q.answer && "text-red-600"
                        )}
                      >
                        {opt}
                        {submitted && opt === q.answer && <Check className="inline ml-2 h-4 w-4 text-green-600" />}
                        {submitted && userAnswers[i] === opt && opt !== q.answer && <X className="inline ml-2 h-4 w-4 text-red-600" />}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {submitted && q.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Submit/Results */}
          {!submitted ? (
            <Button
              onClick={() => setSubmitted(true)}
              size="lg"
              className="w-full"
              disabled={Object.keys(userAnswers).length !== result.quiz.length}
            >
              Submit Quiz
            </Button>
          ) : (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
                  <div>
                    <h3 className="text-3xl font-bold">{calculateScore()}%</h3>
                    <p className="text-muted-foreground">
                      {calculateScore() >= 80 ? "Excellent work! 🎉" :
                       calculateScore() >= 60 ? "Good effort! Keep practicing! 💪" :
                       "Keep learning! You've got this! 🌟"}
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setResult(null)} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Another Quiz
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

