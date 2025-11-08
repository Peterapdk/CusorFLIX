/**
 * Library Filter and Sort Types
 * Foundation for future filtering and sorting features
 */

export type MediaFilter = {
  mediaType?: 'movie' | 'tv' | 'all';
  genres?: number[]; // TMDB genre IDs
  tags?: string[]; // Custom tags (future feature)
  yearRange?: { min?: number; max?: number };
  ratingRange?: { min?: number; max?: number };
  languages?: string[]; // ISO 639-1 language codes (multi-select) (e.g., ['en', 'es', 'fr'])
  regions?: string[]; // Region IDs (multi-select) (e.g., ['north-america', 'europe-central-asia'])
  minRating?: number; // Minimum rating for star buttons (4, 6, or 8)
};

export type SortOption = 
  | 'date-added' // When added to list (library only, not supported by TMDB Discover API)
  | 'release-date' // Release date (newest/oldest)
  | 'rating' // TMDB rating (highest/lowest)
  | 'title' // Alphabetical
  | 'popularity'; // TMDB popularity

export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
  option: SortOption;
  direction: SortDirection;
};

// Enriched library item type
export type EnrichedLibraryItem = {
  listItemId: string;
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  media_type: 'movie' | 'tv';
  // Additional fields for sorting/filtering
  addedAt?: Date; // When added to list (from ListItem.createdAt)
};

// Categorized watchlist data
export type CategorizedWatchlist = {
  movies: EnrichedLibraryItem[];
  tvShows: EnrichedLibraryItem[];
  totalCount: number;
};
