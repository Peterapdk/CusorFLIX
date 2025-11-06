import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';

export function generateStructuredData(movie: TMDBMovieDetails) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: movie.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : undefined,
    datePublished: movie.release_date,
    aggregateRating: movie.vote_average > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average,
      bestRating: 10,
      worstRating: 0,
      ratingCount: movie.vote_count,
    } : undefined,
    genre: movie.genres?.map(g => g.name).join(', '),
    duration: movie.runtime ? `PT${movie.runtime}M` : undefined,
  };
}

export function generateTVStructuredData(tv: TMDBTVShowDetails) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: tv.name,
    description: tv.overview,
    image: tv.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${tv.backdrop_path}`
      : tv.poster_path
      ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
      : undefined,
    datePublished: tv.first_air_date,
    aggregateRating: tv.vote_average > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: tv.vote_average,
      bestRating: 10,
      worstRating: 0,
      ratingCount: tv.vote_count,
    } : undefined,
    genre: tv.genres?.map(g => g.name).join(', '),
    numberOfSeasons: tv.number_of_seasons,
    numberOfEpisodes: tv.number_of_episodes,
  };
}

