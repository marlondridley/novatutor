'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Book, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateTestPrepAction } from '@/lib/actions';
import type {
  TestPrepOutput,
  TestPrepInput,
} from '@/ai/flows/test-prep-flow';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import type { Subject } from '@/lib/types';

interface TestPrepProps {
  subject: Subject;
  topic: string;
}

const formSchema = z.object({
  topic: z.string().min(3, 'Topic is required.'),
  type: z.enum(['quiz', 'flashcards']),
  count: z.coerce.number().min(1, 'At least 1 item is required.').max(10),
});

type TestPrepFormValues = z.infer<typeof formSchema>;

export function TestPrep({ subject, topic }: TestPrepProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestPrepOutput | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<TestPrepFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: topic || '',
      type: 'quiz',
      count: 5,
    },
  });
  
  useEffect(() => {
    form.reset({ topic: topic || '', type: 'quiz', count: 5 });
  }, [topic, form]);

  const onSubmit = async (data: TestPrepFormValues) => {
    setLoading(true);
    setResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    const input: TestPrepInput = { subject, ...data };
    const response = await generateTestPrepAction(input);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: response.error,
      });
    }
    setLoading(false);
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };
  
  const calculateScore = () => {
    if (!result?.quiz) return 0;
    let correct = 0;
    result.quiz.forEach((q, i) => {
        if (quizAnswers[i] === q.answer) {
            correct++;
        }
    });
    return (correct / result.quiz.length) * 100;
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Photosynthesis" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="flashcards">Flashcards</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {result && (
        <div className="mt-6">
          {result.flashcards && (
            <Carousel className="w-full max-w-md mx-auto">
              <CarouselContent>
                {result.flashcards.map((card, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="h-64 flex items-center justify-center p-6 flip-card">
                        <div className="flip-card-inner">
                          <CardContent className="flip-card-front text-center">
                            <p className="text-xl font-semibold">{card.term}</p>
                          </CardContent>
                          <CardContent className="flip-card-back text-center">
                             <p>{card.definition}</p>
                          </CardContent>
                        </div>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}

          {result.quiz && (
             <div className="space-y-4">
                {result.quiz.map((q, i) => (
                    <Card key={i} className={cn("p-4", quizSubmitted && (quizAnswers[i] === q.answer ? "border-green-500" : "border-red-500"))}>
                        <p className="font-semibold mb-2">{i+1}. {q.question}</p>
                         <RadioGroup onValueChange={(val) => handleQuizAnswer(i, val)} disabled={quizSubmitted}>
                            {q.options.map((opt, j) => (
                                <div key={j} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`q${i}o${j}`} />
                                    <Label htmlFor={`q${i}o${j}`}>{opt}</Label>
                                    {quizSubmitted && opt === q.answer && <Check className="w-4 h-4 text-green-500"/>}
                                    {quizSubmitted && quizAnswers[i] === opt && opt !== q.answer && <X className="w-4 h-4 text-red-500"/>}
                                </div>
                            ))}
                        </RadioGroup>
                    </Card>
                ))}
                 {!quizSubmitted ? (
                    <Button onClick={() => setQuizSubmitted(true)}>Submit Quiz</Button>
                 ) : (
                    <div className="text-center font-bold text-lg">
                        You scored {calculateScore().toFixed(0)}%!
                    </div>
                 )}
            </div>
          )}
           <Button onClick={() => setResult(null)} variant="outline" className="mt-4">
            Create New
          </Button>
        </div>
      )}
      <style jsx>{`
        .flip-card {
          background-color: transparent;
          perspective: 1000px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner, .flip-card:focus-within .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
