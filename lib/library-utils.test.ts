import { describe, it, expect } from 'vitest';
import { filterItems, sortItems } from './library-utils';
import type { EnrichedLibraryItem, MediaFilter, SortOption } from '@/types/library';

// Mock data for testing
const mockMovies: EnrichedLibraryItem[] = [
  {
    id: 1,
    tmdb_id: 1,
    media_type: 'movie',
    title: 'The Matrix',
    release_date: '1999-03-31',
    vote_average: 8.7,
    popularity: 100,
    genre_ids: [28, 878], // Action, Sci-Fi
    poster_path: '/path/to/poster1.jpg',
    backdrop_path: '/path/to/backdrop1.jpg',
    overview: 'A computer hacker learns about the true nature of reality.',
    addedAt: new Date('2024-01-01'),
    listItemId: 'list-item-1',
  },
  {
    id: 2,
    tmdb_id: 2,
    media_type: 'movie',
    title: 'Inception',
    release_date: '2010-07-16',
    vote_average: 8.8,
    popularity: 150,
    genre_ids: [28, 878, 53], // Action, Sci-Fi, Thriller
    poster_path: '/path/to/poster2.jpg',
    backdrop_path: '/path/to/backdrop2.jpg',
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    addedAt: new Date('2024-01-02'),
    listItemId: 'list-item-2',
  },
  {
    id: 3,
    tmdb_id: 3,
    media_type: 'tv',
    title: 'Breaking Bad',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    popularity: 200,
    genre_ids: [18, 80], // Drama, Crime
    poster_path: '/path/to/poster3.jpg',
    backdrop_path: '/path/to/backdrop3.jpg',
    overview: 'A high school chemistry teacher turned methamphetamine manufacturer.',
    addedAt: new Date('2024-01-03'),
    listItemId: 'list-item-3',
  },
];

describe('filterItems', () => {
  it('should filter by media type', () => {
    const filter: MediaFilter = { mediaType: 'movie' };
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(2);
    expect(result.every(item => item.media_type === 'movie')).toBe(true);
  });

  it('should filter by genres', () => {
    const filter: MediaFilter = { genres: [28] }; // Action
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(2); // The Matrix and Inception
    expect(result.every(item => item.genre_ids?.includes(28))).toBe(true);
  });

  it('should filter by year range (min)', () => {
    const filter: MediaFilter = { yearRange: { min: 2010 } };
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Inception');
  });

  it('should filter by minimum rating', () => {
    const filter: MediaFilter = { minRating: 8.8 };
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(2); // Inception (8.8) and Breaking Bad (9.5)
    expect(result.every(item => (item.vote_average || 0) >= 8.8)).toBe(true);
  });

  it('should return all items when no filters are applied', () => {
    const filter: MediaFilter = {};
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(3);
  });

  it('should handle items without release dates', () => {
    const itemsWithMissingDate: EnrichedLibraryItem[] = [
      ...mockMovies,
      {
        id: 4,
        tmdb_id: 4,
        media_type: 'movie',
        title: 'No Date Movie',
        vote_average: 7.0,
        popularity: 50,
        genre_ids: [28],
        poster_path: '/path/to/poster4.jpg',
        backdrop_path: '/path/to/backdrop4.jpg',
        overview: 'A movie without a release date',
        addedAt: new Date('2024-01-04'),
        listItemId: 'list-item-4',
      },
    ];
    
    const filter: MediaFilter = { yearRange: { min: 2010 } };
    const result = filterItems(itemsWithMissingDate, filter);
    
    // Should only return items with valid dates
    expect(result.every(item => item.release_date || item.first_air_date)).toBe(true);
  });

  it('should combine multiple filters', () => {
    const filter: MediaFilter = {
      mediaType: 'movie',
      genres: [878], // Sci-Fi
      minRating: 8.7,
    };
    const result = filterItems(mockMovies, filter);
    
    expect(result).toHaveLength(2); // The Matrix and Inception
    expect(result.every(item => 
      item.media_type === 'movie' &&
      item.genre_ids?.includes(878) &&
      (item.vote_average || 0) >= 8.7
    )).toBe(true);
  });
});

describe('sortItems', () => {
  it('should sort by title ascending', () => {
    const result = sortItems(mockMovies, 'title', 'asc');
    
    // Ascending: Breaking Bad, Inception, The Matrix (alphabetical order)
    expect(result[0].title).toBe('Breaking Bad');
    expect(result[1].title).toBe('Inception');
    expect(result[2].title).toBe('The Matrix');
  });

  it('should sort by title descending', () => {
    const result = sortItems(mockMovies, 'title', 'desc');
    
    // Descending: The Matrix, Inception, Breaking Bad (reverse alphabetical)
    expect(result[0].title).toBe('The Matrix');
    expect(result[1].title).toBe('Inception');
    expect(result[2].title).toBe('Breaking Bad');
  });

  it('should sort by rating descending', () => {
    const result = sortItems(mockMovies, 'rating', 'desc');
    
    expect(result[0].title).toBe('Breaking Bad'); // 9.5
    expect(result[1].title).toBe('Inception'); // 8.8
    expect(result[2].title).toBe('The Matrix'); // 8.7
  });

  it('should sort by release date descending', () => {
    const result = sortItems(mockMovies, 'release-date', 'desc');
    
    // Descending by date (newest first): Inception (2010), Breaking Bad (2008), The Matrix (1999)
    expect(result[0].title).toBe('Inception'); // 2010-07-16 (newest)
    expect(result[1].title).toBe('Breaking Bad'); // 2008-01-20 (middle)
    expect(result[2].title).toBe('The Matrix'); // 1999-03-31 (oldest)
  });

  it('should sort by date-added descending (newest first)', () => {
    const result = sortItems(mockMovies, 'date-added', 'desc');
    
    expect(result[0].title).toBe('Breaking Bad'); // 2024-01-03
    expect(result[1].title).toBe('Inception'); // 2024-01-02
    expect(result[2].title).toBe('The Matrix'); // 2024-01-01
  });

  it('should sort by popularity descending', () => {
    const result = sortItems(mockMovies, 'popularity', 'desc');
    
    expect(result[0].title).toBe('Breaking Bad'); // 200
    expect(result[1].title).toBe('Inception'); // 150
    expect(result[2].title).toBe('The Matrix'); // 100
  });

  it('should handle items with missing sort values', () => {
    const itemsWithMissingValues: EnrichedLibraryItem[] = [
      ...mockMovies,
      {
        id: 4,
        tmdb_id: 4,
        media_type: 'movie',
        title: 'No Rating Movie',
        release_date: '2020-01-01',
        popularity: 50,
        genre_ids: [28],
        poster_path: '/path/to/poster4.jpg',
        backdrop_path: '/path/to/backdrop4.jpg',
        overview: 'A movie without a rating',
        addedAt: new Date('2024-01-04'),
        listItemId: 'list-item-5',
      },
    ];
    
    const result = sortItems(itemsWithMissingValues, 'rating', 'desc');
    
    // Items without ratings should be sorted last
    const lastItem = result[result.length - 1];
    expect(lastItem.title).toBe('No Rating Movie');
  });
});

