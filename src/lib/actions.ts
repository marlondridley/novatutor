/**
 * Server Actions
 * 
 * These are server-side functions that can be called from React components.
 * They handle AI requests with rate limiting and error handling.
 * 
 * Usage in components:
 *   const result = await getEducationalAssistantResponse({ subject, studentQuestion });
 *   if (result.success) {
 *     // Use result.data
 *   } else {
 *     // Show result.error to user
 *   }
 */

"use server";

import { connectWithSubjectSpecializedTutor, type ConnectWithSubjectSpecializedTutorInput } from "@/ai/flows/subject-specialized-tutor";
import { generatePersonalizedLearningPath, type GeneratePersonalizedLearningPathInput } from "@/ai/flows/generate-personalized-learning-path";
import { getHomeworkFeedback, type HomeworkFeedbackInput } from "@/ai/flows/homework-feedback-flow";
import { generateIllustration, type GenerateIllustrationInput } from "@/ai/flows/generate-illustration-flow";
import { textToSpeech, type TextToSpeechInput } from "@/ai/flows/text-to-speech-flow";
import { tellJoke, type JokeTellerInput } from "@/ai/flows/joke-teller-flow";
import { createHomeworkPlan, type HomeworkPlannerInput } from "@/ai/flows/homework-planner-flow";
import { generateTestPrep, type TestPrepInput } from "@/ai/flows/test-prep-flow";
import { speechToText, type SpeechToTextInput } from "@/ai/flows/speech-to-text-flow";
import { checkRateLimit, formatRateLimitError } from "@/lib/redis";
import { logger } from "@/lib/logger";

// =============================================================================
// TYPES
// =============================================================================

/** Standard response format for all actions */
type ActionResult<T> = 
  | { success: true; data: T; remaining?: number }
  | { success: false; error: string };

// =============================================================================
// ERROR HANDLING HELPER
// =============================================================================

/**
 * Wrap an async function with standard error handling.
 * This eliminates repetitive try/catch blocks in each action.
 */
async function withErrorHandling<T>(
  actionName: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: any) {
    logger.error(`${actionName} Error`, error instanceof Error ? error : new Error(String(error)));
    
    const message = error?.message || `Failed to complete ${actionName.toLowerCase()}.`;
    return { success: false, error: message };
  }
}

// =============================================================================
// AI TUTOR
// =============================================================================

/**
 * Get a response from the AI tutor.
 * Rate limited to 30 requests per hour per user.
 */
export async function getEducationalAssistantResponse(
  input: ConnectWithSubjectSpecializedTutorInput & { userId?: string }
): Promise<ActionResult<Awaited<ReturnType<typeof connectWithSubjectSpecializedTutor>>>> {
  const userId = input.userId || 'anonymous';
  
  // Check rate limit
  const rateLimit = await checkRateLimit('ai', userId);
  if (!rateLimit.success) {
    return { success: false, error: formatRateLimitError(rateLimit) };
  }

  return withErrorHandling('Educational Assistant', async () => {
    const response = await connectWithSubjectSpecializedTutor(input);
    return response;
  });
}

// =============================================================================
// LEARNING PATH
// =============================================================================

/**
 * Generate a personalized learning path for a student.
 * Rate limited because it's an expensive operation.
 */
export async function getLearningPath(
  input: GeneratePersonalizedLearningPathInput & { userId?: string }
): Promise<ActionResult<Awaited<ReturnType<typeof generatePersonalizedLearningPath>>>> {
  const userId = input.userId || input.studentId;
  
  const rateLimit = await checkRateLimit('ai', userId);
  if (!rateLimit.success) {
    return { success: false, error: formatRateLimitError(rateLimit) };
  }

  return withErrorHandling('Learning Path', () => generatePersonalizedLearningPath(input));
}

// =============================================================================
// HOMEWORK FEEDBACK
// =============================================================================

/**
 * Get AI feedback on homework (supports image uploads).
 */
export async function getHomeworkFeedbackAction(
  input: HomeworkFeedbackInput
): Promise<ActionResult<Awaited<ReturnType<typeof getHomeworkFeedback>>>> {
  return withErrorHandling('Homework Feedback', () => getHomeworkFeedback(input));
}

// =============================================================================
// ILLUSTRATION
// =============================================================================

/**
 * Generate an educational illustration.
 * Uses media rate limit (more restrictive) because images are expensive.
 */
export async function generateIllustrationAction(
  input: GenerateIllustrationInput & { userId?: string }
): Promise<ActionResult<Awaited<ReturnType<typeof generateIllustration>>>> {
  if (input.userId) {
    const rateLimit = await checkRateLimit('media', input.userId);
    if (!rateLimit.success) {
      return { success: false, error: formatRateLimitError(rateLimit) };
    }
  }

  return withErrorHandling('Illustration', () => generateIllustration(input));
}

// =============================================================================
// TEXT TO SPEECH
// =============================================================================

/**
 * Convert text to speech audio.
 * Uses media rate limit because TTS is expensive ($15 per million characters).
 */
export async function textToSpeechAction(
  input: TextToSpeechInput & { userId?: string }
): Promise<ActionResult<Awaited<ReturnType<typeof textToSpeech>>>> {
  if (input.userId) {
    const rateLimit = await checkRateLimit('media', input.userId);
    if (!rateLimit.success) {
      return { success: false, error: formatRateLimitError(rateLimit) };
    }
  }

  return withErrorHandling('Text-to-Speech', () => textToSpeech(input));
}

// =============================================================================
// SPEECH TO TEXT
// =============================================================================

/**
 * Transcribe audio to text using OpenAI Whisper.
 */
export async function speechToTextAction(
  input: SpeechToTextInput
): Promise<ActionResult<Awaited<ReturnType<typeof speechToText>>>> {
  return withErrorHandling('Speech-to-Text', () => speechToText(input));
}

// =============================================================================
// JOKES
// =============================================================================

/**
 * Tell an educational joke. Cheap operation, generous rate limit.
 */
export async function getJokeAction(
  input: JokeTellerInput
): Promise<ActionResult<Awaited<ReturnType<typeof tellJoke>>>> {
  return withErrorHandling('Joke', () => tellJoke(input));
}

// =============================================================================
// HOMEWORK PLANNER
// =============================================================================

/**
 * Create a homework plan from a list of tasks.
 */
export async function createHomeworkPlanAction(
  input: HomeworkPlannerInput
): Promise<ActionResult<Awaited<ReturnType<typeof createHomeworkPlan>>>> {
  return withErrorHandling('Homework Planner', () => createHomeworkPlan(input));
}

// =============================================================================
// TEST PREP
// =============================================================================

/**
 * Generate test preparation materials (practice questions, etc.).
 */
export async function generateTestPrepAction(
  input: TestPrepInput
): Promise<ActionResult<Awaited<ReturnType<typeof generateTestPrep>>>> {
  return withErrorHandling('Test Prep', () => generateTestPrep(input));
}
