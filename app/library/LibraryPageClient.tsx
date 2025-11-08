'use client';

import { useRouter } from 'next/navigation';
import WatchlistSection from './components/WatchlistSection';
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
      <div className="container mx-auto max-w-6xl space-y-8">
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

        {/* Custom Lists Section - Hidden for now */}
        {/* {customLists.length > 0 && (
          <div className="space-y-12">
            <h2 className="text-2xl font-semibold text-foreground">Custom Lists</h2>
            {customLists.map((list) => (
              <section key={list.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{list.name}</h3>
                    <p className="text-muted-foreground">{list.enrichedItems.length} items</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {list.enrichedItems.map((item) => (
                    <MediaCardWithRemove
                      key={`${item.media_type}-${item.id}-${item.listItemId}`}
                      item={item}
                      listItemId={item.listItemId}
                      size="medium"
                      inWatchlist={false}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )} */}
      </div>
    </main>
  );
}

