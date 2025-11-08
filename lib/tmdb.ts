import type { 
  TMDBTrendingResponse, 
  TMDBSearchResult, 
  TMDBMovieDetails, 
  TMDBTVShowDetails,
  TMDBSeasonDetails,
  MediaType as TMDBMediaType
} from '@/types/tmdb';
import logger from '@/lib/logger';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_V4_BASE_URL = process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL || 'https://api.themoviedb.org/4';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'DELETE';

interface TMDBError extends Error {
  status?: number;
  responseText?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Determine if an error is retryable
function isRetryableError(error: TMDBError | Error): boolean {
  if ('status' in error && error.status) {
    // Retry on rate limiting and server errors
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }
  // Retry on network errors (no status code)
  return true;
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (TMDB_READ_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${TMDB_READ_ACCESS_TOKEN}`;
  } else if (TMDB_API_KEY) {
    // fallback to v3 api key via query param; auth header not set
  }
  return headers;
}

async function tmdbFetch<T>(path: string, init?: { method?: HttpMethod; body?: unknown; query?: Record<string, string | number | boolean | undefined> }): Promise<T> {                                                                          
  const { method = 'GET', body, query } = init || {};

  const base = TMDB_BASE_URL.replace(/\/$/, '');
  const url = new URL(base + path);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));    
    }
  }

  if (!TMDB_READ_ACCESS_TOKEN && TMDB_API_KEY) {
    url.searchParams.set('api_key', TMDB_API_KEY);
  }

  // Retry loop with exponential backoff
  let lastError: TMDBError | Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method,
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const error: TMDBError = new Error(`TMDB ${method} ${url.pathname} failed: ${res.status} ${res.statusText}`);
        error.status = res.status;
        error.responseText = text;
        throw error;
      }

      return res.json() as Promise<T>;
    } catch (error) {
      // Determine the actual error
      let tmdbError: TMDBError | Error;
      if (error instanceof Error && 'status' in error) {
        tmdbError = error;
      } else {
        tmdbError = new Error(`TMDB request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      lastError = tmdbError;
      
      // Check if we should retry
      const shouldRetry = attempt < MAX_RETRIES && isRetryableError(tmdbError);
      
      if (!shouldRetry) {
        throw tmdbError;
      }
      
      // Calculate exponential backoff delay
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      
      // Log retry attempt
      logger.warn(`TMDB API retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delay}ms`, {
        context: 'TMDB',
        path: url.pathname
      });
      
      await sleep(delay);
    }
  }
  
  // This shouldn't be reached, but TypeScript needs it
  throw lastError || new Error('TMDB request failed after retries');
}

export type MediaType = TMDBMediaType;

export async function getTrending(mediaType: MediaType = 'movie', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/trending/${mediaType}/${timeWindow}`);
}

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/search/multi`, { query: { query, page } });
}

export async function getMovieDetails(id: string | number, options?: { append_to_response?: string }): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, { query: { language: 'en-US', append_to_response: options?.append_to_response } });
}

export async function getTVDetails(id: string | number, options?: { append_to_response?: string }): Promise<TMDBTVShowDetails> {
  return tmdbFetch<TMDBTVShowDetails>(`/tv/${id}`, { query: { language: 'en-US', append_to_response: options?.append_to_response } });
}

export async function getTVSeason(id: string | number, seasonNumber: number): Promise<TMDBSeasonDetails> {
  return tmdbFetch<TMDBSeasonDetails>(`/tv/${id}/season/${seasonNumber}`, { query: { language: 'en-US' } });
}

export interface TMDBKeyword {
  id: number;
  name: string;
}

export interface TMDBKeywordSearchResponse {
  page: number;
  results: TMDBKeyword[];
  total_pages: number;
  total_results: number;
}

export async function searchKeyword(query: string): Promise<TMDBKeywordSearchResponse> {
  return tmdbFetch<TMDBKeywordSearchResponse>(`/search/keyword`, { query: { query, page: 1 } });
}

export interface DiscoverMoviesOptions {
  page?: number;
  sort_by?: string;
  with_genres?: string; // Comma-separated genre IDs
  with_keywords?: string; // Comma-separated keyword IDs
  primary_release_year?: number;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
}

export interface DiscoverTVOptions {
  page?: number;
  sort_by?: string;
  with_genres?: string; // Comma-separated genre IDs
  with_keywords?: string; // Comma-separated keyword IDs
  first_air_date_year?: number;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
}

export async function discoverMovies(options: DiscoverMoviesOptions = {}): Promise<TMDBTrendingResponse> {
  const query: Record<string, string | number | boolean | undefined> = {
    language: 'en-US',
    page: options.page || 1,
    ...options,
  };
  return tmdbFetch<TMDBTrendingResponse>(`/discover/movie`, { query });
}

export async function discoverTVShows(options: DiscoverTVOptions = {}): Promise<TMDBTrendingResponse> {
  const query: Record<string, string | number | boolean | undefined> = {
    language: 'en-US',
    page: options.page || 1,
    ...options,
  };
  return tmdbFetch<TMDBTrendingResponse>(`/discover/tv`, { query });
}

export const tmdb = {
  getTrending,
  searchMulti,
  getMovieDetails,
  getTVDetails,
  getTVSeason,
  discoverMovies,
  discoverTVShows,
  searchKeyword,
};


