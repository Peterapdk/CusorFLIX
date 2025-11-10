'use client';

import { useState } from 'react';
import ContentCarouselWithWatchlist from './ContentCarouselWithWatchlist';

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  media_type?: 'movie' | 'tv';
};

interface Top10TrendingSectionProps {
  title: string; // "Movies" or "TV Shows"
  top10Items: MediaItem[];
  trendingItems: MediaItem[];
  watchlistIds?: number[];
}

type ViewMode = 'Top10' | 'Trending';

export default function Top10TrendingSection({
  title,
  top10Items,
  trendingItems,
  watchlistIds = []
}: Top10TrendingSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('Top10');

  const currentItems = viewMode === 'Top10' ? top10Items : trendingItems;
  const currentTitle = viewMode === 'Top10' ? `Top 10 ${title}` : `Trending ${title}`;

  return (
    <section className="py-8">
      {/* Section Header with Selector */}
      <div className="container mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-section font-semibold text-foreground">{title}</h2>
          
          {/* Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('Top10')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'Top10'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Show Top 10"
              >
                Top 10
                {viewMode === 'Top10' && (
                  <span className="ml-2 inline-block">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('Trending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'Trending'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Show Trending"
              >
                Trending
                {viewMode === 'Trending' && (
                  <span className="ml-2 inline-block">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Carousel */}
      {currentItems.length > 0 && (
        <ContentCarouselWithWatchlist
          title={currentTitle}
          items={currentItems}
          showRanking={viewMode === 'Top10'}
          watchlistIds={watchlistIds}
          hideTitle={true}
          noSectionWrapper={true}
        />
      )}
    </section>
  );
}

