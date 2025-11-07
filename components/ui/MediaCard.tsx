'use client';

import Link from 'next/link';
import Image from 'next/image';
import { memo } from 'react';

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

interface MediaCardProps {
  item: MediaItem;
  size?: 'small' | 'medium' | 'large';
  showRanking?: boolean;
  rank?: number;
  onWatchlistToggle?: (id: number) => void;
  inWatchlist?: boolean;
}

export default memo(function MediaCard({ 
  item, 
  size = 'medium', 
  showRanking = false, 
  rank,
  onWatchlistToggle,
  inWatchlist = false
}: MediaCardProps) {
  const title = item.title || item.name || "Unknown Title";
  const year = (item.release_date || item.first_air_date || "").split('-')[0];
  const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
  
  const sizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-40 h-60',
    large: 'w-48 h-72'
  };

  const imageSize = size === 'small' ? 'w300' : size === 'medium' ? 'w400' : 'w500';

  return (
    <div className="group relative card-hover">
      {/* Ranking Number */}
      {showRanking && rank && (
        <div className="absolute -top-2 -left-2 z-20 w-8 h-8 bg-cinema-orange text-white font-bold text-sm rounded-full flex items-center justify-center">
          {rank}
        </div>
      )}

      {/* Main Card */}
      <Link href={`/${mediaType}/${item.id}`} className="block" prefetch={true}>
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg bg-cinema-gray-dark`}>
          {/* Poster Image */}
          {item.poster_path ? (
            <Image
              src={`https://image.tmdb.org/t/p/${imageSize}${item.poster_path}`}
              alt={`${title} poster`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
              loading="lazy"
              quality={80}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-cinema-white-dim">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-cinema-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {typeof item.vote_average === 'number' && !Number.isNaN(item.vote_average) ? (
                    <span className="text-sm font-medium text-white">
                      {item.vote_average.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-cinema-white-dim">{year}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onWatchlistToggle) onWatchlistToggle(item.id);
                  }}
                  className="flex-1 bg-cinema-orange hover:bg-cinema-orange-light text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                >
                  {inWatchlist ? 'Remove' : 'Watchlist'}
                </button>
                <Link
                  href={`/watch/${mediaType}/${item.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-cinema-gray-light hover:bg-cinema-gray-medium text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                >
                  Play
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Title and Info */}
      <div className="mt-3 space-y-1">
        <h3 className="text-card-title font-medium text-white line-clamp-2 group-hover:text-cinema-orange transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-cinema-white-dim">{year}</span>
          <span className="text-cinema-white-dim capitalize">{mediaType}</span>
        </div>
      </div>
    </div>
  );
});