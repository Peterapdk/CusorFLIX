'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MediaCardWithWatchlist from '@/components/ui/MediaCardWithWatchlist';
import FiltersPanel from './FiltersPanel';
import SortPanel from './SortPanel';
import CollectionsSection from './CollectionsSection';
import type { MediaFilter, SortOption, SortDirection } from '@/types/library';
import type { TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import logger from '@/lib/logger';

interface Collection {
  id: string;
  name: string;
  description?: string;
  items: (TMDBMovie | TMDBTVShow)[];
}

interface DiscoverySectionProps {
  movies: TMDBMovie[]; // Initial data (can be empty or first page)
  tvShows: TMDBTVShow[]; // Initial data (can be empty or first page)
  collections: Collection[];
  watchlistIds: number[];
  onWatchlistToggle?: (id: number) => void;
}

type TabType = 'movies' | 'tv' | 'collections';

interface DiscoverResponse {
  results: (TMDBMovie | TMDBTVShow)[];
  page: number;
  total_pages: number;
  total_results: number;
}

export default function DiscoverySection({
  movies: initialMovies,
  tvShows: initialTVShows,
  collections,
  watchlistIds,
  onWatchlistToggle
}: DiscoverySectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');
  const [filters, setFilters] = useState<MediaFilter>({});
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Data state
  const [movies, setMovies] = useState<TMDBMovie[]>(initialMovies);
  const [tvShows, setTVShows] = useState<TMDBTVShow[]>(initialTVShows);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get current items based on active tab
  const currentItems = activeTab === 'movies' ? movies : tvShows;

  // Fetch items from API
  const fetchItems = useCallback(async (
    page: number,
    append: boolean = false,
    currentFilters?: MediaFilter,
    currentSortOption?: SortOption,
    currentSortDirection?: SortDirection
  ) => {
    const activeFilters = currentFilters ?? filters;
    const activeSortOption = currentSortOption ?? sortOption;
    const activeSortDirection = currentSortDirection ?? sortDirection;
    const type = activeTab === 'movies' ? 'movie' : 'tv';

    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams({
        type,
        page: page.toString(),
        filters: JSON.stringify(activeFilters),
        sortOption: activeSortOption,
        sortDirection: activeSortDirection,
      });

      const response = await fetch(`/api/discover?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: DiscoverResponse = await response.json();

      if (append) {
        // Append new items
        if (type === 'movie') {
          setMovies((prev) => [...prev, ...(data.results as TMDBMovie[])]);
        } else {
          setTVShows((prev) => [...prev, ...(data.results as TMDBTVShow[])]);
        }
      } else {
        // Replace items
        if (type === 'movie') {
          setMovies(data.results as TMDBMovie[]);
        } else {
          setTVShows(data.results as TMDBTVShow[]);
        }
      }

      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
      setTotalResults(data.total_results);
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch items';
      setError(errorMessage);
      logger.error('Error fetching discover items', {
        context: 'DiscoverySection',
        error: err instanceof Error ? err : new Error(String(err)),
        page,
        type,
        filters: activeFilters,
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [activeTab, filters, sortOption, sortDirection]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function
  const debouncedFetchItems = useCallback((
    page: number,
    append: boolean,
    currentFilters: MediaFilter,
    currentSortOption: SortOption,
    currentSortDirection: SortDirection
  ) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchItems(page, append, currentFilters, currentSortOption, currentSortDirection);
    }, 500);
  }, [fetchItems]);

  // Initial fetch when tab changes
  useEffect(() => {
    if (activeTab === 'collections') return;
    
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    // Reset items when tab changes
    if (activeTab === 'movies') {
      setMovies([]);
    } else if (activeTab === 'tv') {
      setTVShows([]);
    }
    fetchItems(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Fetch when filters or sort change (debounced)
  useEffect(() => {
    if (activeTab === 'collections') return;
    
    // Clear any pending debounced calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    
    // Reset items when filters/sort change
    if (activeTab === 'movies') {
      setMovies([]);
    } else if (activeTab === 'tv') {
      setTVShows([]);
    }

    // Debounce the fetch
    debounceTimerRef.current = setTimeout(() => {
      fetchItems(1, false, filters, sortOption, sortDirection);
    }, 500);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, sortOption, sortDirection, activeTab, fetchItems]);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (activeTab === 'collections' || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          const nextPage = currentPage + 1;
          fetchItems(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, currentPage, fetchItems, activeTab]);

  // Handle filter change
  const handleFilterChange = (newFilters: MediaFilter) => {
    setFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (option: SortOption, direction: SortDirection) => {
    setSortOption(option);
    setSortDirection(direction);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setSortOption('popularity');
    setSortDirection('desc');
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Discovery</h2>
          {activeTab !== 'collections' && (
            <p className="text-muted-foreground">
              {isLoading ? 'Loading...' : error ? error : totalResults > 100 ? '100+ items' : `${totalResults} ${totalResults === 1 ? 'item' : 'items'}`}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border">
        <button
          onClick={() => handleTabChange('movies')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'movies'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Movies
          {activeTab === 'movies' && totalResults > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'movies'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {totalResults > 100 ? '100+' : totalResults}
            </span>
          )}
          {activeTab === 'movies' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('tv')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'tv'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          TV Shows
          {activeTab === 'tv' && totalResults > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'tv'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {totalResults > 100 ? '100+' : totalResults}
            </span>
          )}
          {activeTab === 'tv' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange('collections')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'collections'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Collections
          {collections.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'collections'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {collections.length}
            </span>
          )}
          {activeTab === 'collections' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content Layout: Filters (left) | Content (center) | Sort (right) */}
      {activeTab === 'collections' ? (
        <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row lg:gap-6">
          {/* Filters Panel - Left Sidebar */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <FiltersPanel
              filters={filters}
              mediaType="all"
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Collections Content - Center */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <SortPanel
                sortOption={sortOption}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
              <CollectionsSection
                collections={collections}
                watchlistIds={watchlistIds}
                onWatchlistToggle={onWatchlistToggle}
                filters={filters}
                sortOption={sortOption}
                sortDirection={sortDirection}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row lg:gap-6">
          {/* Filters Panel - Left Sidebar */}
          <div className="lg:w-64 lg:flex-shrink-0">
            <FiltersPanel
              filters={filters}
              mediaType={activeTab === 'movies' ? 'movie' : 'tv'}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Content Grid - Center */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <SortPanel
                sortOption={sortOption}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
              />
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="font-medium">Error loading items</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isLoading && currentItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : currentItems.length === 0 ? (
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
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {currentItems.map((item) => (
                    <MediaCardWithWatchlist
                      key={`${activeTab}-${item.id}`}
                      item={item}
                      size="medium"
                      initialInWatchlist={watchlistIds.includes(item.id)}
                    />
                  ))}
                </div>

                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="mt-6 text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading more...</p>
                  </div>
                )}

                {/* Intersection observer target */}
                {hasMore && !isLoadingMore && (
                  <div ref={loadMoreRef} className="h-10" />
                )}
              </>
            )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
