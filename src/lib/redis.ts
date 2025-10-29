/**
 * Upstash Redis Configuration for SuperTutor
 * Provides: Rate Limiting, Caching, Session Storage, Cost Tracking
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ===========================================
// REDIS CLIENT INITIALIZATION
// ===========================================

/**
 * Initialize Redis client with REST API
 * Falls back gracefully if credentials missing
 */
function createRedisClient() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️ Redis credentials not found. Rate limiting and caching disabled.');
    return null;
  }

  try {
    const client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    console.log('✅ Redis connected (Upstash REST API)');
    return client;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return null;
  }
}

export const redis = createRedisClient();

// ===========================================
// RATE LIMITERS (Prevent Abuse)
// ===========================================

/**
 * Educational AI rate limits optimized for student usage patterns
 */
export const rateLimits = redis ? {
  // 🎓 Subject Tutoring: 30 questions per hour (main feature, generous)
  tutor: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 h'),
    analytics: true,
    prefix: 'ratelimit:tutor',
  }),

  // 📝 Homework Feedback: 10 uploads per hour (prevent spam, expensive vision API)
  homework: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'ratelimit:homework',
  }),

  // 🗓️ Homework Planning: 5 plans per day (expensive, typically done once daily)
  planner: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    analytics: true,
    prefix: 'ratelimit:planner',
  }),

  // 🎯 Learning Paths: 10 per day (very expensive, rarely needs regeneration)
  learningPath: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 d'),
    analytics: true,
    prefix: 'ratelimit:path',
  }),

  // 📊 Test Prep: 20 quizzes per hour (moderate cost, common use case)
  testPrep: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: true,
    prefix: 'ratelimit:quiz',
  }),

  // 🔊 Text-to-Speech: 50 per day (VERY expensive - $15 per 1M chars)
  tts: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 d'),
    analytics: true,
    prefix: 'ratelimit:tts',
  }),

  // 🧠 Executive Function: 20 coaching sessions per day
  coaching: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 d'),
    analytics: true,
    prefix: 'ratelimit:coaching',
  }),

  // 🎨 Image Generation: 5 per day (EXTREMELY expensive - $0.04-0.08 per image)
  imageGen: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    analytics: true,
    prefix: 'ratelimit:dalle',
  }),

  // 🎤 Speech-to-Text: 30 per day (moderate cost, $0.006/minute)
  stt: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 d'),
    analytics: true,
    prefix: 'ratelimit:whisper',
  }),

  // 😄 Jokes: 50 per hour (cheap, fun feature)
  joke: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: 'ratelimit:joke',
  }),
} : null;

// ===========================================
// RATE LIMIT CHECKER HELPER
// ===========================================

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Check rate limit for a specific flow
 * Returns detailed info about remaining requests
 */
export async function checkRateLimit(
  limitType: keyof NonNullable<typeof rateLimits>,
  userId: string
): Promise<RateLimitResult> {
  if (!rateLimits) {
    // No Redis = no rate limiting, allow all requests
    return { success: true, remaining: 999, reset: 0, limit: 999 };
  }

  const { success, remaining, reset, limit } = await rateLimits[limitType].limit(userId);

  if (!success) {
    const minutesUntilReset = Math.ceil((reset - Date.now()) / 1000 / 60);
    console.warn(`⚠️ Rate limit exceeded for ${userId} on ${limitType}. Reset in ${minutesUntilReset}m`);
  }

  return { success, remaining, reset, limit };
}

/**
 * Format rate limit error message
 */
export function formatRateLimitError(result: RateLimitResult): string {
  const minutesUntilReset = Math.ceil((result.reset - Date.now()) / 1000 / 60);
  const hoursUntilReset = Math.floor(minutesUntilReset / 60);
  
  const timeString = hoursUntilReset > 0 
    ? `${hoursUntilReset} hour${hoursUntilReset > 1 ? 's' : ''}`
    : `${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}`;

  return `Rate limit exceeded. You can try again in ${timeString}. (${result.remaining} requests remaining)`;
}

// ===========================================
// CACHING HELPERS (Save Money)
// ===========================================

/**
 * Cache expensive AI responses with automatic serialization
 * @param key - Unique cache key
 * @param fetcher - Function that generates the data
 * @param ttlSeconds - How long to cache (default: 1 hour)
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  if (!redis) {
    // No Redis = no caching, always fetch fresh
    return await fetcher();
  }

  try {
    // Try to get from cache
    const cached = await redis.get<string>(key);

    if (cached) {
      console.log(`💾 Cache HIT: ${key}`);
      return JSON.parse(cached) as T;
    }

    console.log(`🔄 Cache MISS: ${key}`);

    // Generate fresh data
    const fresh = await fetcher();

    // Store in cache (fire-and-forget)
    redis.setex(key, ttlSeconds, JSON.stringify(fresh)).catch((err) => {
      console.error('Cache write error:', err);
    });

    return fresh;
  } catch (error) {
    console.error('Cache error, falling back to fresh data:', error);
    return await fetcher();
  }
}

/**
 * Invalidate cache by pattern
 * Useful when user updates their profile/preferences
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys matching "${pattern}"`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Generate cache key from multiple parts
 */
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

// ===========================================
// USER SESSION HELPERS (Better UX)
// ===========================================

/**
 * Store conversation context for tutoring sessions
 * Enables better follow-up question handling
 */
export async function saveConversationContext(
  userId: string,
  subject: string,
  context: {
    lastQuestion: string;
    lastAnswer: any;
    timestamp: number;
  }
): Promise<void> {
  if (!redis) return;

  try {
    const key = `context:${userId}:${subject}`;
    await redis.setex(key, 3600, JSON.stringify(context)); // 1 hour
  } catch (error) {
    console.error('Failed to save conversation context:', error);
  }
}

/**
 * Retrieve conversation context
 */
export async function getConversationContext(
  userId: string,
  subject: string
): Promise<{
  lastQuestion: string;
  lastAnswer: any;
  timestamp: number;
} | null> {
  if (!redis) return null;

  try {
    const key = `context:${userId}:${subject}`;
    const data = await redis.get<string>(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get conversation context:', error);
    return null;
  }
}

// ===========================================
// COST TRACKING (Monitor Spending)
// ===========================================

/**
 * Track AI costs per user and per flow
 * Enables budget monitoring and alerts
 */
export async function trackAICost(
  userId: string,
  flow: string,
  cost: number
): Promise<void> {
  if (!redis || cost <= 0) return;

  try {
    const month = new Date().toISOString().slice(0, 7); // "2025-10"

    // Track per-user monthly cost
    await redis.incrbyfloat(`cost:user:${userId}:${month}`, cost);

    // Track per-flow total cost
    await redis.incrbyfloat(`cost:flow:${flow}:${month}`, cost);

    // Log expensive operations
    if (cost > 0.01) {
      console.log(`💰 Tracked cost: $${cost.toFixed(4)} | User: ${userId} | Flow: ${flow}`);
    }
  } catch (error) {
    console.error('Cost tracking error:', error);
  }
}

/**
 * Get user's monthly spending
 */
export async function getUserMonthlyCost(userId: string): Promise<number> {
  if (!redis) return 0;

  try {
    const month = new Date().toISOString().slice(0, 7);
    const cost = await redis.get<number>(`cost:user:${userId}:${month}`);
    return cost || 0;
  } catch (error) {
    console.error('Failed to get user cost:', error);
    return 0;
  }
}

/**
 * Check if user has exceeded their budget
 * @param userId - User ID
 * @param budget - Monthly budget limit in USD
 */
export async function checkBudget(
  userId: string,
  budget: number
): Promise<{
  exceeded: boolean;
  current: number;
  budget: number;
  percentage: number;
}> {
  const current = await getUserMonthlyCost(userId);
  const percentage = (current / budget) * 100;
  const exceeded = current >= budget;

  if (exceeded) {
    console.warn(`⚠️ User ${userId} exceeded budget: $${current.toFixed(2)} / $${budget}`);
  } else if (percentage >= 80) {
    console.warn(`⚠️ User ${userId} at ${percentage.toFixed(0)}% of budget`);
  }

  return {
    exceeded,
    current,
    budget,
    percentage,
  };
}

/**
 * Get total costs by flow for the current month
 */
export async function getFlowCosts(): Promise<Record<string, number>> {
  if (!redis) return {};

  try {
    const month = new Date().toISOString().slice(0, 7);
    const pattern = `cost:flow:*:${month}`;
    const keys = await redis.keys(pattern);

    const costs: Record<string, number> = {};

    for (const key of keys) {
      const flowName = key.split(':')[2]; // Extract flow name
      const cost = await redis.get<number>(key);
      if (cost) {
        costs[flowName] = cost;
      }
    }

    return costs;
  } catch (error) {
    console.error('Failed to get flow costs:', error);
    return {};
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Simple string hashing for cache keys
 */
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

