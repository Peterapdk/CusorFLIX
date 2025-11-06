import { getTrending } from '@/lib/tmdb';
import HeroSection from '@/components/ui/HeroSection';
import ContentCarousel from '@/components/ui/ContentCarousel';

export const dynamic = 'force-dynamic';

async function getTrendingData() {
  try {
    const [movies, tv] = await Promise.all([
      getTrending('movie', 'week').catch((error) => {
        console.error('Error fetching trending movies:', error);
        return { results: [] };
      }),
      getTrending('tv', 'week').catch((error) => {
        console.error('Error fetching trending TV:', error);
        return { results: [] };
      }),
    ]);

    return { movies, tv };
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return {
      movies: { results: [] },
      tv: { results: [] },
    };
  }
}

export default async function HomePage() {
  const { movies, tv } = await getTrendingData();

  // Add media_type to results for better component handling
  const moviesWithType = movies.results.map((movie: any) => ({ ...movie, media_type: 'movie' as const }));
  const tvWithType = tv.results.map((show: any) => ({ ...show, media_type: 'tv' as const }));

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
