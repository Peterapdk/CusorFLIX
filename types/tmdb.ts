/**
 * TMDB API Type Definitions
 * Based on The Movie Database (TMDB) API v3 documentation
 */

export type MediaType = 'movie' | 'tv' | 'person';

export interface TMDBMovie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie';
}

export interface TMDBTVShow {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  origin_country: string[];
  vote_average: number;
  vote_count: number;
  media_type?: 'tv';
}

export interface TMDBPerson {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  known_for: (TMDBMovie | TMDBTVShow)[];
  media_type?: 'person';
}

export type TMDBMediaItem = TMDBMovie | TMDBTVShow | TMDBPerson;

export interface TMDBSearchResult {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTrendingResponse {
  page: number;
  results: TMDBMediaItem[];
  total_pages: number;
  total_results: number;
}

// Genre types
export interface TMDBGenre {
  id: number;
  name: string;
}

// Production Company
export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

// Production Country
export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

// Spoken Language
export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Movie Details (extended)
export interface TMDBMovieDetails extends TMDBMovie {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
  credits?: TMDBCredits;
  recommendations?: TMDBRecommendations;
}

// TV Show Details (extended)
export interface TMDBTVShowDetails extends TMDBTVShow {
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  genres: TMDBGenre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  next_episode_to_air: {
    air_date: string;
    episode_number: number;
    id: number;
    name: string;
    overview: string;
    production_code: string;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
  } | null;
  networks: TMDBProductionCompany[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  seasons: TMDBSeason[];
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;
  credits?: TMDBCredits;
  recommendations?: TMDBRecommendations;
}

// Season
export interface TMDBSeason {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

// Season Details
export interface TMDBSeasonDetails extends TMDBSeason {
  episodes: TMDBEpisode[];
}

// Episode
export interface TMDBEpisode {
  air_date: string | null;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Array<{
    department: string;
    job: string;
    credit_id: string;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
  }>;
  guest_stars: Array<{
    character: string;
    credit_id: string;
    order: number;
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path: string | null;
  }>;
}

// Cast Member
export interface TMDBCastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

// Crew Member
export interface TMDBCrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

// Credits
export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

// Recommendations
export interface TMDBRecommendations {
  page: number;
  results: (TMDBMovie | TMDBTVShow)[];
  total_pages: number;
  total_results: number;
}

// Type guards
export function isMovie(item: TMDBMediaItem): item is TMDBMovie {
  // Check for explicit media_type first, then fall back to property-based detection
  if (item.media_type === 'movie') return true;
  // Movies have 'title' property and don't have 'name' property (TV shows have 'name')
  return 'title' in item && !('name' in item);
}

export function isTVShow(item: TMDBMediaItem): item is TMDBTVShow {
  // Check for explicit media_type first, then fall back to property-based detection
  if (item.media_type === 'tv') return true;
  // TV shows have 'name' property and don't have 'title' property (movies have 'title')
  return 'name' in item && !('title' in item);
}

export function isPerson(item: TMDBMediaItem): item is TMDBPerson {
  // Check for explicit media_type first, then fall back to property-based detection
  if (item.media_type === 'person') return true;
  // Persons have 'known_for' property (unique to person type)
  return 'known_for' in item;
}

