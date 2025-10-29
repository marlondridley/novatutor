'use server';
/**
 * @fileOverview This file defines a flow for generating personalized learning paths.
 * It takes student performance data and coaching effectiveness as input and returns a tailored learning path.
 *
 * @module src/ai/flows/generate-personalized-learning-path
 * @exports generatePersonalizedLearningPath - An async function that generates a personalized learning path.
 * @exports GeneratePersonalizedLearningPathInput - The input type for the generatePersonalizedLearningPath function.
 * @exports GeneratePersonalizedLearningPathOutput - The output type for the generatePersonalizedLearningPath function.
 */

import { generateStructured } from '@/ai/helpers';
import { LEARNING_PATH_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const GeneratePersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  subject: z.string().describe('The subject for which the learning path is generated (e.g., Math, Science, Writing).'),
  masteryScores: z.record(z.string(), z.number()).describe('A record of mastery scores for different concepts within the subject.'),
  interventionEffectiveness: z.record(z.string(), z.number()).describe('A record of the effectiveness of different coaching interventions.'),
  learningStyle: z.string().optional().describe('The preferred learning style of the student (e.g., visual, auditory, kinesthetic).'),
});

export type GeneratePersonalizedLearningPathInput = z.infer<typeof GeneratePersonalizedLearningPathInputSchema>;

const LearningPathStepSchema = z.object({
  topic: z.string().describe('The topic of the learning path step.'),
  description: z.string().describe('A description of the learning path step.'),
  resources: z.array(z.string()).describe('A list of resources for the learning path step (e.g., links to articles, videos, exercises).'),
  estimatedTime: z.number().describe('The estimated time to complete the learning path step in minutes.'),
});

const GeneratePersonalizedLearningPathOutputSchema = z.object({
  learningPath: z.array(LearningPathStepSchema).describe('A list of learning path steps tailored to the student.'),
  explanation: z.string().describe('An explanation of how the learning path was generated and why it is tailored to the student.'),
});

export type GeneratePersonalizedLearningPathOutput = z.infer<typeof GeneratePersonalizedLearningPathOutputSchema>;


/**
 * Generates a personalized learning path for a student.
 * @param input - The input data for generating the learning path.
 * @returns A promise that resolves to the generated learning path.
 */
export async function generatePersonalizedLearningPath(input: GeneratePersonalizedLearningPathInput): Promise<GeneratePersonalizedLearningPathOutput> {
  // Use constant system prompt for context caching
  const userPrompt = `Generate a personalized learning path for the following student:

Student ID: ${input.studentId}
Subject: ${input.subject}
Mastery Scores: ${JSON.stringify(input.masteryScores, null, 2)}
Intervention Effectiveness: ${JSON.stringify(input.interventionEffectiveness, null, 2)}
Learning Style: ${input.learningStyle || 'Not specified'}`;

  return generateStructured({
    messages: [
      { role: 'system', content: LEARNING_PATH_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: GeneratePersonalizedLearningPathOutputSchema,
  });
}
