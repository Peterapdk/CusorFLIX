'use client';

import { useState, useMemo } from 'react';
import MediaCardWithWatchlist from '@/components/ui/MediaCardWithWatchlist';
import FilterSortBar from '@/app/library/components/FilterSortBar';
import { filterItems, sortItems } from '@/lib/library-utils';
import type { MediaFilter, SortOption, SortDirection, EnrichedLibraryItem } from '@/types/library';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { isMovie, isTVShow } from '@/types/tmdb';

interface DiscoverySectionProps {
  movies: TMDBMovie[];
  tvShows: TMDBTVShow[];
  watchlistIds: number[];
  onWatchlistToggle?: (id: number) => void;
}

type TabType = 'movies' | 'tv';

// Convert TMDB types to EnrichedLibraryItem format for filtering/sorting
function toEnrichedItem(item: TMDBMovie | TMDBTVShow): {
  listItemId: string;
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  media_type: 'movie' | 'tv';
} {
  if (isMovie(item)) {
    return {
      listItemId: `discovery-movie-${item.id}`, // Dummy ID for discovery items
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
      listItemId: `discovery-tv-${item.id}`, // Dummy ID for discovery items
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

export default function DiscoverySection({
  movies,
  tvShows,
  watchlistIds,
  onWatchlistToggle
}: DiscoverySectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [filters, setFilters] = useState<MediaFilter>({});
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Convert to enriched format for filtering/sorting
  const enrichedMovies = useMemo(() => movies.map(toEnrichedItem) as EnrichedLibraryItem[], [movies]);
  const enrichedTVShows = useMemo(() => tvShows.map(toEnrichedItem) as EnrichedLibraryItem[], [tvShows]);

  // Filter and sort based on active tab
  const filteredAndSortedItems = useMemo(() => {
    const items = activeTab === 'movies' ? enrichedMovies : enrichedTVShows;
    const mediaTypeFilter: MediaFilter = {
      ...filters,
      mediaType: activeTab === 'movies' ? 'movie' : 'tv',
    };
    const filtered = filterItems(items, mediaTypeFilter);
    return sortItems(filtered, sortOption, sortDirection);
  }, [activeTab, enrichedMovies, enrichedTVShows, filters, sortOption, sortDirection]);

  const handleFilterChange = (newFilters: MediaFilter) => {
    setFilters(newFilters);
  };

  const handleSortChange = (option: SortOption, direction: SortDirection) => {
    setSortOption(option);
    setSortDirection(direction);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSortOption('popularity');
    setSortDirection('desc');
  };

  const totalCount = movies.length + tvShows.length;
  const displayCount = filteredAndSortedItems.length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Discovery</h2>
          <p className="text-muted-foreground">
            {displayCount} {displayCount === 1 ? 'item' : 'items'} 
            {displayCount !== totalCount && ` of ${totalCount}`}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'movies'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Movies
          {movies.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'movies'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {movies.length}
            </span>
          )}
          {activeTab === 'movies' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'tv'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          TV Shows
          {tvShows.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'tv'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {tvShows.length}
            </span>
          )}
          {activeTab === 'tv' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Filter/Sort Bar */}
      <FilterSortBar
        filters={filters}
        sortOption={sortOption}
        sortDirection={sortDirection}
        mediaType={activeTab === 'movies' ? 'movie' : 'tv'}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
      />

      {/* Content */}
      <div className="mt-6">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredAndSortedItems.map((item) => {
              const tmdbItem = activeTab === 'movies' 
                ? movies.find(m => m.id === item.id) 
                : tvShows.find(t => t.id === item.id);
              
              if (!tmdbItem) return null;

              return (
                <MediaCardWithWatchlist
                  key={`${activeTab}-${item.id}`}
                  item={tmdbItem}
                  size="medium"
                  initialInWatchlist={watchlistIds.includes(item.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

