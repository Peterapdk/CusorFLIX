'use client';

import { useState, useTransition } from 'react';
import ContentCarousel from './ContentCarousel';
import { toggleWatchlistWithAuth } from '@/server/actions/lists';
import logger from '@/lib/logger';

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

interface ContentCarouselWithWatchlistProps {
  title: string;
  items: MediaItem[];
  showRanking?: boolean;
  watchlistIds?: number[];
  hideTitle?: boolean;
  noSectionWrapper?: boolean;
}

export default function ContentCarouselWithWatchlist({
  title,
  items,
  showRanking = false,
  watchlistIds = [],
  hideTitle = false,
  noSectionWrapper = false
}: ContentCarouselWithWatchlistProps) {
  const [watchlistState, setWatchlistState] = useState<Set<number>>(new Set(watchlistIds));
  const [isPending, startTransition] = useTransition();

  const handleWatchlistToggle = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    startTransition(async () => {
      try {
        const result = await toggleWatchlistWithAuth(mediaType, id);
        if ('inWatchlist' in result && result.inWatchlist !== null && !('error' in result)) {
          setWatchlistState(prev => {
            const next = new Set(prev);
            if (result.inWatchlist) {
              next.add(id);
            } else {
              next.delete(id);
            }
            return next;
          });
        }
      } catch (error) {
        logger.error('Watchlist toggle error', { 
          context: 'ContentCarouselWithWatchlist', 
          error: error instanceof Error ? error : new Error(String(error)) 
        });
      }
    });
  };

  return (
    <ContentCarousel
      title={title}
      items={items}
      showRanking={showRanking}
      onWatchlistToggle={handleWatchlistToggle}
      watchlistIds={Array.from(watchlistState)}
      hideTitle={hideTitle}
      noSectionWrapper={noSectionWrapper}
    />
  );
}

