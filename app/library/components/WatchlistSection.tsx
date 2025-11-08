'use client';

import { useState } from 'react';
import MediaCardWithRemove from '@/components/ui/MediaCardWithRemove';
import type { EnrichedLibraryItem } from '@/types/library';

interface WatchlistSectionProps {
  movies: EnrichedLibraryItem[];
  tvShows: EnrichedLibraryItem[];
  onWatchlistToggle?: (id: number) => void;
}

type TabType = 'movies' | 'tv';

export default function WatchlistSection({
  movies,
  tvShows,
  onWatchlistToggle
}: WatchlistSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('movies');

  const totalCount = movies.length + tvShows.length;

  if (totalCount === 0) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Watchlist</h2>
            <p className="text-muted-foreground">0 items</p>
          </div>
        </div>
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start building your collection by adding movies and TV shows to your watchlist!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Watchlist</h2>
          <p className="text-muted-foreground">{totalCount} {totalCount === 1 ? 'item' : 'items'}</p>
        </div>
        <div className="flex items-center space-x-2 text-cinema-orange">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">Watchlist</span>
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

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'movies' && (
          <>
            {movies.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No movies in your watchlist yet</h3>
                <p className="text-muted-foreground">Start adding movies to your watchlist to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.map((item) => (
                  <MediaCardWithRemove
                    key={`movie-${item.id}-${item.listItemId}`}
                    item={item}
                    listItemId={item.listItemId}
                    size="medium"
                    inWatchlist={true}
                    onWatchlistToggle={onWatchlistToggle}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'tv' && (
          <>
            {tvShows.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No TV shows in your watchlist yet</h3>
                <p className="text-muted-foreground">Start adding TV shows to your watchlist to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {tvShows.map((item) => (
                  <MediaCardWithRemove
                    key={`tv-${item.id}-${item.listItemId}`}
                    item={item}
                    listItemId={item.listItemId}
                    size="medium"
                    inWatchlist={true}
                    onWatchlistToggle={onWatchlistToggle}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
