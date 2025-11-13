'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { lazy, Suspense } from 'react';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

const DiscoverySection = lazy(() => import('./components/DiscoverySection'));

interface Collection {
  id: string;
  name: string;
  description?: string;
  items: (TMDBMovie | TMDBTVShow)[];
}

interface DiscoveryPageClientProps {
  movies: TMDBMovie[];
  tvShows: TMDBTVShow[];
  collections: Collection[];
  watchlistIds: number[];
  searchQuery?: string;
}

export default function DiscoveryPageClient({ 
  movies, 
  tvShows,
  collections,
  watchlistIds,
  searchQuery: initialSearchQuery
}: DiscoveryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || initialSearchQuery || '';

  const handleWatchlistToggle = async (id: number) => {
    // Refresh the page to update watchlist after toggle
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q')?.toString().trim() || '';
    if (query) {
      router.push(`/discovery?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/discovery');
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Search Form */}
        <div className="max-w-2xl mx-auto">
          <form action="/discovery" onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search for movies, TV shows, actors..."
                className="w-full bg-card border border-border rounded-lg px-6 py-4 pr-12 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-cinema-orange transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Discovery Section */}
        <Suspense fallback={
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-muted-foreground">Loading discovery...</p>
          </div>
        }>
          <DiscoverySection
            movies={movies}
            tvShows={tvShows}
            collections={collections}
            watchlistIds={watchlistIds}
            onWatchlistToggle={handleWatchlistToggle}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </main>
  );
}

