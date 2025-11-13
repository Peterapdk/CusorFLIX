import { Redis } from '@upstash/redis';
import { getClientIp } from '@/lib/utils/request';
import logger from '@/lib/logger';
import type { NextRequest } from 'next/server';

// Initialize Redis client with graceful degradation
let redis: Redis | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    logger.info('Redis rate limiter initialized', { context: 'RateLimiter' });
  } else {
    logger.warn('Redis rate limiter not configured - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required', {
      context: 'RateLimiter',
    });
  }
} catch (error) {
  logger.error('Failed to initialize Redis rate limiter', {
    context: 'RateLimiter',
    error: error instanceof Error ? error : new Error(String(error)),
  });
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyPrefix: string; // Prefix for Redis keys
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyPrefix: 'ratelimit:search',
  },
  discover: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 40, // 40 requests per minute (higher for discover due to pagination)
    keyPrefix: 'ratelimit:discover',
  },
  lists: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute (higher for list operations)
    keyPrefix: 'ratelimit:lists',
  },
} as const;

/**
 * Rate Limiter class using Redis for distributed rate limiting
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if the request is within rate limits
   */
  async checkLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalRequests: number;
  }> {
    if (!redis) {
      // Graceful degradation - allow all requests if Redis is not available
      logger.warn('Redis not available for rate limiting, allowing request', {
        context: 'RateLimiter',
        identifier,
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: Date.now() + this.config.windowMs,
        totalRequests: 1,
      };
    }

    try {
      const key = `${this.config.keyPrefix}:${identifier}`;
      const windowStart = Math.floor(Date.now() / this.config.windowMs) * this.config.windowMs;

      // Use Redis sorted set to track requests with timestamps
      const member = `${Date.now()}:${Math.random()}`;

      // Add current request to the sorted set
      await redis.zadd(key, { score: Date.now(), member });

      // Remove requests outside the current window
      await redis.zremrangebyscore(key, 0, windowStart - 1);

      // Count requests in current window
      const requestCount = await redis.zcard(key);

      // Set expiration on the key (window + some buffer)
      await redis.expire(key, Math.ceil(this.config.windowMs / 1000) + 60);

      const allowed = requestCount <= this.config.maxRequests;
      const remaining = Math.max(0, this.config.maxRequests - requestCount);
      const resetTime = windowStart + this.config.windowMs;

      if (!allowed) {
        logger.warn('Rate limit exceeded', {
          context: 'RateLimiter',
          identifier,
          requestCount,
          maxRequests: this.config.maxRequests,
          windowMs: this.config.windowMs,
        });
      }

      return {
        allowed,
        remaining,
        resetTime,
        totalRequests: requestCount,
      };
    } catch (error) {
      // On Redis error, allow the request to prevent blocking legitimate users
      logger.error('Error checking rate limit', {
        context: 'RateLimiter',
        identifier,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: Date.now() + this.config.windowMs,
        totalRequests: 1,
      };
    }
  }
}

/**
 * Create rate limiter instances for different endpoints
 */
export const rateLimiters = {
  search: new RateLimiter(RATE_LIMITS.search),
  discover: new RateLimiter(RATE_LIMITS.discover),
  lists: new RateLimiter(RATE_LIMITS.lists),
} as const;

/**
 * Middleware function to apply rate limiting to API routes
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}> {
  // Use provided identifier or extract from request
  const clientId = identifier || getClientIp(request);

  return await limiter.checkLimit(clientId);
}

/**
 * Create a rate-limited API response
 */
export function createRateLimitResponse(
  remaining: number,
  resetTime: number
): Response {
  const resetInSeconds = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': resetInSeconds.toString(),
      },
    }
  );
}