/**
 * TMDB Genre Constants
 * Common genres for movies and TV shows
 * Genre IDs from TMDB API
 */

export interface TMDBGenre {
  id: number;
  name: string;
}

// Movie genres
export const MOVIE_GENRES: TMDBGenre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

// TV show genres
export const TV_GENRES: TMDBGenre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

// Get all genres (for filtering when media type is 'all')
export const ALL_GENRES: TMDBGenre[] = [
  ...MOVIE_GENRES,
  ...TV_GENRES.filter(tvGenre => !MOVIE_GENRES.some(movieGenre => movieGenre.id === tvGenre.id)),
];

// Get genres by media type
export function getGenresByMediaType(mediaType: 'movie' | 'tv' | 'all'): TMDBGenre[] {
  if (mediaType === 'movie') return MOVIE_GENRES;
  if (mediaType === 'tv') return TV_GENRES;
  return ALL_GENRES;
}

// Get genre name by ID
export function getGenreNameById(genreId: number): string | undefined {
  const genre = ALL_GENRES.find(g => g.id === genreId);
  return genre?.name;
}

// Get current year for year range filtering
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Get year range options for filtering
export function getYearRangeOptions(): number[] {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }
  return years;
}
