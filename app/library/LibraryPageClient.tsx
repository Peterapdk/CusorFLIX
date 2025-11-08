'use client';

import { useRouter } from 'next/navigation';
import WatchlistSection from './components/WatchlistSection';
import CustomListsSection from './components/CustomListsSection';
import type { EnrichedLibraryItem } from '@/types/library';

type CustomList = {
  id: string;
  name: string;
  type: 'custom';
  items: Array<{ id: string; mediaType: string; tmdbId: number }>;
  enrichedItems: EnrichedLibraryItem[];
};

interface LibraryPageClientProps {
  watchlistMovies: EnrichedLibraryItem[];
  watchlistTVShows: EnrichedLibraryItem[];
  customLists: CustomList[];
}

export default function LibraryPageClient({ 
  watchlistMovies, 
  watchlistTVShows,
  customLists 
}: LibraryPageClientProps) {
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
            <h1 className="text-3xl font-bold text-foreground">My Library</h1>
            <p className="text-muted-foreground">Your watchlists and custom collections</p>
          </div>
        </div>

        {/* Watchlist Section - Always show, handles empty state internally */}
        <WatchlistSection
          movies={watchlistMovies}
          tvShows={watchlistTVShows}
          onWatchlistToggle={handleWatchlistToggle}
        />

        {/* Custom Lists Section */}
        <CustomListsSection lists={customLists} />
      </div>
    </main>
  );
}
