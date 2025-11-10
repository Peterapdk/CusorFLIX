import { Suspense } from 'react';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import HeroSection from '@/components/ui/HeroSection';
import Top10TrendingSection from '@/components/ui/Top10TrendingSection';
import HeroSkeleton from '@/components/ui/HeroSkeleton';
import CarouselSkeleton from '@/components/ui/CarouselSkeleton';
import logger from '@/lib/logger';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';
import { getOrCreateDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Use dynamic rendering to ensure environment variables are available at runtime
// This prevents build-time errors when TMDB API keys are not available during build
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static generation for now

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

// Async component for movies with Top 10 & Trending selector
async function MoviesSection() {
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
    <Top10TrendingSection
      title="Movies"
      top10Items={moviesWithType.slice(0, 10)}
      trendingItems={moviesWithType}
      watchlistIds={watchlistIds}
    />
  );
}

// Async component for TV shows with Top 10 & Trending selector
async function TVShowsSection() {
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
    <Top10TrendingSection
      title="TV Shows"
      top10Items={tvWithType.slice(0, 10)}
      trendingItems={tvWithType}
      watchlistIds={watchlistIds}
    />
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
        <Suspense fallback={<CarouselSkeleton />}>
          <MoviesSection />
        </Suspense>

        <Suspense fallback={<CarouselSkeleton />}>
          <TVShowsSection />
        </Suspense>
      </div>
    </main>
  );
}
