import { discoverMovies, discoverTVShows } from '@/lib/tmdb';
import { getOrCreateDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import logger from '@/lib/logger';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import DiscoveryPageClient from './DiscoveryPageClient';

// Cache discovery results for 1 hour
export const revalidate = 3600;

async function getWatchlistIds(userId: string | null): Promise<number[]> {
  if (!userId) return [];
  try {
    const watchlist = await prisma.list.findFirst({ where: { userId, type: 'watchlist' } });
    if (!watchlist) return [];
    const items = await prisma.listItem.findMany({ where: { listId: watchlist.id } });
    return items.map(item => item.tmdbId);
  } catch (error) {
    logger.error('Error fetching watchlist IDs', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

async function getDiscoverMovies(): Promise<TMDBMovie[]> {
  try {
    // Fetch popular movies (can be extended with filters from query params later)
    const response = await discoverMovies({
      page: 1,
      sort_by: 'popularity.desc',
    });
    
    const movies = response.results.filter(isMovie);
    return movies;
  } catch (error) {
    logger.error('Error fetching discover movies', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

async function getDiscoverTVShows(): Promise<TMDBTVShow[]> {
  try {
    // Fetch popular TV shows (can be extended with filters from query params later)
    const response = await discoverTVShows({
      page: 1,
      sort_by: 'popularity.desc',
    });
    
    const tvShows = response.results.filter(isTVShow);
    return tvShows;
  } catch (error) {
    logger.error('Error fetching discover TV shows', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

export default async function DiscoveryPage() {
  const userId = await getOrCreateDemoUser();
  const watchlistIds = await getWatchlistIds(userId);
  
  // Fetch movies and TV shows in parallel
  const [movies, tvShows] = await Promise.all([
    getDiscoverMovies(),
    getDiscoverTVShows(),
  ]);

  return (
    <DiscoveryPageClient 
      movies={movies}
      tvShows={tvShows}
      watchlistIds={watchlistIds}
    />
  );
}

