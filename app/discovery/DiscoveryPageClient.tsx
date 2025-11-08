'use client';

import { useRouter } from 'next/navigation';
import DiscoverySection from './components/DiscoverySection';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface DiscoveryPageClientProps {
  movies: TMDBMovie[];
  tvShows: TMDBTVShow[];
  watchlistIds: number[];
}

export default function DiscoveryPageClient({ 
  movies, 
  tvShows,
  watchlistIds
}: DiscoveryPageClientProps) {
  const router = useRouter();

  const handleWatchlistToggle = async (id: number) => {
    // Refresh the page to update watchlist after toggle
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Discovery</h1>
            <p className="text-muted-foreground">Discover movies and TV shows with filters and sorting</p>
          </div>
        </div>

        {/* Discovery Section */}
        <DiscoverySection
          movies={movies}
          tvShows={tvShows}
          watchlistIds={watchlistIds}
          onWatchlistToggle={handleWatchlistToggle}
        />
      </div>
    </main>
  );
}

