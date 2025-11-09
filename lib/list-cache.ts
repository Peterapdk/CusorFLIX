import { cacheManager } from '@/lib/cache/redis-cache';
import logger from '@/lib/logger';
import type { List, ListItem } from '@prisma/client';

const CACHE_PREFIX = 'list';
const LIST_TTL = 1800; // 30 minutes
const LIST_ITEMS_TTL = 900; // 15 minutes

/**
 * List Cache Manager - Handles caching for user lists and list items
 */
export class ListCacheManager {
  /**
   * Get cache key for user lists
   */
  private static getListsKey(userId: string): string {
    return `user:${userId}:lists`;
  }

  /**
   * Get cache key for list items
   */
  private static getListItemsKey(listId: string, page?: number, limit?: number): string {
    const baseKey = `list:${listId}:items`;
    if (page !== undefined && limit !== undefined) {
      return `${baseKey}:page:${page}:limit:${limit}`;
    }
    return baseKey;
  }

  /**
   * Get cache key for watchlist IDs
   */
  private static getWatchlistIdsKey(userId: string): string {
    return `user:${userId}:watchlist:ids`;
  }

  /**
   * Get user lists from cache
   */
  static async getLists(userId: string): Promise<List[] | null> {
    try {
      const key = this.getListsKey(userId);
      const cached = await cacheManager.get<List[]>(key, CACHE_PREFIX);
      return cached;
    } catch (error) {
      logger.error('Error getting lists from cache', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Cache user lists
   */
  static async setLists(userId: string, lists: List[]): Promise<boolean> {
    try {
      const key = this.getListsKey(userId);
      const success = await cacheManager.set(
        key,
        lists,
        LIST_TTL,
        CACHE_PREFIX,
        [`user:${userId}`, 'lists']
      );
      return success;
    } catch (error) {
      logger.error('Error caching lists', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Get list items from cache
   */
  static async getListItems(
    listId: string,
    page?: number,
    limit?: number
  ): Promise<ListItem[] | null> {
    try {
      const key = this.getListItemsKey(listId, page, limit);
      const cached = await cacheManager.get<ListItem[]>(key, CACHE_PREFIX);
      return cached;
    } catch (error) {
      logger.error('Error getting list items from cache', {
        context: 'ListCacheManager',
        listId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Cache list items
   */
  static async setListItems(
    listId: string,
    items: ListItem[],
    page?: number,
    limit?: number
  ): Promise<boolean> {
    try {
      const key = this.getListItemsKey(listId, page, limit);
      const success = await cacheManager.set(
        key,
        items,
        LIST_ITEMS_TTL,
        CACHE_PREFIX,
        [`list:${listId}`, 'list-items']
      );
      return success;
    } catch (error) {
      logger.error('Error caching list items', {
        context: 'ListCacheManager',
        listId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Get watchlist IDs from cache
   */
  static async getWatchlistIds(userId: string): Promise<number[] | null> {
    try {
      const key = this.getWatchlistIdsKey(userId);
      const cached = await cacheManager.get<number[]>(key, CACHE_PREFIX);
      return cached;
    } catch (error) {
      logger.error('Error getting watchlist IDs from cache', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }

  /**
   * Cache watchlist IDs
   */
  static async setWatchlistIds(userId: string, ids: number[]): Promise<boolean> {
    try {
      const key = this.getWatchlistIdsKey(userId);
      const success = await cacheManager.set(
        key,
        ids,
        LIST_ITEMS_TTL,
        CACHE_PREFIX,
        [`user:${userId}`, 'watchlist']
      );
      return success;
    } catch (error) {
      logger.error('Error caching watchlist IDs', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Invalidate all cache for a user
   */
  static async invalidateUser(userId: string): Promise<number> {
    try {
      const tags = [`user:${userId}`];
      return await cacheManager.invalidateTags(tags);
    } catch (error) {
      logger.error('Error invalidating user cache', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Invalidate all cache for a list
   */
  static async invalidateList(listId: string): Promise<number> {
    try {
      const tags = [`list:${listId}`];
      return await cacheManager.invalidateTags(tags);
    } catch (error) {
      logger.error('Error invalidating list cache', {
        context: 'ListCacheManager',
        listId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Invalidate all lists cache
   */
  static async invalidateAllLists(): Promise<number> {
    try {
      return await cacheManager.invalidateTag('lists');
    } catch (error) {
      logger.error('Error invalidating all lists cache', {
        context: 'ListCacheManager',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Invalidate all list items cache
   */
  static async invalidateAllListItems(): Promise<number> {
    try {
      return await cacheManager.invalidateTag('list-items');
    } catch (error) {
      logger.error('Error invalidating all list items cache', {
        context: 'ListCacheManager',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }

  /**
   * Invalidate watchlist cache for a user
   */
  static async invalidateWatchlist(userId: string): Promise<number> {
    try {
      const tags = [`user:${userId}`, 'watchlist'];
      return await cacheManager.invalidateTags(tags);
    } catch (error) {
      logger.error('Error invalidating watchlist cache', {
        context: 'ListCacheManager',
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return 0;
    }
  }
}

