import { getTrending } from '@/lib/tmdb';
import HeroSection from '@/components/ui/HeroSection';
import ContentCarousel from '@/components/ui/ContentCarousel';
import logger from '@/lib/logger';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

async function getTrendingData() {
  try {
    const [movies, tv] = await Promise.all([
      getTrending('movie', 'week').catch((error) => {
        logger.error('Error fetching trending movies', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
        return { results: [] };
      }),
      getTrending('tv', 'week').catch((error) => {
        logger.error('Error fetching trending TV', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
        return { results: [] };
      }),
    ]);

    return { movies, tv };
  } catch (error) {
    logger.error('Error fetching trending data', { context: 'HomePage', error: error instanceof Error ? error : new Error(String(error)) });
    return {
      movies: { results: [] },
      tv: { results: [] },
    };
  }
}

export default async function HomePage() {
  const { movies, tv } = await getTrendingData();

  // Add media_type to results for better component handling
  const moviesWithType = movies.results
    .filter(isMovie)
    .map((movie) => ({ ...movie, media_type: 'movie' as const })) as Array<TMDBMovie & { media_type: 'movie' }>;
  const tvWithType = tv.results
    .filter(isTVShow)
    .map((show) => ({ ...show, media_type: 'tv' as const })) as Array<TMDBTVShow & { media_type: 'tv' }>;

  return (
    <main className="min-h-screen bg-cinema-black">
      {/* Hero Section */}
      <HeroSection featuredContent={moviesWithType[0]} />

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 space-y-8">
        {/* Top 10 Movies */}
        {moviesWithType.length > 0 && (
          <ContentCarousel
            title="Top 10 Movies"
            items={moviesWithType.slice(0, 10)}
            showRanking={true}
          />
        )}

        {/* Top 10 TV Shows */}
        {tvWithType.length > 0 && (
          <ContentCarousel
            title="Top 10 Shows"
            items={tvWithType.slice(0, 10)}
            showRanking={true}
          />
        )}

        {/* Trending Movies */}
        {moviesWithType.length > 0 && (
          <ContentCarousel
            title="Trending Movies"
            items={moviesWithType}
            showRanking={false}
          />
        )}

        {/* Trending TV Shows */}
        {tvWithType.length > 0 && (
          <ContentCarousel
            title="Trending TV"
            items={tvWithType}
            showRanking={false}
          />
        )}

        {/* Empty State */}
        {moviesWithType.length === 0 && tvWithType.length === 0 && (
          <div className="container mx-auto px-6 py-16">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-white">Unable to load content</h2>
              <p className="text-cinema-white-dim">
                Please check your TMDB API configuration
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
