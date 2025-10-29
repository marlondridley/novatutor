'use server';
/**
 * @fileOverview This file defines a flow for routing students to subject-specialized AI educational assistants.
 *
 * - `connectWithSubjectSpecializedTutor`:  A function to connect a student with an AI educational assistant specializing in a specific subject.
 * - `ConnectWithSubjectSpecializedTutorInput`: The input type for the `connectWithSubjectSpecializedTutor` function.
 * - `ConnectWithSubjectSpecializedTutorOutput`: The output type for the `connectWithSubjectSpecializedTutor` function.
 */

import { generateStructured, buildUserMessage } from '@/ai/helpers';
import { TUTOR_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const ConnectWithSubjectSpecializedTutorInputSchema = z.object({
  subject: z.string().describe('The subject the student needs help with (e.g., math, science, writing).'),
  studentQuestion: z.string().describe('The student\u2019s specific question or topic of inquiry.'),
   homeworkImage: z
    .string()
    .optional()
    .describe(
      "An optional photo of the student's homework, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConnectWithSubjectSpecializedTutorInput = z.infer<typeof ConnectWithSubjectSpecializedTutorInputSchema>;

const ConnectWithSubjectSpecializedTutorOutputSchema = z.object({
  tutorResponse: z.string().describe('The AI educational assistant\u2019s response to the student\u2019s question.'),
  sketch: z.object({
      drawing: z.string().describe("A simple SVG string for a sketch or diagram that illustrates the concept. The SVG should be clean, minimalist, and use 'currentColor' for strokes to adapt to theme changes."),
      caption: z.string().describe("A brief caption for the sketch.")
  }).optional().describe("An optional sketch to illustrate a math concept."),
});
export type ConnectWithSubjectSpecializedTutorOutput = z.infer<typeof ConnectWithSubjectSpecializedTutorOutputSchema>;

export async function connectWithSubjectSpecializedTutor(
  input: ConnectWithSubjectSpecializedTutorInput
): Promise<ConnectWithSubjectSpecializedTutorOutput> {
  // Use constant system prompt for context caching optimization
  const systemPrompt = `${TUTOR_SYSTEM_PROMPT}\n\nYou are specializing in ${input.subject}.`;

  let userPromptText = `A student has a question: "${input.studentQuestion}"`;
  
  if (input.homeworkImage) {
    userPromptText += `\n\nThe student has also provided an image of their handwritten work.`;
  }

  const userMessage = buildUserMessage(userPromptText, input.homeworkImage);

  return generateStructured({
    messages: [
      { role: 'system', content: systemPrompt },
      userMessage,
    ],
    schema: ConnectWithSubjectSpecializedTutorOutputSchema,
  });
}
