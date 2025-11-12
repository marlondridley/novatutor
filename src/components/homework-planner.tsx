
"use client";

import { useState, useContext } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Plus, Trash2, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createHomeworkPlanAction } from "@/lib/actions";
import type { HomeworkPlannerOutput } from "@/ai/flows/homework-planner-flow";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AppStateContext } from "@/context/app-state-context";
import { useAuth } from "@/context/auth-context";
import { VoiceToTextPremium } from "@/components/voice-to-text-premium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  tasks: z.array(z.object({
    subject: z.string().min(1, "Subject is required."),
    topic: z.string().min(1, "Topic is required."),
    estimatedTime: z.coerce.number().min(1, "Time must be greater than 0."),
  })).min(1, "Please add at least one task."),
});

type HomeworkFormValues = z.infer<typeof formSchema>;

export function HomeworkPlanner() {
  const { setHasCompletedPlanner } = useContext(AppStateContext);
  const { user, supabaseUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<HomeworkPlannerOutput | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<string>("");
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

  const onSubmit = async (data: HomeworkFormValues) => {
    setLoading(true);
    setPlan(null);
    
    // Get studentId from user profile if available, otherwise use user id
    const studentId = user?.student_id || supabaseUser?.id;
    
    // If using voice notes, create tasks from the transcript
    let tasksToSubmit = data.tasks;
    if (voiceNotes && voiceNotes.trim().length > 0) {
      // For now, pass voice notes as a single task
      // In the future, you could use AI to parse this into multiple tasks
      tasksToSubmit = [{
        subject: "Voice Notes",
        topic: voiceNotes,
        estimatedTime: 30
      }];
    }
    
    const response = await createHomeworkPlanAction({
      studentName: user?.name || "Student",
      studentId: studentId,
      tasks: tasksToSubmit,
    });

    if (response.success && response.data) {
      setPlan(response.data);
      setHasCompletedPlanner(true);
    } else {
      toast({
        variant: "destructive",
        title: "Planning Failed",
        description: response.error,
      });
    }
    setLoading(false);
  };
  
  const handleCreateNewPlan = () => {
    setPlan(null);
    form.reset();
    setVoiceNotes("");
    setHasCompletedPlanner(false);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Wand2 /> 🧭 Focus Plan</CardTitle>
        <CardDescription>
          Let's map your focus time. You decide what to study — I'll help you make it doable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!plan ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Voice or Type Tabs */}
                <Tabs defaultValue="type" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="type">✍️ Type It In</TabsTrigger>
                    <TabsTrigger value="voice">🎤 Talk It Out</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="type" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Add your tasks below — we'll help you stay focused, not overwhelmed.
                    </p>
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start p-4 border rounded-lg bg-background/50">
                    <FormField
                        control={form.control}
                        name={`tasks.${index}.subject`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Math" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`tasks.${index}.topic`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Topic</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Algebra homework" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`tasks.${index}.estimatedTime`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time (minutes)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 30" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="mt-8"
                        disabled={fields.length === 1}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove task</span>
                    </Button>
                    </div>
                ))}
                </div>
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" onClick={() => append({ subject: "", topic: "", estimatedTime: 30 })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your plan...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Make My Focus Plan</>
                        )}
                    </Button>
                </div>
                  </TabsContent>
                  
                  <TabsContent value="voice" className="space-y-4 mt-4">
                    <VoiceToTextPremium 
                      onTranscript={setVoiceNotes}
                      title="🎙️ Just talk — we'll help organize it"
                      description="Explain what you're working on, and I'll help turn it into a clear focus plan."
                      placeholder="Example: 'I have algebra homework on chapter 3, and I need to write an essay for English...'"
                    />
                    
                    {voiceNotes && (
                      <div className="p-4 bg-accent/10 rounded-lg border">
                        <p className="text-sm font-medium mb-2">✨ Your notes:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{voiceNotes}</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          💡 Tip: Switch to "Type It In" to manually add these as tasks, or let me generate a plan based on what you said.
                        </p>
                      </div>
                    )}
                    
                    <Button type="submit" disabled={loading || !voiceNotes} className="w-full">
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building your plan...</>
                      ) : (
                        <><Sparkles className="mr-2 h-4 w-4" /> Make My Focus Plan</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
            </form>
            </Form>
        ) : (
            <div className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-900 dark:text-green-100">✨ Your Focus Plan is Ready!</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-300">{plan.summary}</AlertDescription>
                </Alert>
                <div className="space-y-4">
                    {plan.plan.map((task, index) => (
                        <Card key={index} className="bg-background/50">
                            <CardHeader>
                                <CardTitle className="text-base">Today's Focus: {task.subject} — {task.topic}</CardTitle>
                                <CardDescription>Estimated Time: {task.estimatedTime} minutes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="italic text-sm text-muted-foreground">💬 {task.encouragement}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <Button onClick={handleCreateNewPlan} variant="outline">Make a New Focus Plan</Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
