
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
    
    const response = await createHomeworkPlanAction({
      studentName: user?.name || "Student",
      studentId: studentId,
      ...data,
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
