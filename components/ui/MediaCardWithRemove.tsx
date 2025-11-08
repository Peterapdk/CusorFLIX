'use client';

import { useState, useTransition } from 'react';
import MediaCard from './MediaCard';
import { removeFromList } from '@/server/actions/lists';
import { useRouter } from 'next/navigation';
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

interface MediaCardWithRemoveProps {
  item: MediaItem;
  listItemId: string;
  size?: 'small' | 'medium' | 'large';
  showRanking?: boolean;
  rank?: number;
  inWatchlist?: boolean;
  onWatchlistToggle?: (id: number) => void;
}

export default function MediaCardWithRemove({
  item,
  listItemId,
  size = 'medium',
  showRanking = false,
  rank,
  inWatchlist = false,
  onWatchlistToggle
}: MediaCardWithRemoveProps) {
  const [isRemoving, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeFromList(listItemId);
        router.refresh();
      } catch (error) {
        logger.error('Error removing item from list', { 
          context: 'MediaCardWithRemove', 
          error: error instanceof Error ? error : new Error(String(error)) 
        });
      }
    });
  };

  return (
    <div className="group relative">
      <MediaCard
        item={item}
        size={size}
        showRanking={showRanking}
        rank={rank}
        onWatchlistToggle={onWatchlistToggle}
        inWatchlist={inWatchlist}
      />
      {/* Remove Button - appears on hover */}
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute top-2 right-2 z-30 p-2 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 disabled:opacity-50"
        title="Remove from list"
        aria-label="Remove from list"
      >
        {isRemoving ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}

