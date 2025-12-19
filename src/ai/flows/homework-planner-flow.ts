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
  needsClarification: z.boolean().describe('Whether the input is incomplete and needs clarifying questions.'),
  questions: z.array(z.string()).optional().describe('Up to 5 short, friendly questions to clarify key details. Only include if needsClarification is true.'),
  plan: z.array(z.object({
    subject: z.string(),
    topic: z.string(),
    estimatedTime: z.number(),
    steps: z.array(z.string()).describe('Simple, actionable steps for this task (e.g., "Gather your notes and highlight 3 formulas").'),
    encouragement: z.string().describe('A short, encouraging message (e.g., "You\'ve got this — one step at a time!").'),
  })).optional().describe('The structured homework plan. Only include if needsClarification is false.'),
  summary: z.string().optional().describe('A brief, upbeat summary of the entire plan. Only include if needsClarification is false.'),
  followUpQuestion: z.string().optional().describe('A follow-up question like "Would you like me to check in after your session or help you break this into smaller chunks?". Only include if needsClarification is false.'),
});
export type HomeworkPlannerOutput = z.infer<typeof HomeworkPlannerOutputSchema>;

export async function createHomeworkPlan(
  input: HomeworkPlannerInput
): Promise<HomeworkPlannerOutput> {
  // Use constant system prompt for context caching
  const tasksList = input.tasks
    .map(task => `- Subject: ${task.subject}, Topic: ${task.topic}, Estimated Time: ${task.estimatedTime} minutes`)
    .join('\n');

  // Check if this is a follow-up with answers to questions
  const isFollowUpAnswer = input.tasks.some(task => 
    task.topic.toLowerCase().includes("the student was asked these questions") ||
    task.topic.toLowerCase().includes("here are the student's answers") ||
    task.topic.toLowerCase().includes("please create a focus plan based on this information")
  );

  // Check if input is incomplete (vague topics like "Today's Focus" or very short descriptions)
  // But don't check if it's a follow-up answer
  const isIncomplete = !isFollowUpAnswer && input.tasks.some(task => 
    task.topic.toLowerCase().includes("today's focus") ||
    task.topic.toLowerCase().includes("help me") ||
    task.topic.toLowerCase().includes("i need to") ||
    (task.topic.length < 20 && !task.topic.toLowerCase().includes("the student")) ||
    task.subject.toLowerCase() === "today's focus"
  );

  let userPrompt = '';
  
  if (isFollowUpAnswer) {
    // This is a follow-up with answers - create the plan
    userPrompt = `Help ${input.studentName} create a homework plan for the day.

${tasksList}

IMPORTANT: The student has provided answers to clarifying questions. You now have enough information to create a structured focus plan. Set needsClarification to false and provide a complete plan with steps and encouragement.`;
  } else if (isIncomplete) {
    // Initial input is incomplete - ask questions
    userPrompt = `Help ${input.studentName} create a homework plan for the day.

The student has provided the following tasks:
${tasksList}

IMPORTANT: The student's input appears incomplete or vague. You should ask up to 5 clarifying questions to understand what they need help with. Set needsClarification to true and provide helpful questions.`;
  } else {
    // Initial input is complete - create plan
    userPrompt = `Help ${input.studentName} create a homework plan for the day.

The student has provided the following tasks:
${tasksList}

The student has provided detailed information. Create a structured focus plan with steps and encouragement. Set needsClarification to false and provide the plan.`;
  }

  return generateStructured({
    messages: [
      { role: 'system', content: HOMEWORK_PLANNER_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: HomeworkPlannerOutputSchema,
  });
}