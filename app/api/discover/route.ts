import { NextRequest, NextResponse } from 'next/server';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import { isMovie, isTVShow } from '@/types/tmdb';
import type { MediaFilter, SortOption } from '@/types/library';
import logger from '@/lib/logger';
import { applyRateLimit, createRateLimitResponse, rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schemas
const discoverQuerySchema = z.object({
  type: z.enum(['movie', 'tv']),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).refine(val => val > 0, 'Page must be positive'),
  filters: z.string().optional().transform(val => {
    if (!val) return {};
    try {
      return JSON.parse(val);
    } catch {
      throw new Error('Invalid filters JSON');
    }
  }),
  sortOption: z.enum(['popularity', 'rating', 'release-date', 'title', 'date-added']).optional().default('popularity'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Force dynamic rendering - no caching for discovery results
export const dynamic = 'force-dynamic';

/**
 * Convert MediaFilter to TMDB discover options
 */
function convertFiltersToDiscoverOptions(
  filters: MediaFilter,
  sortOption: SortOption,
  sortDirection: 'asc' | 'desc',
  isMovieType: boolean
): Record<string, string | number | undefined> {
  const options: Record<string, string | number | undefined> = {
    page: 1,
  };

  // Sort option mapping to TMDB sort_by parameter
  const sortMap: Record<SortOption, string> = {
    'popularity': 'popularity.desc',
    'rating': 'vote_average.desc',
    'release-date': isMovieType ? 'primary_release_date.desc' : 'first_air_date.desc',
    'title': 'title.asc',
    'date-added': 'popularity.desc', // Fallback for date-added (not supported by TMDB)
  };

  options.sort_by = sortMap[sortOption] || 'popularity.desc';
  
  // Apply sort direction
  if (sortDirection === 'asc' && options.sort_by.endsWith('.desc')) {
    options.sort_by = options.sort_by.replace('.desc', '.asc');
  } else if (sortDirection === 'desc' && options.sort_by.endsWith('.asc')) {
    options.sort_by = options.sort_by.replace('.asc', '.desc');
  }

  // Genres: Convert array to comma-separated string
  if (filters.genres && filters.genres.length > 0) {
    options.with_genres = filters.genres.join(',');
  }

  // Languages: Direct language codes (multi-select)
  // Note: TMDB API only supports single language per request
  // If multiple languages selected, we use the first one (preferring common languages)
  // Future enhancement: Could make multiple API calls and merge results for better multi-language support
  if (filters.languages && filters.languages.length > 0) {
    // TMDB only supports single language, use first one
    // Prefer common languages if available
    const preferredLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    const preferred = filters.languages.find(lang => preferredLanguages.includes(lang));
    options.with_original_language = preferred || filters.languages[0];
  }

  // Minimum rating (for star buttons: 4, 6, or 8)
  if (filters.minRating !== undefined) {
    options['vote_average.gte'] = filters.minRating;
  }

  // Year range: Convert to date range or single year
  if (filters.yearRange) {
    const { min, max } = filters.yearRange;
    const currentYear = new Date().getFullYear();
    const MIN_YEAR = 1970;
    
    if (min !== undefined && max !== undefined && min === max) {
      // Single year: use year parameter for better performance
      if (isMovieType) {
        options.primary_release_year = min;
      } else {
        options.first_air_date_year = min;
      }
    } else {
      // Year range: use date parameters
      if (min !== undefined && min !== MIN_YEAR) {
        if (isMovieType) {
          options['primary_release_date.gte'] = `${min}-01-01`;
        } else {
          options['first_air_date.gte'] = `${min}-01-01`;
        }
      }
      if (max !== undefined && max < currentYear) {
        if (isMovieType) {
          options['primary_release_date.lte'] = `${max}-12-31`;
        } else {
          options['first_air_date.lte'] = `${max}-12-31`;
        }
      } else if (max === undefined && min !== undefined) {
        // If only min is set, set max to current year
        if (isMovieType) {
          options['primary_release_date.lte'] = `${currentYear}-12-31`;
        } else {
          options['first_air_date.lte'] = `${currentYear}-12-31`;
        }
      }
    }
  }

  return options;
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, rateLimiters.discover);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime);
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate and parse query parameters
    const validationResult = discoverQuerySchema.safeParse({
      type: searchParams.get('type'),
      page: searchParams.get('page'),
      filters: searchParams.get('filters'),
      sortOption: searchParams.get('sortOption'),
      sortDirection: searchParams.get('sortDirection'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { type, page, filters, sortOption, sortDirection } = validationResult.data;

    // Convert filters to TMDB discover options
    const discoverOptions = convertFiltersToDiscoverOptions(
      filters,
      sortOption,
      sortDirection,
      type === 'movie'
    );

    // Add page number
    discoverOptions.page = page;

    // Fetch from TMDB (with caching via enhanced client)
    let response;
    if (type === 'movie') {
      response = await tmdbEnhanced.discoverMovies(discoverOptions);
    } else {
      response = await tmdbEnhanced.discoverTVShows(discoverOptions);
    }

    // Filter results to ensure correct type
    const items = type === 'movie' 
      ? response.results.filter(isMovie)
      : response.results.filter(isTVShow);

    return NextResponse.json({
      results: items,
      page: response.page,
      total_pages: response.total_pages,
      total_results: response.total_results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isValidationError = errorMessage.includes('Invalid') || errorMessage.includes('validation');

    logger.error('Error in discover API route', {
      context: 'DiscoverAPI',
      error: error instanceof Error ? error : new Error(String(error)),
      type: request.nextUrl.searchParams.get('type'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        error: isValidationError ? 'Invalid request parameters' : 'Failed to fetch discover results',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An internal error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

