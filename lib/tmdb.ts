const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_V4_BASE_URL = process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL || 'https://api.themoviedb.org/4';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

type HttpMethod = 'GET' | 'POST' | 'DELETE';

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

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      // cache: 'force-cache' // tune per route as needed
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const error = new Error(`TMDB ${method} ${url.pathname} failed: ${res.status} ${res.statusText}`);
      (error as any).status = res.status;
      (error as any).responseText = text;
      throw error;
    }

    return res.json() as Promise<T>;
  } catch (error) {
    // Re-throw if it's already our error
    if (error instanceof Error && (error as any).status) {
      throw error;
    }
    // Otherwise, wrap network/parsing errors
    throw new Error(`TMDB request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export type MediaType = 'movie' | 'tv';

export async function getTrending(mediaType: MediaType = 'movie', timeWindow: 'day' | 'week' = 'week') {
  return tmdbFetch<{ results: any[] }>(`/trending/${mediaType}/${timeWindow}`);
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<{ results: any[] }>(`/search/multi`, { query: { query, page } });
}

export async function getMovieDetails(id: string | number, options?: { append_to_response?: string }) {
  return tmdbFetch(`/movie/${id}`, { query: { language: 'en-US', append_to_response: options?.append_to_response } });
}

export async function getTVDetails(id: string | number, options?: { append_to_response?: string }) {
  return tmdbFetch(`/tv/${id}`, { query: { language: 'en-US', append_to_response: options?.append_to_response } });
}

export async function getTVSeason(id: string | number, seasonNumber: number) {
  return tmdbFetch(`/tv/${id}/season/${seasonNumber}`, { query: { language: 'en-US' } });
}

export const tmdb = {
  getTrending,
  searchMulti,
  getMovieDetails,
  getTVDetails,
  getTVSeason,
};


