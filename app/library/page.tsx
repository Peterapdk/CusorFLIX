import { prisma } from '@/lib/db';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import { getOrCreateDemoUser } from '@/lib/auth';
import logger from '@/lib/logger';
import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';
import type { EnrichedLibraryItem } from '@/types/library';
import LibraryPageClient from './LibraryPageClient';
import Link from 'next/link';

// Force dynamic rendering for user-specific data that changes with user interactions
// Users need to see their latest watchlist and custom list changes immediately
export const dynamic = 'force-dynamic';

async function getLibraryItems(userId: string) {
  try {
    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return lists;
  } catch (error) {
    logger.error('Error fetching library', { context: 'LibraryPage', error: error instanceof Error ? error : new Error(String(error)) });
    return [];
  }
}

async function enrichItems(items: Array<{ id: string; mediaType: string; tmdbId: number; createdAt: Date }>) {
  const enriched = await Promise.allSettled(
    items.map(async (item) => {
      try {
        if (item.mediaType === 'movie') {
          const details = await tmdbEnhanced.getMovieDetails(item.tmdbId.toString()) as TMDBMovieDetails;
          return {
            listItemId: item.id,
            id: item.tmdbId,
            title: details.title,
            release_date: details.release_date,
            poster_path: details.poster_path || null,
            vote_average: details.vote_average || 0,
            genre_ids: details.genre_ids || [],
            media_type: 'movie' as const,
            addedAt: item.createdAt,
          };
        } else {
          const details = await tmdbEnhanced.getTVDetails(item.tmdbId.toString()) as TMDBTVShowDetails;
          return {
            listItemId: item.id,
            id: item.tmdbId,
            name: details.name,
            first_air_date: details.first_air_date,
            poster_path: details.poster_path || null,
            vote_average: details.vote_average || 0,
            genre_ids: details.genre_ids || [],
            media_type: 'tv' as const,
            addedAt: item.createdAt,
          };
        }
      } catch (error) {
        logger.error(`Error fetching details for ${item.mediaType} ${item.tmdbId}`, { 
          context: 'LibraryPage', 
          mediaType: item.mediaType, 
          tmdbId: item.tmdbId,
          error: error instanceof Error ? error : new Error(String(error))
        });
        return null;
      }
    })
  );

  const results = enriched
    .map((result) => (result.status === 'fulfilled' ? result.value : null))
    .filter((item) => item !== null);
  
  return results as EnrichedLibraryItem[];
}

export default async function LibraryPage() {
  const userId = await getOrCreateDemoUser();
  
  if (!userId) {
    return (
      <main className="min-h-screen bg-background pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6 py-16">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Database Connection Issue</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Unable to connect to the database. Please check your DATABASE_URL configuration.
            </p>
            <Link href="/" className="btn-primary mt-6">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const lists = await getLibraryItems(userId);
  
  // Separate watchlist from custom lists
  const watchlist = lists.find(list => list.type === 'watchlist');
  const customLists = lists.filter(list => list.type === 'custom');
  
  // Group watchlist items by mediaType and enrich separately
  const watchlistMovies = watchlist?.items.filter(item => item.mediaType === 'movie') || [];
  const watchlistTVShows = watchlist?.items.filter(item => item.mediaType === 'tv') || [];
  
  // Enrich watchlist items in parallel
  const [enrichedWatchlistMovies, enrichedWatchlistTVShows] = await Promise.all([
    enrichItems(watchlistMovies),
    enrichItems(watchlistTVShows),
  ]);
  
  // Enrich custom lists (for future use, hidden for now)
  // Type assertion needed since we've filtered to only custom lists
  const enrichedCustomLists = await Promise.all(
    customLists.map(async (list) => {
      const enriched = await enrichItems(list.items);
      return {
        ...list,
        type: 'custom' as const,
        enrichedItems: enriched,
      };
    })
  );

  return (
    <LibraryPageClient 
      watchlistMovies={enrichedWatchlistMovies}
      watchlistTVShows={enrichedWatchlistTVShows}
      customLists={enrichedCustomLists.filter(list => list.name) as any}
    />
  );
}