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

/**
 * Christmas collection IDs from TMDB
 */
const CHRISTMAS_ENGLISH_MOVIE_IDS = [
  850, 15302, 35700, 13540, 35002, 11181, 1081, 11210, 10510, 43015, 13374, 15264, 840430, 447365, 938, 13377, 654973, 13180, 17979, 154101, 26034, 51052, 13570, 10719, 26039, 109880, 13389, 16987, 771, 772, 8872, 13388, 9277, 622855, 508965, 14781, 14783, 13378, 14782, 509967, 14594, 775988, 13391, 815049, 511679, 10196, 9479, 5255, 11395, 13390, 13188, 13393, 785908, 57165, 17, 367123, 10147, 301337, 13915, 637, 10156, 440021, 12190, 11529, 520172, 9355, 507850, 508, 412450, 34509, 5825, 370980, 10077, 11130, 11982, 9354, 1581, 270438, 10427, 12271, 1636, 11504, 361903, 10459, 468300, 364, 17163, 562, 162, 489439, 9410, 927, 8321, 68721, 1442, 117, 287903, 941, 11046, 698, 48611, 77894, 10428, 13396, 899112, 13376, 331482, 29517, 13018
];

const CHRISTMAS_DANISH_MOVIE_IDS = [
  557342, 41822, 358172, 310578, 417215, 128919, 41810, 556693, 744654, 999268, 914346, 41830, 41825, 128925, 41812, 41829
];

const CHRISTMAS_DANISH_TV_IDS = [
  13882, 13876, 13874, 13875, 92171, 13881, 92173, 13880, 92174, 13884, 13883, 214309, 92172, 13878, 13879, 34293, 13873, 13877, 61899, 94951, 214159, 75417
];

async function getChristmasCollection(): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    const allItems: (TMDBMovie | TMDBTVShow)[] = [];
    
    // Fetch English movies
    const englishMoviePromises = CHRISTMAS_ENGLISH_MOVIE_IDS.map(id =>
      tmdbEnhanced.getMovieDetails(id)
        .then(movie => ({ ...movie, media_type: 'movie' as const }))
        .catch((error) => {
          logger.warn('Error fetching Christmas movie', { 
            context: 'DiscoveryPage', 
            id,
            error: error instanceof Error ? error : new Error(String(error))
          });
          return null;
        })
    );
    
    // Fetch Danish movies
    const danishMoviePromises = CHRISTMAS_DANISH_MOVIE_IDS.map(id =>
      tmdbEnhanced.getMovieDetails(id)
        .then(movie => ({ ...movie, media_type: 'movie' as const }))
        .catch((error) => {
          logger.warn('Error fetching Christmas Danish movie', { 
            context: 'DiscoveryPage', 
            id,
            error: error instanceof Error ? error : new Error(String(error))
          });
          return null;
        })
    );
    
    // Fetch Danish TV shows
    const danishTVPromises = CHRISTMAS_DANISH_TV_IDS.map(id =>
      tmdbEnhanced.getTVDetails(id)
        .then(tv => ({ ...tv, media_type: 'tv' as const }))
        .catch((error) => {
          logger.warn('Error fetching Christmas Danish TV show', { 
            context: 'DiscoveryPage', 
            id,
            error: error instanceof Error ? error : new Error(String(error))
          });
          return null;
        })
    );
    
    // Fetch all in parallel (with batching to avoid overwhelming the API)
    const batchSize = 10;
    const allPromises = [...englishMoviePromises, ...danishMoviePromises, ...danishTVPromises];
    
    // Process in batches
    for (let i = 0; i < allPromises.length; i += batchSize) {
      const batch = allPromises.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch);
      const validItems = batchResults.filter((item) => item !== null) as (TMDBMovie | TMDBTVShow)[];
      allItems.push(...validItems);
    }
    
    return allItems;
  } catch (error) {
    logger.error('Error fetching Christmas collection', { 
      context: 'DiscoveryPage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

async function getCollections(): Promise<Collection[]> {
  try {
    const christmasItems = await getChristmasCollection();
    
    const collections: Collection[] = [];
    
    if (christmasItems.length > 0) {
      // Separate movies and TV shows
      const movies = christmasItems.filter((item): item is TMDBMovie => isMovie(item));
      const tvShows = christmasItems.filter((item): item is TMDBTVShow => isTVShow(item));
      
      collections.push({
        id: 'christmas',
        name: 'Christmas',
        description: `Festive Christmas movies and TV shows to get you in the holiday spirit (${movies.length} movies, ${tvShows.length} TV shows)`,
        items: [...movies, ...tvShows],
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

