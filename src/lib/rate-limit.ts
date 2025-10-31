import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiters for different endpoints
export const rateLimiters = {
  // API routes - 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "ratelimit:api",
  }),
  
  // Stripe checkout - 5 requests per minute (prevent abuse)
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:checkout",
  }),
  
  // AI endpoints - 20 requests per minute (cost control)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "ratelimit:ai",
  }),
  
  // Auth endpoints - 5 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),
};

/**
 * Rate limit middleware for API routes
 * @param req - Next.js request object
 * @param limiter - Rate limiter instance to use
 * @returns Response if rate limited, null otherwise
 */
export async function rateLimit(
  req: NextRequest,
  limiter: Ratelimit = rateLimiters.api
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID from auth header)
  const identifier = getIdentifier(req);
  
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);
    
    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
    
    // Rate limit passed - return null to continue
    return null;
  } catch (error) {
    console.error("Rate limit error:", error);
    // On error, allow the request (fail open)
    return null;
  }
}

/**
 * Get identifier for rate limiting
 * Prefers user ID from auth, falls back to IP address
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    // Extract user ID from JWT or session token
    // This is a simplified example - adjust based on your auth implementation
    const userId = extractUserIdFromAuth(authHeader);
    if (userId) return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? 
    req.headers.get("x-real-ip") ?? 
    "127.0.0.1";
  
  return `ip:${ip}`;
}

/**
 * Extract user ID from authorization header
 * Adjust this based on your auth implementation
 */
function extractUserIdFromAuth(authHeader: string): string | null {
  try {
    // Example: Bearer token format
    // You may need to decode JWT or validate session token
    const token = authHeader.replace("Bearer ", "");
    // Add your token validation logic here
    return null; // Return user ID if available
  } catch {
    return null;
  }
}

/**
 * Helper to add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());
  return response;
}
