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
    logger.info('Redis cache initialized', { context: 'CacheManager' });
  } else {
    logger.warn('Redis cache not configured - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN required', {
      context: 'CacheManager',
      note: 'Features will work with graceful degradation (no caching)',
    });
  }
} catch (error) {
  logger.error('Failed to initialize Redis cache', {
    context: 'CacheManager',
    error: error instanceof Error ? error : new Error(String(error)),
  });
}

/**
 * Cache Manager - Singleton pattern with tag-based invalidation
 */
export class CacheManager {
  private static instance: CacheManager;
  private readonly defaultTTL = 3600; // 1 hour default TTL

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of CacheManager
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Check if Redis is available
   */
  private isAvailable(): boolean {
    return redis !== null;
  }

  /**
   * Generate cache key with optional prefix
   */
  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * Generate tag key for tag-based invalidation
   */
  private getTagKey(tag: string): string {
    return `tag:${tag}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      const value = await redis!.get<T>(cacheKey);
      
      if (value !== null) {
        logger.debug('Cache hit', { context: 'CacheManager', key: cacheKey });
      } else {
        logger.debug('Cache miss', { context: 'CacheManager', key: cacheKey });
      }
      
      return value;
    } catch (error) {
      logger.error('Error getting from cache', {
        context: 'CacheManager',
        key,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null; // Graceful degradation - return null on error
    }
  }

  /**
   * Set value in cache with TTL and optional tags
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
    prefix?: string,
    tags?: string[]
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      const ttl = ttlSeconds ?? this.defaultTTL;

      // Set the value with TTL
      await redis!.setex(cacheKey, ttl, value);

      // If tags are provided, add key to tag sets for invalidation
      if (tags && tags.length > 0) {
        await Promise.all(
          tags.map(async (tag) => {
            const tagKey = this.getTagKey(tag);
            await redis!.sadd(tagKey, cacheKey);
            // Set TTL on tag set (longer than cache TTL to prevent orphaned tags)
            await redis!.expire(tagKey, ttl + 3600);
          })
        );
      }

      logger.debug('Cache set', {
        context: 'CacheManager',
        key: cacheKey,
        ttl,
        tags: tags?.join(',') || 'none',
      });

      return true;
    } catch (error) {
      logger.error('Error setting cache', {
        context: 'CacheManager',
        key,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false; // Graceful degradation - return false on error
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const cacheKey = this.getKey(key, prefix);
      await redis!.del(cacheKey);
      
      logger.debug('Cache deleted', { context: 'CacheManager', key: cacheKey });
      return true;
    } catch (error) {
      logger.error('Error deleting from cache', {
        context: 'CacheManager',
        key,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Invalidate all cache entries with the given tag
   */
  async invalidateTag(tag: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      const tagKey = this.getTagKey(tag);
      const keys = await redis!.smembers<string[]>(tagKey);

      if (keys.length === 0) {
        return 0;
      }

      // Delete all keys in the tag
      await Promise.all(keys.map((key) => redis!.del(key)));

      // Delete the tag set itself
      await redis!.del(tagKey);

      logger.info('Cache tag invalidated', {
        context: 'CacheManager',
        tag,
        keysDeleted: keys.length,
      });

      return keys.length;
    } catch (error) {
      logger.error('Error invalidating cache tag', {
        context: 'CacheManager',
        tag,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Invalidate multiple tags at once
   */
  async invalidateTags(tags: string[]): Promise<number> {
    if (!this.isAvailable() || tags.length === 0) {
      return 0;
    }

    try {
      const results = await Promise.all(tags.map((tag) => this.invalidateTag(tag)));
      return results.reduce((sum, count) => sum + count, 0);
    } catch (error) {
      logger.error('Error invalidating cache tags', {
        context: 'CacheManager',
        tags: tags.join(','),
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Note: This is a dangerous operation and should be used carefully
      // In production, consider using pattern-based deletion instead
      logger.warn('Cache clear requested', { context: 'CacheManager' });
      // Upstash Redis doesn't have a direct FLUSHALL, so this would need to be pattern-based
      // For safety, we'll log a warning and return false
      return false;
    } catch (error) {
      logger.error('Error clearing cache', {
        context: 'CacheManager',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

