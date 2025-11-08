'use client';

import { useState, useTransition } from 'react';
import { toggleWatchlistWithAuth } from '@/server/actions/lists';
import logger from '@/lib/logger';

interface WatchlistButtonProps {
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  initialInWatchlist?: boolean;
}

export default function WatchlistButton({ 
  mediaType, 
  tmdbId, 
  initialInWatchlist = false 
}: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await toggleWatchlistWithAuth(mediaType, tmdbId);
        if ('error' in result && result.error) {
          setError(result.error);
        } else if ('inWatchlist' in result && result.inWatchlist !== null) {
          setInWatchlist(result.inWatchlist);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update watchlist');
        logger.error('Watchlist toggle error', { 
          context: 'WatchlistButton', 
          error: err instanceof Error ? err : new Error(String(err)) 
        });
      }
    });
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="btn-secondary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Loading...' : inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

