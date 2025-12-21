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
  // Context flags for adaptive behavior
  mode: z.enum(['short', 'deep']).optional().default('deep').describe('Response mode: "short" for quick answers, "deep" for detailed explanations'),
  topic: z.string().optional().describe('Specific topic within the subject (e.g., "fractions", "photosynthesis")'),
  grade: z.number().optional().describe('Student grade level (1-12)'),
  confidenceLevel: z.enum(['low', 'medium', 'high']).optional().describe('Student confidence in this topic'),
  efNeeds: z.array(z.string()).optional().describe('Executive function needs (e.g., ["planning", "checking work", "organization"])'),
});
export type ConnectWithSubjectSpecializedTutorInput = z.infer<typeof ConnectWithSubjectSpecializedTutorInputSchema>;

const ConnectWithSubjectSpecializedTutorOutputSchema = z.object({
  tutorResponse: z.string().min(800).describe('The AI educational assistant\u2019s complete tutoring response. MUST include all 7 sections: Acknowledgment, Concept Explanation, Worked Example, Memory Aid, Guided Question, Practice Problem, and Your Turn Instruction. Minimum 800 characters for deep mode.'),
  sketch: z.object({
      drawing: z.string().describe("A simple SVG string for a sketch or diagram that illustrates the concept. The SVG should be clean, minimalist, and use 'currentColor' for strokes to adapt to theme changes."),
      caption: z.string().describe("A brief caption for the sketch.")
  }).optional().describe("An optional sketch to illustrate a math concept."),
});
export type ConnectWithSubjectSpecializedTutorOutput = z.infer<typeof ConnectWithSubjectSpecializedTutorOutputSchema>;

export async function connectWithSubjectSpecializedTutor(
  input: ConnectWithSubjectSpecializedTutorInput
): Promise<ConnectWithSubjectSpecializedTutorOutput> {
  // Build context-aware system prompt
  const contextFlags = buildContextFlags(input);
  const systemPrompt = `${TUTOR_SYSTEM_PROMPT}\n\n${contextFlags}`;

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

/**
 * Build context flags that adapt the AI's behavior without changing the core prompt
 */
function buildContextFlags(input: ConnectWithSubjectSpecializedTutorInput): string {
  const flags: string[] = [];
  
  // Subject specialization
  flags.push(`SUBJECT: ${input.subject}${input.topic ? ` (${input.topic})` : ''}`);
  
  // Mode: SHORT vs DEEP
  if (input.mode === 'short') {
    flags.push(`MODE: SHORT - Keep responses concise (3-4 lines), focus on key concept + one practice question. Voice-friendly.`);
  } else {
    flags.push(`MODE: DEEP - Give comprehensive responses (8-12 lines), include examples, analogies, memory tricks, and multiple practice problems. Rich teaching content.`);
  }
  
  // Grade-appropriate language
  if (input.grade) {
    if (input.grade <= 3) {
      flags.push(`GRADE: ${input.grade} - Use simple words, short sentences, concrete examples (toys, food, animals). Avoid abstract concepts.`);
    } else if (input.grade <= 6) {
      flags.push(`GRADE: ${input.grade} - Use clear language, relatable examples (games, sports, everyday life). Introduce some technical terms with explanations.`);
    } else if (input.grade <= 8) {
      flags.push(`GRADE: ${input.grade} - Use grade-appropriate terminology, real-world applications. Students can handle some complexity.`);
    } else {
      flags.push(`GRADE: ${input.grade} - Use subject-specific terminology, advanced examples, prepare for college-level thinking.`);
    }
  }
  
  // Confidence-based scaffolding
  if (input.confidenceLevel === 'low') {
    flags.push(`CONFIDENCE: LOW - Extra encouragement needed. Start with basics, use more examples, break down into smaller steps. Celebrate small wins.`);
  } else if (input.confidenceLevel === 'medium') {
    flags.push(`CONFIDENCE: MEDIUM - Guide with hints, let them try first. Balance support with independence.`);
  } else if (input.confidenceLevel === 'high') {
    flags.push(`CONFIDENCE: HIGH - Challenge them! Ask extension questions, encourage deeper thinking. Less scaffolding needed.`);
  }
  
  // Executive function support
  if (input.efNeeds && input.efNeeds.length > 0) {
    const efStrategies: string[] = [];
    
    if (input.efNeeds.includes('planning')) {
      efStrategies.push('Help them break problems into steps before starting');
    }
    if (input.efNeeds.includes('checking work')) {
      efStrategies.push('Remind them to check their work at the end');
    }
    if (input.efNeeds.includes('organization')) {
      efStrategies.push('Suggest organizing information (lists, diagrams)');
    }
    if (input.efNeeds.includes('focus')) {
      efStrategies.push('Keep responses structured and clear');
    }
    if (input.efNeeds.includes('time management')) {
      efStrategies.push('Suggest time estimates for practice problems');
    }
    
    if (efStrategies.length > 0) {
      flags.push(`EXECUTIVE FUNCTION SUPPORT: ${efStrategies.join('; ')}.`);
    }
  }
  
  return '---\nCONTEXT FLAGS (Adapt your response accordingly):\n' + flags.join('\n') + '\n---';
}
