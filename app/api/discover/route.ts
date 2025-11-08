import { NextRequest, NextResponse } from 'next/server';
import { discoverMovies, discoverTVShows } from '@/lib/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import type { MediaFilter, SortOption } from '@/types/library';
import logger from '@/lib/logger';

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
  // If multiple languages selected, we use the first one
  // TODO: Could make multiple API calls and merge results for better multi-language support
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const pageParam = searchParams.get('page');
    const filtersJson = searchParams.get('filters');
    const sortOptionParam = searchParams.get('sortOption');
    const sortDirectionParam = searchParams.get('sortDirection');

    // Validate type parameter
    if (!type || (type !== 'movie' && type !== 'tv')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "movie" or "tv"' },
        { status: 400 }
      );
    }

    // Parse parameters
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const filters: MediaFilter = filtersJson ? JSON.parse(filtersJson) : {};
    const sortOption = (sortOptionParam || 'popularity') as SortOption;
    const sortDirection = (sortDirectionParam || 'desc') as 'asc' | 'desc';

    // Validate page number
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    // Convert filters to TMDB discover options
    const discoverOptions = convertFiltersToDiscoverOptions(
      filters,
      sortOption,
      sortDirection,
      type === 'movie'
    );

    // Add page number
    discoverOptions.page = page;

    // Fetch from TMDB
    let response;
    if (type === 'movie') {
      response = await discoverMovies(discoverOptions);
    } else {
      response = await discoverTVShows(discoverOptions);
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
    logger.error('Error in discover API route', {
      context: 'DiscoverAPI',
      error: error instanceof Error ? error : new Error(String(error)),
      type: request.nextUrl.searchParams.get('type'),
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch discover results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

