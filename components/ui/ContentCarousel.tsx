'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import MediaCard from './MediaCard';

// Custom icons to replace Heroicons
const ChevronLeftIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

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

interface ContentCarouselProps {
  title: string;
  items: MediaItem[];
  showRanking?: boolean;
  onWatchlistToggle?: (id: number) => void;
  watchlistIds?: number[];
}

export default function ContentCarousel({ 
  title, 
  items, 
  showRanking = false, 
  onWatchlistToggle,
  watchlistIds = []
}: ContentCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver for better scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollPosition = () => {
      const currentScroll = container.scrollLeft;
      setScrollPosition(currentScroll);
      setCanScrollRight(currentScroll < (container.scrollWidth - container.clientWidth - 10));
    };

    container.addEventListener('scroll', updateScrollPosition, { passive: true });
    // Initial check
    updateScrollPosition();
    return () => container.removeEventListener('scroll', updateScrollPosition);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  const canScrollLeft = scrollPosition > 0;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="container mx-auto px-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-section font-semibold text-white">{title}</h2>
          {items.length > 6 && (
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll carousel left"
                className={`p-2 rounded-full transition-colors ${
                  canScrollLeft 
                    ? 'bg-cinema-gray-dark hover:bg-cinema-gray-medium text-white' 
                    : 'bg-cinema-gray-dark text-cinema-gray-light cursor-not-allowed'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll carousel right"
                className={`p-2 rounded-full transition-colors ${
                  canScrollRight 
                    ? 'bg-cinema-gray-dark hover:bg-cinema-gray-medium text-white' 
                    : 'bg-cinema-gray-dark text-cinema-gray-light cursor-not-allowed'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {items.length > 6 && (
          <>
            {/* Left Gradient */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-cinema-black to-transparent z-10 pointer-events-none" />
            )}
            
            {/* Right Gradient */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cinema-black to-transparent z-10 pointer-events-none" />
            )}
          </>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {items.map((item, index) => (
            <div
              key={`${item.media_type || 'movie'}-${item.id}`}
              className="flex-shrink-0"
            >
              <MediaCard
                item={{
                  ...item,
                  media_type: item.media_type || (item.title ? 'movie' : 'tv')
                }}
                size="medium"
                showRanking={showRanking}
                rank={showRanking ? index + 1 : undefined}
                onWatchlistToggle={onWatchlistToggle}
                inWatchlist={watchlistIds.includes(item.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}