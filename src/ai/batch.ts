/**
 * Batch processing utilities with concurrency control
 */

import pLimit from 'p-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Process items in batches with concurrency limit
 */
export async function batchProcess<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
    onError?: (error: Error, item: T, index: number) => void;
    continueOnError?: boolean;
  } = {}
): Promise<R[]> {
  const {
    concurrency = 5,
    batchSize = items.length,
    onProgress,
    onError,
    continueOnError = true,
  } = options;

  const results: R[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  let completed = 0;

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, Math.min(i + batchSize, items.length));
    
    // Process batch with concurrency limit
    const batchResults = await processWithConcurrency(
      batch,
      async (item, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const result = await processFn(item, globalIndex);
          completed++;
          onProgress?.(completed, items.length);
          return result;
        } catch (error: any) {
          completed++;
          onProgress?.(completed, items.length);
          
          if (onError) {
            onError(error, item, globalIndex);
          }
          
          if (!continueOnError) {
            throw error;
          }
          
          errors.push({ index: globalIndex, error });
          return null as any; // Return null for failed items
        }
      },
      concurrency
    );

    results.push(...batchResults);

    // Add delay between batches to avoid rate limits
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  if (errors.length > 0 && !continueOnError) {
    console.error(`Batch processing completed with ${errors.length} errors`);
  }

  return results;
}

/**
 * Process items with concurrency limit using p-limit
 */
async function processWithConcurrency<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const limit = pLimit(concurrency);

  const promises = items.map((item, index) =>
    limit(() => processFn(item, index))
  );

  return Promise.all(promises);
}

/**
 * Retry failed items from a batch
 */
export async function retryFailedBatch<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  maxRetries: number = 3,
  options: {
    concurrency?: number;
    delayMs?: number;
    onRetry?: (attempt: number, item: T, error: Error) => void;
  } = {}
): Promise<Array<{ item: T; result?: R; error?: Error }>> {
  const { concurrency = 3, delayMs = 1000, onRetry } = options;

  const results: Array<{ item: T; result?: R; error?: Error }> = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await processFn(item, i);
        results.push({ item, result });
        break; // Success, move to next item
      } catch (error: any) {
        lastError = error;
        
        if (onRetry) {
          onRetry(attempt, item, error);
        }

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = delayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError) {
      results.push({ item, error: lastError });
    }
  }

  return results;
}

/**
 * Rate limiter for API calls using rate-limiter-flexible
 */
export class RateLimiter {
  private limiter: RateLimiterMemory;
  private concurrencyLimit: pLimit.Limit;

  constructor(
    private maxConcurrent: number,
    private maxPerMinute: number
  ) {
    // Create rate limiter for requests per minute
    this.limiter = new RateLimiterMemory({
      points: maxPerMinute, // Number of points
      duration: 60, // Per 60 seconds
    });

    // Create concurrency limiter
    this.concurrencyLimit = pLimit(maxConcurrent);
  }

  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Apply both rate limiting and concurrency control
    return this.concurrencyLimit(async () => {
      // Consume 1 point for rate limiting
      await this.limiter.consume('api-calls', 1);
      
      // Execute the function
      return await fn();
    });
  }

  /**
   * Get current status
   */
  async getStatus() {
    try {
      const rateLimiterState = await this.limiter.get('api-calls');
      
      return {
        activeCount: this.concurrencyLimit.activeCount,
        pendingCount: this.concurrencyLimit.pendingCount,
        remainingPoints: rateLimiterState ? rateLimiterState.remainingPoints : this.maxPerMinute,
        resetTime: rateLimiterState ? new Date(Date.now() + rateLimiterState.msBeforeNext) : new Date(),
      };
    } catch {
      return {
        activeCount: this.concurrencyLimit.activeCount,
        pendingCount: this.concurrencyLimit.pendingCount,
        remainingPoints: this.maxPerMinute,
        resetTime: new Date(),
      };
    }
  }

  /**
   * Clear rate limiter state
   */
  async reset(): Promise<void> {
    await this.limiter.delete('api-calls');
  }
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  
  return chunks;
}

/**
 * Batch API rate limiters for different services
 */
export const rateLimiters = {
  deepseek: new RateLimiter(10, 60), // 10 concurrent, 60/minute
  openai: new RateLimiter(5, 20), // 5 concurrent, 20/minute (conservative)
  dalle: new RateLimiter(1, 5), // 1 concurrent, 5/minute (very expensive)
  whisper: new RateLimiter(3, 30), // 3 concurrent, 30/minute
};

