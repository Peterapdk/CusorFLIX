import { Suspense } from 'react';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import HeroSection from '@/components/ui/HeroSection';
import ContentCarouselWithWatchlist from '@/components/ui/ContentCarouselWithWatchlist';
import HeroSkeleton from '@/components/ui/HeroSkeleton';
import CarouselSkeleton from '@/components/ui/CarouselSkeleton';
import logger from '@/lib/logger';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import { getOrCreateDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Removed force-dynamic to enable proper caching with revalidation
export const revalidate = 3600; // Revalidate every hour

async function getWatchlistIds(userId: string | null): Promise<number[]> {
  if (!userId) return [];
  try {
    const watchlist = await prisma.list.findFirst({ where: { userId, type: 'watchlist' } });
    if (!watchlist) return [];
    const items = await prisma.listItem.findMany({ where: { listId: watchlist.id } });
    return items.map(item => item.tmdbId);
  } catch (error) {
    logger.error('Error fetching watchlist IDs', { 
      context: 'HomePage', 
      error: error instanceof Error ? error : new Error(String(error))
    });
    return [];
  }
}

// Async component for hero section
async function HeroContent() {
  const movies = await tmdbEnhanced.getTrending('movie', 'week').catch((error) => {
    logger.error('Error loading hero content', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
    return { results: [] };
  });
  
  const moviesWithType = movies.results
    .filter(isMovie)
    .map((movie) => ({ ...movie, media_type: 'movie' as const })) as Array<TMDBMovie & { media_type: 'movie' }>;
  
  if (moviesWithType.length === 0) return null;
  return <HeroSection featuredContent={moviesWithType[0]} />;
}

// Async component for trending movies
async function TrendingMovies() {
  const userId = await getOrCreateDemoUser();
  const watchlistIds = await getWatchlistIds(userId);
  
  const movies = await tmdbEnhanced.getTrending('movie', 'week').catch((error) => {
    logger.error('Error loading trending movies', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
    return { results: [] };
  });
  
  const moviesWithType = movies.results
    .filter(isMovie)
    .map((movie) => ({ ...movie, media_type: 'movie' as const })) as Array<TMDBMovie & { media_type: 'movie' }>;
  
  if (moviesWithType.length === 0) return null;
  
  return (
    <>
      <ContentCarouselWithWatchlist
        title="Top 10 Movies"
        items={moviesWithType.slice(0, 10)}
        showRanking={true}
        watchlistIds={watchlistIds}
      />
      <ContentCarouselWithWatchlist
        title="Trending Movies"
        items={moviesWithType}
        showRanking={false}
        watchlistIds={watchlistIds}
      />
    </>
  );
}

// Async component for trending TV shows
async function TrendingTVShows() {
  const userId = await getOrCreateDemoUser();
  const watchlistIds = await getWatchlistIds(userId);
  
  const tv = await tmdbEnhanced.getTrending('tv', 'week').catch((error) => {
    logger.error('Error loading trending TV shows', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
    return { results: [] };
  });
  
  const tvWithType = tv.results
    .filter(isTVShow)
    .map((show) => ({ ...show, media_type: 'tv' as const })) as Array<TMDBTVShow & { media_type: 'tv' }>;
  
  if (tvWithType.length === 0) return null;
  
  return (
    <>
      <ContentCarouselWithWatchlist
        title="Top 10 Shows"
        items={tvWithType.slice(0, 10)}
        showRanking={true}
        watchlistIds={watchlistIds}
      />
      <ContentCarouselWithWatchlist
        title="Trending TV"
        items={tvWithType}
        showRanking={false}
        watchlistIds={watchlistIds}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Suspense */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroContent />
      </Suspense>

      {/* Content Sections with Suspense */}
      <div className="relative z-10 -mt-32 space-y-8">
        <Suspense fallback={<><CarouselSkeleton /><CarouselSkeleton /></>}>
          <TrendingMovies />
        </Suspense>

        <Suspense fallback={<><CarouselSkeleton /><CarouselSkeleton /></>}>
          <TrendingTVShows />
        </Suspense>
      </div>
    </main>
  );
}
