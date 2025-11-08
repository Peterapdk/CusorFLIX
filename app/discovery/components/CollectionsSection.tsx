'use client';

import MediaCardWithWatchlist from '@/components/ui/MediaCardWithWatchlist';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface Collection {
  id: string;
  name: string;
  description?: string;
  items: (TMDBMovie | TMDBTVShow)[];
}

interface CollectionsSectionProps {
  collections: Collection[];
  watchlistIds: number[];
  onWatchlistToggle?: (id: number) => void;
}

export default function CollectionsSection({
  collections,
  watchlistIds,
  onWatchlistToggle
}: CollectionsSectionProps) {
  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No collections available</h3>
        <p className="text-muted-foreground">Collections will appear here when available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {collections.map((collection) => (
        <div key={collection.id} className="space-y-4">
          {/* Collection Header */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground">{collection.name}</h3>
            {collection.description && (
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {collection.items.length} {collection.items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Collection Items */}
          {collection.items.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No items in this collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {collection.items.map((item) => (
                <MediaCardWithWatchlist
                  key={`collection-${collection.id}-${item.id}`}
                  item={item}
                  size="medium"
                  initialInWatchlist={watchlistIds.includes(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

