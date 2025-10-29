'use server';
/**
 * @fileOverview This flow generates test preparation materials like quizzes and flashcards.
 *
 * - generateTestPrep - A function that creates test prep materials.
 */

import { generateStructured } from '@/ai/helpers';
import { TEST_PREP_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const TestPrepInputSchema = z.object({
  subject: z.string(),
  topic: z.string(),
  type: z.enum(['quiz', 'flashcards']),
  count: z.number().int().min(1).max(10),
});

const TestPrepOutputSchema = z.object({
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


export async function generateTestPrep(
  input: TestPrepInput
): Promise<TestPrepOutput> {
  // Use constant system prompt for context caching
  let userPrompt = `Generate ${input.type} for the following:
Subject: ${input.subject}
Topic: ${input.topic}
Number of items: ${input.count}

`;

  if (input.type === 'quiz') {
    userPrompt += 'Generate a multiple-choice quiz. Each question should have 4 options and one correct answer.';
  } else if (input.type === 'flashcards') {
    userPrompt += 'Generate flashcards. Each flashcard should have a term and a corresponding definition.';
  }

  return generateStructured({
    messages: [
      { role: 'system', content: TEST_PREP_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: TestPrepOutputSchema,
  });
}
