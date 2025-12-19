"use client";

import { useState } from "react";
import { Lightbulb, Book, Clock, Loader2, Sparkles, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getLearningPath } from "@/lib/actions";
import type { GeneratePersonalizedLearningPathOutput } from "@/ai/flows/generate-personalized-learning-path";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { VoiceToTextPremium } from "@/components/voice-to-text-premium";
import { Mic, MessageCircle } from "lucide-react";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  learningStyle: z.string().optional(),
  gradeLevel: z.string().optional(),
  currentUnderstanding: z.number().min(0).max(100).optional(),
  specificTopics: z.string().optional(),
  learningGoals: z.string().optional(),
  timeAvailable: z.number().min(1).max(40).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PersonalizedLearningPath() {
  const { user, supabaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<GeneratePersonalizedLearningPathOutput | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [voiceInputText, setVoiceInputText] = useState<string>('');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      learningStyle: "visual",
      gradeLevel: "",
      currentUnderstanding: 50,
      specificTopics: "",
      learningGoals: "",
      timeAvailable: 5,
    },
  });

  const handleGeneratePath = async (data: FormValues) => {
    if (!user && !supabaseUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to generate a learning path.",
      });
      return;
    }

    setLoading(true);
    setPath(null);

    // Get studentId from user profile or use user ID as fallback
    const studentId = user?.student_id || supabaseUser?.id || user?.id || "unknown";

    // Use current understanding to adjust mastery scores
    const understandingScore = (data.currentUnderstanding || 50) / 100;
    const masteryScores: Record<string, number> = {
      "Introduction": Math.min(1, understandingScore + 0.2),
      "Basic Concepts": understandingScore,
      "Intermediate Topics": Math.max(0, understandingScore - 0.2),
      "Advanced Concepts": Math.max(0, understandingScore - 0.3),
    };

    // Adjust intervention effectiveness based on learning style
    const interventionEffectiveness: Record<string, number> = {
      "Visual Aids": data.learningStyle === "visual" ? 0.95 : 0.85,
      "Practice Problems": 0.92,
      "Concept Videos": data.learningStyle === "visual" || data.learningStyle === "auditory" ? 0.92 : 0.85,
      "Interactive Exercises": data.learningStyle === "kinesthetic" ? 0.95 : 0.90,
      "Reading Materials": data.learningStyle === "reading" ? 0.95 : 0.80,
    };

    const input = {
      studentId,
      subject: data.subject,
      masteryScores,
      interventionEffectiveness,
      learningStyle: data.learningStyle || "visual",
      userId: user?.id || supabaseUser?.id,
      // Pass additional user inputs
      gradeLevel: data.gradeLevel,
      currentUnderstanding: data.currentUnderstanding,
      specificTopics: data.specificTopics,
      learningGoals: data.learningGoals,
      timeAvailable: data.timeAvailable,
      // Pass voice input to AI
      voiceInput: voiceInputText || undefined,
    };

    const response = await getLearningPath(input);
    if (response.success && response.data) {
      setPath(response.data);
      toast({
        title: "Learning Path Generated",
        description: `Your personalized learning path for ${data.subject} is ready!`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate learning path. Please try again.",
      });
    }
    setLoading(false);
  };

  // Handle voice transcript from Speak to Coach button
  const handleVoiceTranscript = async (text: string) => {
    if (text.trim().length < 20) {
      toast({
        title: "Tell me more",
        description: "Please provide more details about your learning goals, subject, and what you'd like to learn.",
      });
      return;
    }

    // Store voice input in form (will be passed to AI)
    // Store in a hidden field or use it directly when generating the path
    const lowerText = text.toLowerCase();
    
    // Extract subject (common subjects)
    const subjects = ['math', 'science', 'english', 'history', 'writing', 'algebra', 'geometry', 'biology', 'chemistry', 'physics'];
    const foundSubject = subjects.find(s => lowerText.includes(s));
    if (foundSubject) {
      form.setValue('subject', foundSubject.charAt(0).toUpperCase() + foundSubject.slice(1));
    }

    // Extract grade level
    const gradeMatch = lowerText.match(/(\d+)(?:th|rd|st|nd)?\s*grade/);
    if (gradeMatch) {
      form.setValue('gradeLevel', gradeMatch[1]);
    }

    // Extract topics (text after "topic" or "topics")
    const topicsMatch = text.match(/topic[s]?[:\s]+(.+?)(?:\.|$|goal|time)/i);
    if (topicsMatch) {
      form.setValue('specificTopics', topicsMatch[1].trim());
    }

    // Extract learning goals (text after "goal" or "goals")
    const goalsMatch = text.match(/goal[s]?[:\s]+(.+?)(?:\.|$|time|topic)/i);
    if (goalsMatch) {
      form.setValue('learningGoals', goalsMatch[1].trim());
    }

    // Extract time available (number followed by hours/week)
    const timeMatch = text.match(/(\d+)\s*(?:hours?|hrs?|hr)/i);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      if (hours >= 1 && hours <= 40) {
        form.setValue('timeAvailable', hours);
      }
    }

    // Extract current understanding (percentage or words like "beginner", "intermediate", "advanced")
    if (lowerText.includes('beginner') || lowerText.includes('new to') || lowerText.includes('just starting')) {
      form.setValue('currentUnderstanding', 25);
    } else if (lowerText.includes('intermediate') || lowerText.includes('somewhat') || lowerText.includes('familiar')) {
      form.setValue('currentUnderstanding', 50);
    } else if (lowerText.includes('advanced') || lowerText.includes('experienced') || lowerText.includes('know a lot')) {
      form.setValue('currentUnderstanding', 75);
    }

    // Extract learning style
    if (lowerText.includes('visual') || lowerText.includes('see') || lowerText.includes('watch')) {
      form.setValue('learningStyle', 'visual');
    } else if (lowerText.includes('auditory') || lowerText.includes('listen') || lowerText.includes('hear')) {
      form.setValue('learningStyle', 'auditory');
    } else if (lowerText.includes('kinesthetic') || lowerText.includes('hands-on') || lowerText.includes('practice')) {
      form.setValue('learningStyle', 'kinesthetic');
    } else if (lowerText.includes('read') || lowerText.includes('reading')) {
      form.setValue('learningStyle', 'reading');
    }

    // Store voice input to pass to AI
    setVoiceInputText(text);

    toast({
      title: "Form populated!",
      description: "I've filled in the form based on what you said. Review and click 'Generate Learning Path' when ready.",
    });

    setShowVoiceInput(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <Sparkles className="h-5 w-5" />
              🎯 Your Personalized Learning Journey
            </CardTitle>
            <CardDescription>
              We'll build a path based on you — your style, pace, and goals. There's no rush. Just progress.
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowVoiceInput(!showVoiceInput)}
            size="sm"
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-500 hover:border-orange-600"
          >
            <Mic className={`h-4 w-4 ${showVoiceInput ? 'animate-pulse' : ''}`} />
            {showVoiceInput ? 'Stop Voice' : 'Speak to Coach'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Speak to Coach Voice Input */}
        {showVoiceInput && (
          <div className="mb-4">
            <VoiceToTextPremium
              onTranscript={handleVoiceTranscript}
              title="🎙️ Tell me about your learning journey"
              description="Speak about what subject you want to learn, your grade level, what topics you're interested in, your learning goals, and how much time you have per week."
              placeholder="Your learning details will appear here as you speak..."
              autoStart={true}
            />
          </div>
        )}

        {!path && (
          <form onSubmit={form.handleSubmit(handleGeneratePath)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">What subject do you want to explore today?</Label>
              <Input
                id="subject"
                placeholder="e.g., Math, Science, English, History"
                {...form.register("subject")}
                disabled={loading}
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Choose your grade (or skip if unsure)</Label>
                <Select
                  value={form.watch("gradeLevel")}
                  onValueChange={(value) => form.setValue("gradeLevel", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Your grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                    <SelectItem value="middle">Middle School (6-8)</SelectItem>
                    <SelectItem value="high">High School (9-12)</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                    <SelectItem value="adult">Adult Learner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningStyle">How do you like to learn?</Label>
                <Select
                  value={form.watch("learningStyle")}
                  onValueChange={(value) => form.setValue("learningStyle", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Your learning style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual (pictures, diagrams)</SelectItem>
                    <SelectItem value="auditory">Auditory (listening, discussing)</SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic (hands-on, doing)</SelectItem>
                    <SelectItem value="reading">Reading/Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentUnderstanding">
                  How confident do you feel right now?
                </Label>
                <Badge variant="secondary">{form.watch("currentUnderstanding") || 50}%</Badge>
              </div>
              <Slider
                id="currentUnderstanding"
                min={0}
                max={100}
                step={5}
                value={[form.watch("currentUnderstanding") || 50]}
                onValueChange={(value) => form.setValue("currentUnderstanding", value[0])}
                disabled={loading}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Just starting</span>
                <span>I could teach this!</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specificTopics">Which topics challenge you or spark your curiosity?</Label>
              <Textarea
                id="specificTopics"
                placeholder="e.g., Quadratic equations, Photosynthesis, Essay writing..."
                {...form.register("specificTopics")}
                disabled={loading}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learningGoals">What would you love to achieve?</Label>
              <Textarea
                id="learningGoals"
                placeholder="e.g., Feel ready for a test, understand fractions, enjoy reading again..."
                {...form.register("learningGoals")}
                disabled={loading}
                rows={2}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground italic">
                💡 You don't need to know everything — this just helps me understand how to guide you.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="timeAvailable">
                  Study Time Available (Optional)
                </Label>
                <Badge variant="secondary">{form.watch("timeAvailable") || 5} hrs/week</Badge>
              </div>
              <Slider
                id="timeAvailable"
                min={1}
                max={40}
                step={1}
                value={[form.watch("timeAvailable") || 5]}
                onValueChange={(value) => form.setValue("timeAvailable", value[0])}
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How many hours per week can you dedicate to studying this subject?
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Building your path...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start My Journey
                </>
              )}
            </Button>
          </form>
        )}
        
        {path && (
            <div className="space-y-4">
                {/* Notes Prompt */}
                {path.notesPrompt && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex-row items-start gap-4">
                      <FileQuestion className="w-6 h-6 mt-1 text-blue-600 dark:text-blue-400"/>
                      <div className="flex-1">
                        <CardTitle className="text-blue-900 dark:text-blue-100">Share Your Materials</CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">{path.notesPrompt}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {/* Pre-Assessment */}
                {path.preAssessment && path.preAssessment.length > 0 && (
                  <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                        <Sparkles className="w-5 h-5" />
                        Knowledge Check
                      </CardTitle>
                      <CardDescription className="text-amber-700 dark:text-amber-300">
                        Answer these questions to help us understand your current level
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {path.preAssessment.map((q, idx) => (
                        <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <p className="font-medium text-sm mb-1">Question {idx + 1}: {q.question}</p>
                          <p className="text-xs text-muted-foreground italic">Purpose: {q.purpose}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Path Rationale */}
                <Card className="bg-accent/30">
                    <CardHeader className="flex-row items-start gap-4">
                        <Lightbulb className="w-8 h-8 mt-1 text-accent-foreground"/>
                        <div>
                            <CardTitle>Path Rationale</CardTitle>
                            <CardDescription>{path.explanation}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

                {/* Learning Path Steps */}
                <Accordion type="single" collapsible className="w-full">
                    {path.learningPath.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{index + 1}. {step.topic}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pl-2">
                               <p className="text-muted-foreground">{step.description}</p>
                               
                               {/* Examples */}
                               {step.examples && step.examples.length > 0 && (
                                 <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                   <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-900 dark:text-green-100">
                                     <Lightbulb className="w-4 h-4"/> 
                                     Worked Examples
                                   </h4>
                                   <div className="space-y-3">
                                     {step.examples.map((example, eIdx) => (
                                       <div key={eIdx} className="bg-white dark:bg-gray-900 p-3 rounded border">
                                         <p className="text-sm font-medium mb-1">Example {eIdx + 1}:</p>
                                         <p className="text-sm whitespace-pre-wrap">{example}</p>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}

                               {/* Practice Questions */}
                               {step.practiceQuestions && step.practiceQuestions.length > 0 && (
                                 <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                   <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                     <FileQuestion className="w-4 h-4"/> 
                                     Practice Questions
                                   </h4>
                                   <div className="space-y-2">
                                     {step.practiceQuestions.map((question, qIdx) => (
                                       <div key={qIdx} className="bg-white dark:bg-gray-900 p-3 rounded border">
                                         <p className="text-sm">Q{qIdx + 1}: {question}</p>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}

                               <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Estimated time: {step.estimatedTime} minutes</span>
                               </div>
                               
                               <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><Book className="w-4 h-4"/> Resources:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {step.resources.map((resource, rIndex) => (
                                        <a href={resource} target="_blank" rel="noopener noreferrer" key={rIndex}>
                                            <Badge variant="secondary" className="hover:bg-primary/10 transition-colors">{resource}</Badge>
                                        </a>
                                    ))}
                                </div>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {path && (
          <Button
            variant="outline"
            onClick={() => {
              setPath(null);
              form.reset();
            }}
          >
            Create New Plan
          </Button>
        )}
        {!path && (
          <Button
            onClick={form.handleSubmit(handleGeneratePath)}
            disabled={loading || !form.watch("subject")}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Learning Path
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
