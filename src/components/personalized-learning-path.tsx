"use client";

import { useState } from "react";
import { Lightbulb, Book, Clock, Loader2, Sparkles } from "lucide-react";
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

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  learningStyle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PersonalizedLearningPath() {
  const { user, supabaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<GeneratePersonalizedLearningPathOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      learningStyle: "visual",
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

    // Default mastery scores - can be customized later
    const defaultMasteryScores: Record<string, number> = {
      "Introduction": 0.5,
      "Basic Concepts": 0.6,
      "Intermediate Topics": 0.4,
      "Advanced Concepts": 0.3,
    };

    // Default intervention effectiveness
    const defaultInterventionEffectiveness: Record<string, number> = {
      "Visual Aids": 0.85,
      "Practice Problems": 0.92,
      "Concept Videos": 0.88,
      "Interactive Exercises": 0.90,
    };

    const input = {
      studentId,
      subject: data.subject,
      masteryScores: defaultMasteryScores,
      interventionEffectiveness: defaultInterventionEffectiveness,
      learningStyle: data.learningStyle || "visual",
      userId: user?.id || supabaseUser?.id,
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
        description: response.error || "Failed to generate learning path. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Personalized Learning Path
        </CardTitle>
        <CardDescription>
          Generate a custom learning path based on your subject and learning style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!path && (
          <form onSubmit={form.handleSubmit(handleGeneratePath)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
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

            <div className="space-y-2">
              <Label htmlFor="learningStyle">Learning Style (Optional)</Label>
              <Select
                value={form.watch("learningStyle")}
                onValueChange={(value) => form.setValue("learningStyle", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your learning style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                  <SelectItem value="reading">Reading/Writing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is crafting your personalized learning path...
              </div>
            )}
          </form>
        )}
        
        {path && (
            <div className="space-y-4">
                <Card className="bg-accent/30">
                    <CardHeader className="flex-row items-start gap-4">
                        <Lightbulb className="w-8 h-8 mt-1 text-accent-foreground"/>
                        <div>
                            <CardTitle>Path Rationale</CardTitle>
                            <CardDescription>{path.explanation}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                <Accordion type="single" collapsible className="w-full">
                    {path.learningPath.map((step, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-lg font-semibold">{index + 1}. {step.topic}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pl-2">
                               <p>{step.description}</p>
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
