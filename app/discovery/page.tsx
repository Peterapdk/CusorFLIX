import { discoverMovies, discoverTVShows, searchKeyword } from '@/lib/tmdb';
import { getOrCreateDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import logger from '@/lib/logger';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import DiscoveryPageClient from './DiscoveryPageClient';

interface Collection {
  id: string;
  name: string;
  description?: string;
  items: (TMDBMovie | TMDBTVShow)[];
}

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

async function getChristmasMovies(): Promise<TMDBMovie[]> {
  try {
    // Search for Christmas keyword
    const keywordResponse = await searchKeyword('christmas').catch(() => null);
    
    if (!keywordResponse || keywordResponse.results.length === 0) {
      logger.warn('Christmas keyword not found, using fallback', { context: 'DiscoveryPage' });
      // Fallback: Use a known Christmas keyword ID (1743) if search fails
      const response = await discoverMovies({
        page: 1,
        sort_by: 'popularity.desc',
        with_keywords: '1743', // Christmas keyword ID
      });
      return response.results.filter(isMovie);
    }
    
    // Use the first Christmas keyword found
    const christmasKeywordId = keywordResponse.results[0].id.toString();
    const response = await discoverMovies({
      page: 1,
      sort_by: 'popularity.desc',
      with_keywords: christmasKeywordId,
    });
    
    return response.results.filter(isMovie);
  } catch (error) {
    logger.error('Error fetching Christmas movies', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

async function getCollections(): Promise<Collection[]> {
  try {
    const christmasMovies = await getChristmasMovies();
    
    const collections: Collection[] = [];
    
    if (christmasMovies.length > 0) {
      collections.push({
        id: 'christmas',
        name: 'Christmas',
        description: 'Festive Christmas movies to get you in the holiday spirit',
        items: christmasMovies,
      });
    }
    
    return collections;
  } catch (error) {
    logger.error('Error fetching collections', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

export default async function DiscoveryPage() {
  const userId = await getOrCreateDemoUser();
  const watchlistIds = await getWatchlistIds(userId);
  
  // Fetch movies, TV shows, and collections in parallel
  const [movies, tvShows, collections] = await Promise.all([
    getDiscoverMovies(),
    getDiscoverTVShows(),
    getCollections(),
  ]);

  return (
    <DiscoveryPageClient 
      movies={movies}
      tvShows={tvShows}
      collections={collections}
      watchlistIds={watchlistIds}
    />
  );
}

