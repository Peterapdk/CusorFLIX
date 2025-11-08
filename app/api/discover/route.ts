import { NextRequest, NextResponse } from 'next/server';
import { discoverMovies, discoverTVShows } from '@/lib/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import type { MediaFilter, SortOption } from '@/types/library';
import { getLanguageCodesForRegions } from '@/lib/tmdb-languages';
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

  // Regions: Convert region IDs to language codes
  // Since TMDB only supports single language, we'll use the first language code
  // or combine multiple regions' languages (TMDB will use OR logic with multiple calls)
  if (filters.regions && filters.regions.length > 0) {
    const languageCodes = getLanguageCodesForRegions(filters.regions);
    // TMDB API only accepts single language, so we use the first one
    // For better results with multiple regions, we could make multiple API calls
    // For now, we'll use the most common language or first language
    if (languageCodes.length > 0) {
      // Prefer English, Spanish, or Chinese as they're most common
      const preferredLanguages = ['en', 'es', 'zh', 'ja', 'fr', 'de'];
      const preferred = languageCodes.find(lang => preferredLanguages.includes(lang));
      options.with_original_language = preferred || languageCodes[0];
    }
  }

  // Languages: Direct language codes (if provided, takes precedence over regions)
  if (filters.languages && filters.languages.length > 0) {
    // TMDB only supports single language, use first one
    options.with_original_language = filters.languages[0];
  }

  // Minimum rating (for star buttons: 4, 6, or 8)
  if (filters.minRating !== undefined) {
    options['vote_average.gte'] = filters.minRating;
  }

  // Year: Single year filter (use year parameter for better performance)
  if (filters.yearRange?.min !== undefined) {
    if (isMovieType) {
      options.primary_release_year = filters.yearRange.min;
    } else {
      options.first_air_date_year = filters.yearRange.min;
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

