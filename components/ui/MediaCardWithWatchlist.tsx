'use client';

import { useState, useTransition } from 'react';
import MediaCard from './MediaCard';
import { toggleWatchlistWithAuth } from '@/server/actions/lists';

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

interface MediaCardWithWatchlistProps {
  item: MediaItem;
  size?: 'small' | 'medium' | 'large';
  showRanking?: boolean;
  rank?: number;
  initialInWatchlist?: boolean;
}

export default function MediaCardWithWatchlist({
  item,
  size = 'medium',
  showRanking = false,
  rank,
  initialInWatchlist = false
}: MediaCardWithWatchlistProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();

  const handleWatchlistToggle = (id: number) => {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    startTransition(async () => {
      try {
        const result = await toggleWatchlistWithAuth(mediaType, id);
        if ('inWatchlist' in result && result.inWatchlist !== null && !('error' in result)) {
          setInWatchlist(result.inWatchlist);
        }
      } catch (error) {
        console.error('Watchlist toggle error:', error);
      }
    });
  };

  return (
    <MediaCard
      item={item}
      size={size}
      showRanking={showRanking}
      rank={rank}
      onWatchlistToggle={handleWatchlistToggle}
      inWatchlist={inWatchlist}
    />
  );
}

