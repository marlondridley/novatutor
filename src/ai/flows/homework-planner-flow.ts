'use server';
/**
 * @fileOverview This flow helps a student create a homework plan.
 *
 * - createHomeworkPlan - A function that guides the student through creating a plan.
 * - HomeworkPlannerInput - The input type for the createHomeworkPlan function.
 * - HomeworkPlannerOutput - The return type for the createHomeworkPlan function.
 */

import { generateStructured } from '@/ai/helpers';
import { HOMEWORK_PLANNER_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const HomeworkTaskSchema = z.object({
    subject: z.string().describe('The subject of the homework (e.g., Math, Science).'),
    topic: z.string().describe('The specific topic of the homework.'),
    estimatedTime: z.number().describe('The estimated time in minutes to complete the task.'),
});

const HomeworkPlannerInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  tasks: z.array(HomeworkTaskSchema).describe('A list of homework tasks.'),
});
export type HomeworkPlannerInput = z.infer<typeof HomeworkPlannerInputSchema>;

const HomeworkPlannerOutputSchema = z.object({
  plan: z.array(z.object({
    subject: z.string(),
    topic: z.string(),
    estimatedTime: z.number(),
    encouragement: z.string().describe('Encouraging words and a thought-provoking question about the topic.'),
  })).describe('The structured homework plan with encouragement.'),
  summary: z.string().describe('A summary of the plan and some final encouraging words.'),
});
export type HomeworkPlannerOutput = z.infer<typeof HomeworkPlannerOutputSchema>;

export async function createHomeworkPlan(
  input: HomeworkPlannerInput
): Promise<HomeworkPlannerOutput> {
  // Use constant system prompt for context caching
  const tasksList = input.tasks
    .map(task => `- Subject: ${task.subject}, Topic: ${task.topic}, Estimated Time: ${task.estimatedTime} minutes`)
    .join('\n');

  const userPrompt = `Help ${input.studentName} create a homework plan for the day.

The student has provided the following tasks:
${tasksList}`;

  return generateStructured({
    messages: [
      { role: 'system', content: HOMEWORK_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: HomeworkPlannerOutputSchema,
  });
}