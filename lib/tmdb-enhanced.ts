import { cacheManager } from '@/lib/cache/redis-cache';
import logger from '@/lib/logger';
import {
  getTrending as tmdbGetTrending,
  searchMulti as tmdbSearchMulti,
  getMovieDetails as tmdbGetMovieDetails,
  getTVDetails as tmdbGetTVDetails,
  discoverMovies as tmdbDiscoverMovies,
  discoverTVShows as tmdbDiscoverTVShows,
  getTVSeason as tmdbGetTVSeason,
  searchKeyword as tmdbSearchKeyword,
  type DiscoverMoviesOptions,
  type DiscoverTVOptions,
  type MediaType,
} from '@/lib/tmdb';
import type {
  TMDBTrendingResponse,
  TMDBSearchResult,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBSeasonDetails,
} from '@/types/tmdb';
import type { TMDBKeywordSearchResponse } from '@/lib/tmdb';

const CACHE_PREFIX = 'tmdb';
const TRENDING_TTL = 1800; // 30 minutes
const DETAILS_TTL = 3600; // 1 hour
const SEARCH_TTL = 900; // 15 minutes
const DISCOVER_TTL = 1800; // 30 minutes
const SEASON_TTL = 3600; // 1 hour

/**
 * Generate cache key for trending
 */
function getTrendingKey(mediaType: MediaType, timeWindow: 'day' | 'week'): string {
  return `trending:${mediaType}:${timeWindow}`;
}

/**
 * Generate cache key for search
 */
function getSearchKey(query: string, page: number): string {
  const normalizedQuery = query.toLowerCase().trim();
  return `search:${normalizedQuery}:page:${page}`;
}

/**
 * Generate cache key for movie details
 */
function getMovieDetailsKey(id: string | number): string {
  return `movie:${id}`;
}

/**
 * Generate cache key for TV details
 */
function getTVDetailsKey(id: string | number): string {
  return `tv:${id}`;
}

/**
 * Generate cache key for TV season
 */
function getTVSeasonKey(id: string | number, seasonNumber: number): string {
  return `tv:${id}:season:${seasonNumber}`;
}

/**
 * Generate cache key for discover movies
 */
function getDiscoverMoviesKey(options: DiscoverMoviesOptions): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .map((key) => `${key}:${options[key as keyof DiscoverMoviesOptions]}`)
    .join(':');
  return `discover:movies:${sortedOptions}`;
}

/**
 * Generate cache key for discover TV shows
 */
function getDiscoverTVKey(options: DiscoverTVOptions): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .map((key) => `${key}:${options[key as keyof DiscoverTVOptions]}`)
    .join(':');
  return `discover:tv:${sortedOptions}`;
}

/**
 * Enhanced TMDB client with Redis caching
 */
export const tmdbEnhanced = {
  /**
   * Get trending movies or TV shows with caching
   */
  async getTrending(
    mediaType: MediaType = 'movie',
    timeWindow: 'day' | 'week' = 'week'
  ): Promise<TMDBTrendingResponse> {
    const cacheKey = getTrendingKey(mediaType, timeWindow);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBTrendingResponse>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: trending', {
        context: 'TMDBEnhanced',
        mediaType,
        timeWindow,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: trending', {
      context: 'TMDBEnhanced',
      mediaType,
      timeWindow,
    });

    try {
      const result = await tmdbGetTrending(mediaType, timeWindow);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        TRENDING_TTL,
        CACHE_PREFIX,
        ['trending', `trending:${mediaType}`]
      );

      return result;
    } catch (error) {
      logger.error('Error fetching trending from TMDB', {
        context: 'TMDBEnhanced',
        mediaType,
        timeWindow,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Search movies, TV shows, and people with caching
   */
  async searchMulti(query: string, page = 1): Promise<TMDBSearchResult> {
    const cacheKey = getSearchKey(query, page);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBSearchResult>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: search', {
        context: 'TMDBEnhanced',
        query,
        page,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: search', {
      context: 'TMDBEnhanced',
      query,
      page,
    });

    try {
      const result = await tmdbSearchMulti(query, page);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        SEARCH_TTL,
        CACHE_PREFIX,
        ['search', `search:${query.toLowerCase().trim()}`]
      );

      return result;
    } catch (error) {
      logger.error('Error searching TMDB', {
        context: 'TMDBEnhanced',
        query,
        page,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Get movie details with caching
   */
  async getMovieDetails(
    id: string | number,
    options?: { append_to_response?: string }
  ): Promise<TMDBMovieDetails> {
    const cacheKey = getMovieDetailsKey(id);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBMovieDetails>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: movie details', {
        context: 'TMDBEnhanced',
        id,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: movie details', {
      context: 'TMDBEnhanced',
      id,
    });

    try {
      const result = await tmdbGetMovieDetails(id, options);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        DETAILS_TTL,
        CACHE_PREFIX,
        ['movie', `movie:${id}`]
      );

      return result;
    } catch (error) {
      logger.error('Error fetching movie details from TMDB', {
        context: 'TMDBEnhanced',
        id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Get TV show details with caching
   */
  async getTVDetails(
    id: string | number,
    options?: { append_to_response?: string }
  ): Promise<TMDBTVShowDetails> {
    const cacheKey = getTVDetailsKey(id);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBTVShowDetails>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: TV details', {
        context: 'TMDBEnhanced',
        id,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: TV details', {
      context: 'TMDBEnhanced',
      id,
    });

    try {
      const result = await tmdbGetTVDetails(id, options);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        DETAILS_TTL,
        CACHE_PREFIX,
        ['tv', `tv:${id}`]
      );

      return result;
    } catch (error) {
      logger.error('Error fetching TV details from TMDB', {
        context: 'TMDBEnhanced',
        id,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Get TV season details with caching
   */
  async getTVSeason(id: string | number, seasonNumber: number): Promise<TMDBSeasonDetails> {
    const cacheKey = getTVSeasonKey(id, seasonNumber);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBSeasonDetails>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: TV season', {
        context: 'TMDBEnhanced',
        id,
        seasonNumber,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: TV season', {
      context: 'TMDBEnhanced',
      id,
      seasonNumber,
    });

    try {
      const result = await tmdbGetTVSeason(id, seasonNumber);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        SEASON_TTL,
        CACHE_PREFIX,
        ['tv', `tv:${id}`, `tv:${id}:seasons`]
      );

      return result;
    } catch (error) {
      logger.error('Error fetching TV season from TMDB', {
        context: 'TMDBEnhanced',
        id,
        seasonNumber,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Discover movies with caching
   */
  async discoverMovies(options: DiscoverMoviesOptions = {}): Promise<TMDBTrendingResponse> {
    const cacheKey = getDiscoverMoviesKey(options);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBTrendingResponse>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: discover movies', {
        context: 'TMDBEnhanced',
        options,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: discover movies', {
      context: 'TMDBEnhanced',
      options,
    });

    try {
      const result = await tmdbDiscoverMovies(options);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        DISCOVER_TTL,
        CACHE_PREFIX,
        ['discover', 'discover:movies']
      );

      return result;
    } catch (error) {
      logger.error('Error discovering movies from TMDB', {
        context: 'TMDBEnhanced',
        options,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Discover TV shows with caching
   */
  async discoverTVShows(options: DiscoverTVOptions = {}): Promise<TMDBTrendingResponse> {
    const cacheKey = getDiscoverTVKey(options);

    // Try to get from cache
    const cached = await cacheManager.get<TMDBTrendingResponse>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: discover TV', {
        context: 'TMDBEnhanced',
        options,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: discover TV', {
      context: 'TMDBEnhanced',
      options,
    });

    try {
      const result = await tmdbDiscoverTVShows(options);

      // Cache the result
      await cacheManager.set(
        cacheKey,
        result,
        DISCOVER_TTL,
        CACHE_PREFIX,
        ['discover', 'discover:tv']
      );

      return result;
    } catch (error) {
      logger.error('Error discovering TV shows from TMDB', {
        context: 'TMDBEnhanced',
        options,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },

  /**
   * Search keywords with caching
   */
  async searchKeyword(query: string): Promise<TMDBKeywordSearchResponse> {
    const cacheKey = `search:keyword:${query.toLowerCase().trim()}`;

    // Try to get from cache
    const cached = await cacheManager.get<TMDBKeywordSearchResponse>(cacheKey, CACHE_PREFIX);
    if (cached !== null) {
      logger.debug('TMDB cache hit: keyword search', {
        context: 'TMDBEnhanced',
        query,
      });
      return cached;
    }

    // Cache miss - fetch from TMDB
    logger.debug('TMDB cache miss: keyword search', {
      context: 'TMDBEnhanced',
      query,
    });

    try {
      const result = await tmdbSearchKeyword(query);

      // Cache the result (15min TTL, same as search)
      await cacheManager.set(
        cacheKey,
        result,
        SEARCH_TTL,
        CACHE_PREFIX,
        ['search', 'keywords']
      );

      return result;
    } catch (error) {
      logger.error('Error searching keywords from TMDB', {
        context: 'TMDBEnhanced',
        query,
        error: error instanceof Error ? error : new Error(String(error)),
      });
      throw error;
    }
  },
};

/**
 * Invalidate TMDB cache for a specific movie
 */
export async function invalidateMovieCache(id: string | number): Promise<number> {
  try {
    return await cacheManager.invalidateTags([`movie:${id}`, 'movie']);
  } catch (error) {
    logger.error('Error invalidating movie cache', {
      context: 'TMDBEnhanced',
      id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return 0;
  }
}

/**
 * Invalidate TMDB cache for a specific TV show
 */
export async function invalidateTVCache(id: string | number): Promise<number> {
  try {
    return await cacheManager.invalidateTags([`tv:${id}`, 'tv', `tv:${id}:seasons`]);
  } catch (error) {
    logger.error('Error invalidating TV cache', {
      context: 'TMDBEnhanced',
      id,
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return 0;
  }
}

/**
 * Invalidate all trending cache
 */
export async function invalidateTrendingCache(): Promise<number> {
  try {
    return await cacheManager.invalidateTag('trending');
  } catch (error) {
    logger.error('Error invalidating trending cache', {
      context: 'TMDBEnhanced',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return 0;
  }
}

/**
 * Invalidate all discover cache
 */
export async function invalidateDiscoverCache(): Promise<number> {
  try {
    return await cacheManager.invalidateTags(['discover', 'discover:movies', 'discover:tv']);
  } catch (error) {
    logger.error('Error invalidating discover cache', {
      context: 'TMDBEnhanced',
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return 0;
  }
}

