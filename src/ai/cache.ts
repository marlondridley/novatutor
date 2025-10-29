/**
 * Caching layer for AI responses
 * Supports in-memory caching (default) and Redis (optional)
 */

import { createHash } from 'crypto';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Evict old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Redis cache implementation (optional)
 * Requires @upstash/redis package and configuration
 * Uses Upstash REST API for serverless edge compatibility
 */
class RedisCache {
  private redis: any;

  constructor() {
    try {
      // Try to import and initialize Redis
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Redis } = require('@upstash/redis');
      
      // Check for REST API credentials (recommended for serverless/edge)
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Redis credentials not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
      }

      // Use REST API (edge-compatible)
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      console.log('✅ Redis cache initialized (REST API)');
    } catch (error) {
      console.warn('⚠️ Redis not available, using in-memory cache:', error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value as T | null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

/**
 * Cache interface
 */
interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Initialize cache (tries Redis first, falls back to memory)
 */
function initializeCache(): CacheAdapter {
  try {
    return new RedisCache();
  } catch {
    return new MemoryCache();
  }
}

// Global cache instance
export const cache = initializeCache();

/**
 * Generate cache key from inputs
 */
export function generateCacheKey(prefix: string, ...inputs: any[]): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(inputs));
  return `${prefix}:${hash.digest('hex').substring(0, 16)}`;
}

/**
 * Cached function wrapper
 */
export async function cachedGenerate<T>(
  cacheKey: string,
  generateFn: () => Promise<T>,
  ttl: number = 3600 // 1 hour default
): Promise<T> {
  // Try to get from cache
  const cached = await cache.get<T>(cacheKey);
  
  if (cached) {
    console.log(`💾 Cache hit: ${cacheKey}`);
    return cached;
  }

  console.log(`🔄 Cache miss: ${cacheKey}`);

  // Generate new result
  const result = await generateFn();

  // Store in cache
  await cache.set(cacheKey, result, ttl);

  return result;
}

/**
 * Cache TTL presets
 */
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

/**
 * Invalidate cache by pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  // Note: This only works with in-memory cache
  // For Redis, you'd need to implement key scanning
  if (cache instanceof MemoryCache) {
    const stats = cache.getStats();
    const keysToDelete = stats.keys.filter(key => key.includes(pattern));
    
    for (const key of keysToDelete) {
      await cache.delete(key);
    }
    
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache keys matching "${pattern}"`);
  }
}

