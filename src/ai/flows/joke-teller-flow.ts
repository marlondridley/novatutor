'use server';
/**
 * @fileOverview This flow generates a kid-friendly joke about a given subject.
 *
 * - tellJoke - A function that returns a joke.
 * - JokeTellerInput - The input type for the tellJoke function.
 * - JokeTellerOutput - The return type for the tellJoke function.
 */

import { generateStructured } from '@/ai/helpers';
import { JOKE_TELLER_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const JokeTellerInputSchema = z.object({
  subject: z.string().describe('The subject for the joke (e.g., Math, Science).'),
});
export type JokeTellerInput = z.infer<typeof JokeTellerInputSchema>;

const JokeTellerOutputSchema = z.object({
  joke: z.string().describe('A kid-friendly joke about the subject.'),
});
export type JokeTellerOutput = z.infer<typeof JokeTellerOutputSchema>;

export async function tellJoke(input: JokeTellerInput): Promise<JokeTellerOutput> {
  // Use constant system prompt for context caching
  const userPrompt = `Tell me a kid-friendly joke about ${input.subject}.`;

  return generateStructured({
    messages: [
      { role: 'system', content: JOKE_TELLER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: JokeTellerOutputSchema,
  });
}
