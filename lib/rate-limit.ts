import { Redis } from '@upstash/redis';
import logger from '@/lib/logger';
import { getEnvConfig } from '@/lib/env';

// Initialize Redis client with graceful degradation
let redis: Redis | null = null;

try {
  const envConfig = getEnvConfig();
  
  if (envConfig.redis) {
    redis = new Redis({
      url: envConfig.redis.url,
      token: envConfig.redis.token,
    });
    logger.info('Rate limiter Redis client initialized', { context: 'RateLimiter' });
  } else {
    logger.warn('Rate limiter Redis not configured - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required', {
      context: 'RateLimiter',
      note: 'Rate limiting will allow all requests (graceful degradation)',
    });
  }
} catch (error) {
  logger.error('Failed to initialize rate limiter Redis client', {
    context: 'RateLimiter',
    error: error instanceof Error ? error : new Error(String(error)),
  });
}

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
  /**
   * Custom key generator function
   * If not provided, uses a default key generator
   */
  keyGenerator?: (request: RateLimitRequest) => string;
  /**
   * Whether to allow requests when Redis is unavailable (graceful degradation)
   * Default: true
   */
  allowOnFailure?: boolean;
}

export interface RateLimitRequest {
  /**
   * IP address or user identifier
   */
  identifier: string;
  /**
   * Optional endpoint or route path
   */
  endpoint?: string;
  /**
   * Optional user ID for authenticated requests
   */
  userId?: string;
  /**
   * Additional metadata for custom key generation
   */
  metadata?: Record<string, string>;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;
  /**
   * Current request count in the window
   */
  count: number;
  /**
   * Maximum allowed requests
   */
  limit: number;
  /**
   * Time window in seconds
   */
  window: number;
  /**
   * Time remaining until window resets (in seconds)
   */
  resetTime: number;
  /**
   * Retry-After header value (in seconds)
   */
  retryAfter: number;
}

/**
 * Default key generator - uses identifier and endpoint
 */
function defaultKeyGenerator(request: RateLimitRequest, prefix: string): string {
  const parts = [prefix, request.identifier];
  if (request.endpoint) {
    parts.push(request.endpoint);
  }
  return parts.join(':');
}

/**
 * Rate Limiter - Window-based rate limiting with Redis
 */
export class RateLimiter {
  private static instance: RateLimiter;
  private readonly keyPrefix = 'rate_limit';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of RateLimiter
   */
  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if Redis is available
   */
  private isAvailable(): boolean {
    return redis !== null;
  }

  /**
   * Check rate limit for a request
   */
  async checkLimit(
    request: RateLimitRequest,
    options: RateLimitOptions
  ): Promise<RateLimitResult> {
    const { limit, window, keyGenerator, allowOnFailure = true } = options;

    // If Redis is not available, allow request if graceful degradation is enabled
    if (!this.isAvailable()) {
      if (allowOnFailure) {
        logger.warn('Rate limiter: Redis unavailable, allowing request (graceful degradation)', {
          context: 'RateLimiter',
          identifier: request.identifier,
          endpoint: request.endpoint,
        });
        return {
          allowed: true,
          count: 0,
          limit,
          window,
          resetTime: window,
          retryAfter: 0,
        };
      } else {
        // If graceful degradation is disabled, deny the request
        logger.error('Rate limiter: Redis unavailable and graceful degradation disabled', {
          context: 'RateLimiter',
        });
        return {
          allowed: false,
          count: limit,
          limit,
          window,
          resetTime: window,
          retryAfter: window,
        };
      }
    }

    try {
      // Generate rate limit key
      const key = keyGenerator
        ? keyGenerator(request)
        : defaultKeyGenerator(request, this.keyPrefix);

      const fullKey = `${this.keyPrefix}:${key}`;

      // Use a fixed window counter approach with Redis
      // This is simpler and more efficient than sliding windows
      
      // Increment the counter (creates key if it doesn't exist with value 0, then increments to 1)
      const currentCount = await redis!.incr(fullKey);

      // If this is the first request in the window (count === 1), set expiration
      // Note: There's a small race condition here, but it's acceptable for rate limiting
      if (currentCount === 1) {
        await redis!.expire(fullKey, window);
      }

      // Get the actual TTL for the response
      const actualTtl = await redis!.ttl(fullKey);
      const resetTime = actualTtl > 0 ? actualTtl : window;

      // Check if limit is exceeded
      if (currentCount > limit) {
        logger.warn('Rate limit exceeded', {
          context: 'RateLimiter',
          key: fullKey,
          count: currentCount,
          limit,
          window,
          retryAfter: resetTime,
        });

        return {
          allowed: false,
          count: currentCount,
          limit,
          window,
          resetTime,
          retryAfter: resetTime,
        };
      }

      logger.debug('Rate limit check passed', {
        context: 'RateLimiter',
        key: fullKey,
        count: currentCount,
        limit,
        window,
        resetTime,
      });

      return {
        allowed: true,
        count: currentCount,
        limit,
        window,
        resetTime,
        retryAfter: 0,
      };
    } catch (error) {
      logger.error('Error checking rate limit', {
        context: 'RateLimiter',
        identifier: request.identifier,
        endpoint: request.endpoint,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // On error, allow request if graceful degradation is enabled
      if (allowOnFailure) {
        return {
          allowed: true,
          count: 0,
          limit,
          window,
          resetTime: window,
          retryAfter: 0,
        };
      } else {
        return {
          allowed: false,
          count: limit,
          limit,
          window,
          resetTime: window,
          retryAfter: window,
        };
      }
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetLimit(request: RateLimitRequest, keyGenerator?: (request: RateLimitRequest) => string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const key = keyGenerator
        ? keyGenerator(request)
        : defaultKeyGenerator(request, this.keyPrefix);

      const fullKey = `${this.keyPrefix}:${key}`;
      await redis!.del(fullKey);

      logger.debug('Rate limit reset', {
        context: 'RateLimiter',
        key: fullKey,
      });

      return true;
    } catch (error) {
      logger.error('Error resetting rate limit', {
        context: 'RateLimiter',
        identifier: request.identifier,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }
}

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();

// Export convenience function for common rate limit configurations
export async function rateLimit(
  request: RateLimitRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(request, options);
}

