"use client";

import { useState } from "react";
import { Lightbulb, Book, Clock } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { getLearningPath } from "@/lib/actions";
import { learningPathInput } from "@/lib/data";
import type { GeneratePersonalizedLearningPathOutput } from "@/ai/flows/generate-personalized-learning-path";
import { Badge } from "@/components/ui/badge";

export function PersonalizedLearningPath() {
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<GeneratePersonalizedLearningPathOutput | null>(null);
  const { toast } = useToast();

  const handleGeneratePath = async () => {
    setLoading(true);
    setPath(null);
    const response = await getLearningPath(learningPathInput);
    if (response.success && response.data) {
      setPath(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: response.error,
      });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Learning Path</CardTitle>
        <CardDescription>
          Generate a custom learning path based on your performance and learning
          style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!path && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
             <p>Click the button below to generate your personalized learning path for Math.</p>
          </div>
        )}
        {loading && <p className="text-center text-sm text-muted-foreground">AI is crafting your learning path...</p>}
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
      <CardFooter>
        <Button onClick={handleGeneratePath} disabled={loading}>
          {loading ? "Generating..." : path ? "Regenerate Learning Path" : "Generate Learning Path"}
        </Button>
      </CardFooter>
    </Card>
  );
}
