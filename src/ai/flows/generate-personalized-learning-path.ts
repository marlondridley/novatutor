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
import { searchEducationalContent, formatRAGContext, isRAGConfigured } from '@/lib/rag-pipeline';
import { z } from 'zod';

const GeneratePersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  subject: z.string().describe('The subject for which the learning path is generated (e.g., Math, Science, Writing).'),
  masteryScores: z.record(z.string(), z.number()).describe('A record of mastery scores for different concepts within the subject.'),
  interventionEffectiveness: z.record(z.string(), z.number()).describe('A record of the effectiveness of different coaching interventions.'),
  learningStyle: z.string().optional().describe('The preferred learning style of the student (e.g., visual, auditory, kinesthetic).'),
  gradeLevel: z.string().optional().describe('The grade level of the student (e.g., elementary, middle, high, college).'),
  currentUnderstanding: z.number().optional().describe('Self-assessed understanding level from 0-100.'),
  specificTopics: z.string().optional().describe('Specific topics the student wants to focus on or is struggling with.'),
  learningGoals: z.string().optional().describe('What the student wants to achieve with this learning path.'),
  timeAvailable: z.number().optional().describe('Hours per week the student can dedicate to studying this subject.'),
});

export type GeneratePersonalizedLearningPathInput = z.infer<typeof GeneratePersonalizedLearningPathInputSchema>;

const LearningPathStepSchema = z.object({
  topic: z.string().describe('The topic of the learning path step.'),
  description: z.string().describe('A description of the learning path step.'),
  examples: z.array(z.string()).describe('2-3 concrete examples demonstrating the concept with step-by-step solutions.'),
  resources: z.array(z.string()).describe('A list of resources for the learning path step (e.g., links to articles, videos, exercises).'),
  estimatedTime: z.number().describe('The estimated time to complete the learning path step in minutes.'),
  practiceQuestions: z.array(z.string()).describe('2-3 practice questions to test understanding of this topic.'),
});

const KnowledgeCheckQuestionSchema = z.object({
  question: z.string().describe('A diagnostic question to assess current knowledge.'),
  purpose: z.string().describe('What this question reveals about the student\'s understanding.'),
});

const GeneratePersonalizedLearningPathOutputSchema = z.object({
  preAssessment: z.array(KnowledgeCheckQuestionSchema).describe('3-5 questions to assess current knowledge before starting the path.'),
  learningPath: z.array(LearningPathStepSchema).describe('A list of learning path steps tailored to the student.'),
  explanation: z.string().describe('An explanation of how the learning path was generated and why it is tailored to the student.'),
  notesPrompt: z.string().describe('A friendly prompt asking the student to upload any existing notes or materials they have on this subject.'),
});

export type GeneratePersonalizedLearningPathOutput = z.infer<typeof GeneratePersonalizedLearningPathOutputSchema>;


/**
 * Generates a personalized learning path for a student.
 * @param input - The input data for generating the learning path.
 * @returns A promise that resolves to the generated learning path.
 */
export async function generatePersonalizedLearningPath(input: GeneratePersonalizedLearningPathInput): Promise<GeneratePersonalizedLearningPathOutput> {
  // Use constant system prompt for context caching
  let userPrompt = `Generate a personalized learning path for the following student:

Student ID: ${input.studentId}
Subject: ${input.subject}
Grade Level: ${input.gradeLevel || 'Not specified'}
Learning Style: ${input.learningStyle || 'Not specified'}
Current Understanding: ${input.currentUnderstanding !== undefined ? `${input.currentUnderstanding}% (Self-assessed)` : 'Not specified'}
Time Available: ${input.timeAvailable ? `${input.timeAvailable} hours per week` : 'Not specified'}

${input.specificTopics ? `Specific Topics to Focus On:\n${input.specificTopics}\n` : ''}
${input.learningGoals ? `Learning Goals:\n${input.learningGoals}\n` : ''}

Mastery Scores (derived from understanding level):
${JSON.stringify(input.masteryScores, null, 2)}

Intervention Effectiveness (adjusted for learning style):
${JSON.stringify(input.interventionEffectiveness, null, 2)}

Please create a comprehensive learning path that includes:

**PRE-ASSESSMENT (3-5 questions):**
- Generate diagnostic questions to check their current knowledge
- Each question should reveal specific gaps or strengths
- Questions should be appropriate for ${input.gradeLevel || 'their grade level'}

**NOTES PROMPT:**
- Create a friendly, encouraging message asking them to share any existing notes, worksheets, or study materials
- Explain how their materials will help personalize their learning experience

**LEARNING PATH (4-6 steps):**
For each step, include:
1. **Topic & Description**: Clear, engaging explanation
2. **Concrete Examples (2-3)**: Real, worked-out examples with step-by-step solutions
3. **Practice Questions (2-3)**: Questions to test understanding
4. **Resources**: Specific, actionable resources
5. **Estimated Time**: Realistic time commitment

The learning path should:
- Match their ${input.gradeLevel || 'grade'} level and ${input.currentUnderstanding || 50}% understanding
- Focus on: ${input.specificTopics || 'core concepts'}
- Help achieve: ${input.learningGoals || 'mastery and confidence'}
- Fit within ${input.timeAvailable || 'flexible'} hours/week
- Use ${input.learningStyle || 'varied'} learning methods

**IMPORTANT**: 
- Make examples VERY concrete with actual numbers and solutions
- Practice questions should gradually increase in difficulty
- Pre-assessment should diagnose, not discourage`;

  // Enhance with RAG if configured
  if (isRAGConfigured()) {
    try {
      const ragResults = await searchEducationalContent(
        `${input.subject} learning path ${Object.keys(input.masteryScores).join(' ')}`,
        {
          subject: input.subject,
        }
      );
      
      if (ragResults.length > 0) {
        const ragContext = formatRAGContext(ragResults);
        userPrompt += ragContext;
      }
    } catch (error) {
      // Non-blocking: continue without RAG if search fails
      const { logger } = await import('@/lib/logger');
      logger.warn('RAG search failed, continuing without additional context', {
        subject: input.subject,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return generateStructured({
    messages: [
      { role: 'system', content: LEARNING_PATH_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: GeneratePersonalizedLearningPathOutputSchema,
  });
}
