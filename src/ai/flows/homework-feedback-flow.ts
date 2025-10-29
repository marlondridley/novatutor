'use server';
/**
 * @fileOverview This flow provides feedback on a student's homework from an image.
 *
 * - getHomeworkFeedback - A function that analyzes a homework image and provides feedback.
 * - HomeworkFeedbackInput - The input type for the getHomeworkFeedback function.
 * - HomeworkFeedbackOutput - The return type for the getHomeworkFeedback function.
 */

import { generateStructured, buildUserMessage } from '@/ai/helpers';
import { HOMEWORK_FEEDBACK_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const HomeworkFeedbackInputSchema = z.object({
  homeworkImage: z
    .string()
    .describe(
      "A photo of the student's homework, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  subject: z.string().describe('The subject of the homework (e.g., Math, Science).'),
});
export type HomeworkFeedbackInput = z.infer<typeof HomeworkFeedbackInputSchema>;

const HomeworkFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback on the homework.'),
  needsIllustration: z.boolean().describe('Whether the AI suggests generating an illustration to help explain a concept.'),
  illustrationTopic: z.string().optional().describe('The topic for which an illustration is suggested.'),
});
export type HomeworkFeedbackOutput = z.infer<typeof HomeworkFeedbackOutputSchema>;

export async function getHomeworkFeedback(
  input: HomeworkFeedbackInput
): Promise<HomeworkFeedbackOutput> {
  // Use constant system prompt for context caching, append subject dynamically
  const systemPrompt = `${HOMEWORK_FEEDBACK_SYSTEM_PROMPT}\n\nSubject: ${input.subject}`;

  const userMessage = buildUserMessage(
    "Please analyze this homework and provide feedback.",
    input.homeworkImage
  );

  return generateStructured({
    messages: [
      { role: 'system', content: systemPrompt },
      userMessage,
    ],
    schema: HomeworkFeedbackOutputSchema,
  });
}
