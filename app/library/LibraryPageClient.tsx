'use client';

import { useState } from 'react';
import Link from 'next/link';
import MediaCardWithRemove from '@/components/ui/MediaCardWithRemove';
import CreateListModal from '@/components/ui/CreateListModal';
import ListActions from '@/components/ui/ListActions';
import { toggleWatchlistWithAuth } from '@/server/actions/lists';

type EnrichedItem = {
  listItemId: string;
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
};

type List = {
  id: string;
  name: string;
  type: 'watchlist' | 'custom';
  items: Array<{ id: string; mediaType: string; tmdbId: number }>;
  enrichedItems: EnrichedItem[];
};

interface LibraryPageClientProps {
  lists: List[];
}

export default function LibraryPageClient({ lists: initialLists }: LibraryPageClientProps) {
  const [lists, setLists] = useState(initialLists);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleWatchlistToggle = async (id: number) => {
    // This will be handled by the MediaCardWithRemove component
    // We just need to refresh the page after toggle
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-section font-bold text-foreground">My Library</h1>
            <p className="text-muted-foreground">Your watchlists and custom collections</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Create List
          </button>
        </div>

        <CreateListModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

        {/* Library Content */}
        {lists.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-foreground">Your library is empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start building your collection by adding movies and TV shows to your watchlist!
            </p>
            <Link href="/search" className="btn-primary">
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {lists.map((list) => (
              <section key={list.id} className="space-y-6">
                {/* List Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{list.name}</h2>
                    <p className="text-muted-foreground capitalize">{list.type} • {list.items.length} items</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {list.type === 'watchlist' && (
                      <div className="flex items-center space-x-2 text-cinema-orange">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium">Watchlist</span>
                      </div>
                    )}
                    <ListActions listId={list.id} listName={list.name} listType={list.type} />
                  </div>
                </div>

                {/* List Content */}
                {list.enrichedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No items in this list</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {list.enrichedItems.map((item) => (
                      <MediaCardWithRemove
                        key={`${item.media_type}-${item.id}-${item.listItemId}`}
                        item={item}
                        listItemId={item.listItemId}
                        size="medium"
                        inWatchlist={list.type === 'watchlist'}
                        onWatchlistToggle={list.type === 'watchlist' ? handleWatchlistToggle : undefined}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

