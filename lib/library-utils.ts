/**
 * Library Utility Functions
 * Filtering and sorting utilities for library items
 */

import type { EnrichedLibraryItem, MediaFilter, SortOption, SortDirection } from '@/types/library';

/**
 * Filter items by criteria
 */
export function filterItems<T extends EnrichedLibraryItem>(
  items: T[],
  filter: MediaFilter
): T[] {
  let filtered = [...items];

  // Filter by media type
  if (filter.mediaType && filter.mediaType !== 'all') {
    filtered = filtered.filter(item => item.media_type === filter.mediaType);
  }

  // Filter by genres
  if (filter.genres && filter.genres.length > 0) {
    filtered = filtered.filter(item => {
      if (!item.genre_ids || item.genre_ids.length === 0) return false;
      return filter.genres!.some(genreId => item.genre_ids!.includes(genreId));
    });
  }

  // Filter by year (single year filter)
  if (filter.yearRange?.min !== undefined) {
    filtered = filtered.filter(item => {
      const dateStr = item.release_date || item.first_air_date;
      if (!dateStr) return false;
      const year = parseInt(dateStr.split('-')[0], 10);
      if (isNaN(year)) return false;
      
      // Filter for items released in the specified year
      return year === filter.yearRange!.min;
    });
  }

  // Filter by minimum rating
  if (filter.minRating !== undefined) {
    filtered = filtered.filter(item => {
      const rating = item.vote_average || 0;
      return rating >= filter.minRating!;
    });
  }

  // Filter by rating range (if both min and max are provided)
  if (filter.ratingRange) {
    filtered = filtered.filter(item => {
      const rating = item.vote_average || 0;
      if (filter.ratingRange!.min !== undefined && rating < filter.ratingRange!.min) {
        return false;
      }
      if (filter.ratingRange!.max !== undefined && rating > filter.ratingRange!.max) {
        return false;
      }
      return true;
    });
  }

  // Filter by tags (future feature)
  if (filter.tags && filter.tags.length > 0) {
    // TODO: Implement tag filtering when tag feature is added
    // For now, return all items
  }

  return filtered;
}

/**
 * Sort items by option and direction
 */
export function sortItems<T extends EnrichedLibraryItem>(
  items: T[],
  sortOption: SortOption,
  direction: SortDirection = 'desc'
): T[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortOption) {
      case 'date-added':
        // Sort by when added to list (use createdAt if available)
        const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        comparison = dateB - dateA; // Newest first by default
        break;

      case 'release-date':
        // Sort by release date
        const releaseA = a.release_date || a.first_air_date || '';
        const releaseB = b.release_date || b.first_air_date || '';
        comparison = releaseB.localeCompare(releaseA); // Newest first by default
        break;

      case 'rating':
        // Sort by rating
        const ratingA = a.vote_average || 0;
        const ratingB = b.vote_average || 0;
        comparison = ratingB - ratingA; // Highest first by default
        break;

      case 'title':
        // Sort alphabetically by title
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        comparison = titleA.localeCompare(titleB);
        break;

      case 'popularity':
        // Sort by popularity (if available in future)
        // For now, use rating as proxy
        const popA = a.vote_average || 0;
        const popB = b.vote_average || 0;
        comparison = popB - popA;
        break;

      default:
        comparison = 0;
    }

    // Apply direction
    return direction === 'asc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Get year from date string
 */
export function getYearFromDate(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.split('-')[0], 10);
  return isNaN(year) ? null : year;
}

/**
 * Check if item matches filter
 */
export function itemMatchesFilter(item: EnrichedLibraryItem, filter: MediaFilter): boolean {
  const filtered = filterItems([item], filter);
  return filtered.length > 0;
}
