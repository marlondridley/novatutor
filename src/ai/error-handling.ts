/**
 * AI Error Handling
 * 
 * Simple utilities for handling AI API errors with automatic retry.
 * 
 * Usage:
 *   const result = await retryWithBackoff(() => openai.chat.completions.create(...));
 */

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Custom error for AI-related failures.
 * Includes whether the error is safe to retry.
 */
export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// =============================================================================
// ERROR CLASSIFICATION
// =============================================================================

/**
 * Convert any API error into a structured AIError.
 * Determines if the error is safe to retry.
 */
function classifyError(error: any): AIError {
  const message = error?.message || String(error);
  const status = error?.status || error?.statusCode;

  // Rate limit - safe to retry after waiting
  if (status === 429 || message.includes('rate limit')) {
    return new AIError('Rate limit exceeded. Please try again in a moment.', 'RATE_LIMIT', true);
  }

  // Context too long - not retryable, user needs to shorten input
  if (status === 400 && message.includes('token')) {
    return new AIError('Input too long. Please shorten your message.', 'TOKEN_LIMIT', false);
  }

  // Auth failed - not retryable, needs config fix
  if (status === 401) {
    return new AIError('API authentication failed. Check your API key.', 'AUTH_FAILED', false);
  }

  // Server error - safe to retry
  if (status >= 500 || message.includes('timeout') || message.includes('network')) {
    return new AIError('AI service temporarily unavailable. Retrying...', 'SERVER_ERROR', true);
  }

  // Unknown error - not retryable by default
  return new AIError(`AI request failed: ${message}`, 'UNKNOWN', false);
}

// =============================================================================
// RETRY LOGIC
// =============================================================================

export interface RetryConfig {
  maxRetries: number;      // How many times to retry
  baseDelayMs: number;     // Initial delay between retries
  maxDelayMs: number;      // Maximum delay (cap for exponential backoff)
  timeoutMs: number;       // Max time to wait for a single request
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,       // 1 second
  maxDelayMs: 10000,       // 10 seconds max
  timeoutMs: 60000,        // 60 second timeout
};

/**
 * Execute a function with automatic retry on transient failures.
 * Uses exponential backoff with jitter to avoid thundering herd.
 * 
 * @param fn - Async function to execute
 * @param config - Retry configuration
 * @returns The result of fn()
 * @throws AIError if all retries fail
 * 
 * @example
 * const response = await retryWithBackoff(async () => {
 *   return openai.chat.completions.create({
 *     model: 'gpt-4',
 *     messages: [{ role: 'user', content: 'Hello' }]
 *   });
 * });
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: AIError | null = null;
  let delay = config.baseDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Race between the function and a timeout
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), config.timeoutMs)
        ),
      ]);
      return result;
      
    } catch (error: any) {
      lastError = classifyError(error);

      // If not retryable or out of retries, throw immediately
      if (!lastError.retryable || attempt === config.maxRetries) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff with jitter)
      const jitter = Math.random() * delay * 0.3;  // 0-30% random jitter
      await new Promise(r => setTimeout(r, Math.min(delay + jitter, config.maxDelayMs)));
      
      delay *= 2;  // Double delay for next attempt
    }
  }

  throw lastError;
}

// =============================================================================
// FALLBACK RESPONSES
// =============================================================================

/**
 * Get a graceful fallback response when AI fails completely.
 * Used to show something helpful instead of a generic error.
 */
export function getGracefulFallback(flowType: string): any {
  const fallbacks: Record<string, any> = {
    tutor: {
      response: "I'm having trouble connecting. Please try again in a moment.",
    },
    learningPath: {
      path: [],
      message: "Unable to generate learning path. Please try again later.",
    },
    homework: {
      feedback: "Unable to provide feedback. Please save your work and try again.",
    },
    testPrep: {
      questions: [],
      message: "Test prep unavailable. Please try again later.",
    },
  };

  return fallbacks[flowType] || { message: "Service temporarily unavailable." };
}
