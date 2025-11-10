import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
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

// Force dynamic rendering - client handles all data fetching via API route
export const dynamic = 'force-dynamic';

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

async function getChristmasMovies(): Promise<TMDBMovie[]> {
  try {
    // Search for Christmas keyword (with caching)
    const keywordResponse = await tmdbEnhanced.searchKeyword('christmas').catch(() => null);
    
    if (!keywordResponse || keywordResponse.results.length === 0) {
      logger.warn('Christmas keyword not found, using fallback', { context: 'DiscoveryPage' });
      // Fallback: Use a known Christmas keyword ID (1743) if search fails
      const response = await tmdbEnhanced.discoverMovies({
        page: 1,
        sort_by: 'popularity.desc',
        with_keywords: '1743', // Christmas keyword ID
      });
      return response.results.filter(isMovie);
    }
    
    // Use the first Christmas keyword found
    const christmasKeywordId = keywordResponse.results[0].id.toString();
    const response = await tmdbEnhanced.discoverMovies({
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

export default async function DiscoveryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() || '';
  const userId = await getOrCreateDemoUser();
  const watchlistIds = await getWatchlistIds(userId);
  
  // Fetch collections (still server-side for SEO/initial render)
  // Movies and TV shows are fetched client-side via API route for dynamic filtering
  const collections = await getCollections();

  return (
    <DiscoveryPageClient 
      movies={[]} // Empty array - client will fetch via API route
      tvShows={[]} // Empty array - client will fetch via API route
      collections={collections}
      watchlistIds={watchlistIds}
      searchQuery={searchQuery}
    />
  );
}

