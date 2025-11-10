'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import MediaCardWithWatchlist from '@/components/ui/MediaCardWithWatchlist';
import { filterItems, sortItems } from '@/lib/library-utils';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import type { MediaFilter, SortOption, SortDirection, EnrichedLibraryItem } from '@/types/library';
import { isMovie, isTVShow } from '@/types/tmdb';

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
  filters?: MediaFilter;
  sortOption?: SortOption;
  sortDirection?: SortDirection;
}

// Convert TMDB types to EnrichedLibraryItem format for filtering/sorting
function toEnrichedItem(item: TMDBMovie | TMDBTVShow): EnrichedLibraryItem {
  if (isMovie(item)) {
    return {
      listItemId: `collection-movie-${item.id}`,
      id: item.id,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
      media_type: 'movie',
    };
  } else {
    return {
      listItemId: `collection-tv-${item.id}`,
      id: item.id,
      name: item.name,
      poster_path: item.poster_path,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      genre_ids: item.genre_ids,
      media_type: 'tv',
    };
  }
}

const ITEMS_PER_PAGE = 100; // Show more items initially for collections

export default function CollectionsSection({
  collections,
  watchlistIds,
  onWatchlistToggle,
  filters = {},
  sortOption = 'popularity',
  sortDirection = 'desc',
}: CollectionsSectionProps) {
  const loadMoreRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter and sort collection items
  const processedCollections = useMemo(() => {
    return collections.map((collection) => {
      // Convert to enriched format
      const enrichedItems = collection.items.map(toEnrichedItem);

      // Apply filters
      const filteredItems = filterItems(enrichedItems, filters);

      // Apply sorting (exclude 'date-added' for collections)
      const sortedItems = sortItems(
        filteredItems,
        sortOption === 'date-added' ? 'popularity' : sortOption,
        sortDirection
      );

      return {
        ...collection,
        filteredItems: sortedItems,
        originalCount: collection.items.length,
        filteredCount: sortedItems.length,
      };
    });
  }, [collections, filters, sortOption, sortDirection]);

  // Track expanded counts per collection
  const [expandedCounts, setExpandedCounts] = useState<Record<string, number>>({});

  // Get initial visible count for a collection (derived, not state)
  const getInitialCount = useCallback((collectionId: string, filteredCount: number) => {
    // If we already have an expanded count, use it (capped at filtered count)
    // Otherwise, show all items for collections (they're curated lists)
    const existing = expandedCounts[collectionId];
    if (existing !== undefined) {
      return Math.min(existing, filteredCount);
    }
    // Show all items for collections (no pagination needed for curated lists)
    return filteredCount;
  }, [expandedCounts]);

  // Infinite scroll for each collection
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    processedCollections.forEach((collection) => {
      const ref = loadMoreRefs.current[collection.id];
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const firstEntry = entries[0];
          if (
            firstEntry.isIntersecting &&
            expandedCounts[collection.id] < collection.filteredItems.length
          ) {
            setExpandedCounts((prev) => ({
              ...prev,
              [collection.id]: Math.min(
                (prev[collection.id] || ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
                collection.filteredItems.length
              ),
            }));
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [processedCollections, expandedCounts]);

  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No collections available
        </h3>
        <p className="text-muted-foreground">
          Collections will appear here when available.
        </p>
      </div>
    );
  }

  const hasActiveFilters = Object.keys(filters).length > 0 && 
    (filters.genres?.length || filters.yearRange?.min || filters.minRating || filters.regions?.length);

  return (
    <div className="space-y-12">
      {hasActiveFilters && (
        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Showing filtered results from collections. {(() => {
              const count = processedCollections.reduce((sum, c) => sum + c.filteredCount, 0);
              return count > 100 ? '100+' : count;
            })()} items match your filters.
          </p>
        </div>
      )}

      {processedCollections.map((collection) => {
        const initialCount = getInitialCount(collection.id, collection.filteredItems.length);
        const visibleCount = expandedCounts[collection.id] || initialCount;
        // Cap visible count at filtered items length
        const cappedCount = Math.min(visibleCount, collection.filteredItems.length);
        const visibleItems = collection.filteredItems.slice(0, cappedCount);
        const hasMore = cappedCount < collection.filteredItems.length;

        // Find original items from filtered results
        const originalItems = visibleItems
          .map((enrichedItem) => {
            return collection.items.find((item) => item.id === enrichedItem.id);
          })
          .filter((item): item is TMDBMovie | TMDBTVShow => item !== undefined);

        return (
          <div key={collection.id} className="space-y-4">
            {/* Collection Header */}
            <div>
              <h3 className="text-2xl font-semibold text-foreground">
                {collection.name}
              </h3>
              {collection.description && (
                <p className="text-muted-foreground mt-1">
                  {collection.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {collection.filteredCount === collection.originalCount
                  ? `${collection.filteredCount} ${collection.filteredCount === 1 ? 'item' : 'items'}`
                  : `Showing ${collection.filteredCount} of ${collection.originalCount} ${collection.originalCount === 1 ? 'item' : 'items'}`}
              </p>
            </div>

            {/* Collection Items */}
            {visibleItems.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">
                  No items in this collection match your filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {originalItems.map((item) => (
                    <MediaCardWithWatchlist
                      key={`collection-${collection.id}-${item.id}`}
                      item={item}
                      size="medium"
                      initialInWatchlist={watchlistIds.includes(item.id)}
                    />
                  ))}
                </div>

                {/* Load more indicator */}
                {hasMore && (
                  <div
                    ref={(el) => {
                      loadMoreRefs.current[collection.id] = el;
                    }}
                    className="h-10"
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
