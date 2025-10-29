'use server';

/**
 * @fileOverview This flow analyzes student performance patterns and triggers personalized coaching interventions.
 *
 * - dataDrivenExecutiveFunctionCoaching - A function that initiates the coaching process.
 * - DataDrivenExecutiveFunctionCoachingInput - The input type for the dataDrivenExecutiveFunctionCoaching function.
 * - DataDrivenExecutiveFunctionCoachingOutput - The return type for the dataDrivenExecutiveFunctionCoaching function.
 */

import { generateStructured } from '@/ai/helpers';
import { COACHING_SYSTEM_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

const DataDrivenExecutiveFunctionCoachingInputSchema = z.object({
  studentId: z.string().describe('The unique identifier for the student.'),
  subject: z.string().describe('The subject the student is currently studying.'),
  performanceData: z.array(
    z.object({
      timestamp: z.string().describe('The timestamp of the performance data.'),
      metric: z.string().describe('The name of the performance metric.'),
      value: z.number().describe('The value of the performance metric.'),
    })
  ).describe('An array of performance data for the student.'),
  rules: z.array(
    z.object({
      condition: z.string().describe('The condition that triggers the intervention.'),
      intervention: z.string().describe('The personalized coaching intervention to apply.'),
    })
  ).describe('An array of rules to trigger personalized coaching interventions.'),
});
export type DataDrivenExecutiveFunctionCoachingInput = z.infer<typeof DataDrivenExecutiveFunctionCoachingInputSchema>;

const DataDrivenExecutiveFunctionCoachingOutputSchema = z.object({
  interventionTriggered: z.boolean().describe('Whether an intervention was triggered based on the performance data and rules.'),
  interventionMessage: z.string().describe('The personalized coaching intervention message to display to the student.'),
});
export type DataDrivenExecutiveFunctionCoachingOutput = z.infer<typeof DataDrivenExecutiveFunctionCoachingOutputSchema>;

export async function dataDrivenExecutiveFunctionCoaching(
  input: DataDrivenExecutiveFunctionCoachingInput
): Promise<DataDrivenExecutiveFunctionCoachingOutput> {
  // Use constant system prompt for context caching
  const performanceDataText = input.performanceData
    .map(data => `- Timestamp: ${data.timestamp}, Metric: ${data.metric}, Value: ${data.value}`)
    .join('\n');

  const rulesText = input.rules
    .map(rule => `- Condition: ${rule.condition}, Intervention: ${rule.intervention}`)
    .join('\n');

  const userPrompt = `Student ID: ${input.studentId}
Subject: ${input.subject}

Performance Data:
${performanceDataText}

Rules:
${rulesText}

Analyze this data and determine if an intervention should be triggered.`;

  return generateStructured({
    messages: [
      { role: 'system', content: COACHING_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    schema: DataDrivenExecutiveFunctionCoachingOutputSchema,
  });
}