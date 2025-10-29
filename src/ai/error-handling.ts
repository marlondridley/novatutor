/**
 * Comprehensive error handling for AI API calls
 */

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number;
  timeoutMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeoutMs: 60000, // 60 seconds
};

/**
 * Handle API errors with proper categorization
 */
export function handleAPIError(error: any): AIError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const statusCode = error?.status || error?.statusCode;

  // Rate limit errors
  if (statusCode === 429 || errorMessage.includes('rate limit')) {
    return new AIError(
      'Rate limit exceeded. Please try again in a moment.',
      'RATE_LIMIT_EXCEEDED',
      true,
      429
    );
  }

  // Token limit errors
  if (
    statusCode === 400 &&
    (errorMessage.includes('token') || errorMessage.includes('context_length_exceeded'))
  ) {
    return new AIError(
      'Input too long. Please reduce the length and try again.',
      'TOKEN_LIMIT_EXCEEDED',
      false,
      400
    );
  }

  // Authentication errors
  if (statusCode === 401 || errorMessage.includes('authentication') || errorMessage.includes('api key')) {
    return new AIError(
      'API authentication failed. Please check your API key configuration.',
      'AUTH_FAILED',
      false,
      401
    );
  }

  // Network/timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('network')
  ) {
    return new AIError(
      'Network error. Please check your connection and try again.',
      'NETWORK_ERROR',
      true,
      503
    );
  }

  // Server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return new AIError(
      'AI service temporarily unavailable. Please try again.',
      'SERVER_ERROR',
      true,
      statusCode
    );
  }

  // Generic error
  return new AIError(
    `AI request failed: ${errorMessage}`,
    'UNKNOWN_ERROR',
    false,
    statusCode
  );
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.baseDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add timeout to the promise
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), config.timeoutMs)
        ),
      ]);
      return result;
    } catch (error: any) {
      lastError = error;
      const aiError = handleAPIError(error);

      // Don't retry if error is not retryable
      if (!aiError.retryable || attempt === config.maxRetries) {
        throw aiError;
      }

      // Log retry attempt
      console.warn(`AI request failed (attempt ${attempt + 1}/${config.maxRetries + 1}):`, aiError.message);

      // Wait before retrying (exponential backoff with jitter)
      const jitter = Math.random() * 0.3 * delay; // 0-30% jitter
      const waitTime = Math.min(delay + jitter, config.maxDelay);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Increase delay for next attempt
      delay *= 2;
    }
  }

  throw handleAPIError(lastError);
}

/**
 * Graceful degradation fallback response
 */
export function getGracefulFallback(flowType: string): any {
  const fallbacks: Record<string, any> = {
    tutor: {
      response: "I'm having trouble connecting right now. Please try again in a moment, or check your internet connection.",
      confidence: 0,
    },
    learningPath: {
      path: [],
      message: "Unable to generate learning path at this time. Please try again later.",
    },
    homework: {
      feedback: "Unable to provide feedback right now. Please save your work and try again shortly.",
      score: null,
    },
    coaching: {
      intervention: "Service temporarily unavailable. Please try again in a few moments.",
      techniques: [],
    },
    joke: {
      joke: "Why did the AI go to school? To improve its learning algorithms! 😄 (Sorry, our joke service is taking a break!)",
    },
    testPrep: {
      questions: [],
      message: "Test prep service is temporarily unavailable. Please try again later.",
    },
  };

  return fallbacks[flowType] || {
    message: "Service temporarily unavailable. Please try again later.",
  };
}

