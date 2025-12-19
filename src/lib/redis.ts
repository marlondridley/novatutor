/**
 * Redis Configuration (Upstash)
 * 
 * This file provides:
 * 1. Rate limiting - Prevents API abuse
 * 2. Caching - Saves money by reusing AI responses
 * 
 * If Redis credentials are missing, the app works without rate limiting.
 * 
 * Setup:
 *   1. Create account at upstash.com
 *   2. Add to .env.local:
 *      UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *      UPSTASH_REDIS_REST_TOKEN=xxx
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// =============================================================================
// REDIS CLIENT
// =============================================================================

/**
 * Create Redis client. Returns null if credentials missing (graceful fallback).
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('[Redis] Credentials not found. Rate limiting disabled.');
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch (error) {
    console.error('[Redis] Connection failed:', error);
    return null;
  }
}

export const redis = createRedisClient();

// =============================================================================
// RATE LIMITERS
// =============================================================================

/**
 * Rate limiters to prevent abuse and control costs.
 * 
 * We only need 3 categories:
 * - ai: General AI calls (tutor, quiz, etc.) - 30/hour
 * - media: Expensive operations (TTS, STT, images) - 20/day
 * - auth: Login attempts - 10/minute (security)
 */
export const rateLimiters = redis ? {
  // General AI operations (chat, quiz generation, etc.)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 h'),
    prefix: 'rl:ai',
  }),

  // Expensive media operations (TTS costs $15/1M chars, images cost $0.04 each)
  media: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 d'),
    prefix: 'rl:media',
  }),

  // Authentication - prevent brute force
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:auth',
  }),
} : null;

// =============================================================================
// RATE LIMIT HELPER
// =============================================================================

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;  // Timestamp when limit resets
}

/**
 * Check if a user has exceeded their rate limit.
 * 
 * @param type - Which limiter to check ('ai', 'media', or 'auth')
 * @param userId - Unique identifier for the user
 * @returns Object with success=true if allowed, remaining count, and reset time
 * 
 * @example
 * const result = await checkRateLimit('ai', user.id);
 * if (!result.success) {
 *   return { error: 'Too many requests. Try again later.' };
 * }
 */
export async function checkRateLimit(
  type: 'ai' | 'media' | 'auth',
  userId: string
): Promise<RateLimitResult> {
  // If no Redis, allow everything (development mode)
  if (!rateLimiters) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const { success, remaining, reset } = await rateLimiters[type].limit(userId);
  return { success, remaining, reset };
}

/**
 * Format a user-friendly rate limit error message.
 */
export function formatRateLimitError(result: RateLimitResult): string {
  const minutes = Math.ceil((result.reset - Date.now()) / 60000);
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `Rate limit exceeded. Try again in ${hours} hour${hours > 1 ? 's' : ''}.`;
  }
  
  return `Rate limit exceeded. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
}

// =============================================================================
// CACHING
// =============================================================================

/**
 * Cache expensive AI responses to save money.
 * 
 * If the same request is made twice, return cached response instead of
 * calling the AI again. Cache expires after TTL seconds.
 * 
 * @param key - Unique cache key (e.g., 'quiz:math:fractions')
 * @param fetcher - Function that generates the data if not cached
 * @param ttlSeconds - How long to cache (default: 1 hour)
 * 
 * @example
 * const quiz = await getCached(
 *   `quiz:${subject}:${topic}`,
 *   () => generateQuiz(subject, topic),
 *   3600 // Cache for 1 hour
 * );
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // No Redis = no caching, always fetch fresh
  if (!redis) {
    return fetcher();
  }

  try {
    // Check cache
    const cached = await redis.get<string>(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // Cache miss - generate fresh data
    const fresh = await fetcher();

    // Store in cache (fire-and-forget, don't block response)
    redis.setex(key, ttlSeconds, JSON.stringify(fresh)).catch(() => {});

    return fresh;
  } catch {
    // On any cache error, just fetch fresh data
    return fetcher();
  }
}

/**
 * Build a cache key from multiple parts.
 * 
 * @example
 * const key = cacheKey('quiz', 'math', 'fractions'); // 'quiz:math:fractions'
 */
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

/**
 * Simple hash for creating cache keys from long strings.
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// =============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// =============================================================================

// These are used by actions.ts - keeping them but they're just wrappers now
export const rateLimits = rateLimiters;
export async function trackAICost(): Promise<void> { /* No-op: cost tracking removed */ }
export async function saveConversationContext(): Promise<void> { /* No-op */ }
export async function getConversationContext(): Promise<null> { return null; }

