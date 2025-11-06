import { prisma } from '@/lib/db';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import MediaCard from '@/components/ui/MediaCard';
import Link from 'next/link';
import { getOrCreateDemoUser } from '@/lib/auth';
import logger from '@/lib/logger';
import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';

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

async function enrichItems(items: Array<{ mediaType: string; tmdbId: number }>) {
  const enriched = await Promise.allSettled(
    items.map(async (item) => {
      try {
        if (item.mediaType === 'movie') {
          const details = await getMovieDetails(item.tmdbId) as TMDBMovieDetails;
          return {
            id: item.tmdbId,
            title: details.title,
            release_date: details.release_date,
            poster_path: details.poster_path || null,
            vote_average: details.vote_average || 0,
            media_type: 'movie' as const,
          };
        } else {
          const details = await getTVDetails(item.tmdbId) as TMDBTVShowDetails;
          return {
            id: item.tmdbId,
            name: details.name,
            first_air_date: details.first_air_date,
            poster_path: details.poster_path || null,
            vote_average: details.vote_average || 0,
            media_type: 'tv' as const,
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

  return enriched
    .map((result) => (result.status === 'fulfilled' ? result.value : null))
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export default async function LibraryPage() {
  const userId = await getOrCreateDemoUser();
  
  if (!userId) {
    return (
      <main className="min-h-screen bg-cinema-black pt-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6 py-16">
            <div className="w-24 h-24 bg-cinema-gray-dark rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-cinema-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Database Connection Issue</h1>
            <p className="text-cinema-white-dim max-w-md mx-auto">
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

  return (
    <main className="min-h-screen bg-cinema-black pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-section font-bold text-white">My Library</h1>
          <p className="text-cinema-white-dim">Your watchlists and custom collections</p>
        </div>

        {/* Library Content */}
        {lists.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-cinema-gray-dark rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-cinema-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white">Your library is empty</h3>
            <p className="text-cinema-white-dim max-w-md mx-auto">
              Start building your collection by adding movies and TV shows to your watchlist!
            </p>
            <Link href="/search" className="btn-primary">
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {await Promise.all(
              lists.map(async (list) => {
                const enrichedItems = await enrichItems(list.items);
                
                return (
                  <section key={list.id} className="space-y-6">
                    {/* List Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">{list.name}</h2>
                        <p className="text-cinema-white-dim capitalize">{list.type} • {list.items.length} items</p>
                      </div>
                      {list.type === 'watchlist' && (
                        <div className="flex items-center space-x-2 text-cinema-orange">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium">Watchlist</span>
                        </div>
                      )}
                    </div>

                    {/* List Content */}
                    {enrichedItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-cinema-white-dim">No items in this list</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {enrichedItems.map((item) => (
                          <MediaCard
                            key={`${item.media_type}-${item.id}`}
                            item={item}
                            size="medium"
                            inWatchlist={list.type === 'watchlist'}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}