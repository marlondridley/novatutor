import type { ReactNode } from "react";
import { z } from 'zod';

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: ReactNode;
  sketch?: {
      drawing: string;
      caption: string;
  }
};

export type Subject = "Math" | "Science" | "Writing";


export const TestPrepInputSchema = z.object({
  subject: z.string(),
  topic: z.string(),
  type: z.enum(['quiz', 'flashcards']),
  count: z.number().int().min(1).max(10),
});

export const TestPrepOutputSchema = z.object({
  quiz: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    answer: z.string(),
  })).optional(),
  flashcards: z.array(z.object({
    term: z.string(),
    definition: z.string(),
  })).optional(),
});

export type TestPrepInput = z.infer<typeof TestPrepInputSchema>;
export type TestPrepOutput = z.infer<typeof TestPrepOutputSchema>;
