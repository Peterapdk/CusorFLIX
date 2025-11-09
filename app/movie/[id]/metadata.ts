import type { Metadata } from 'next';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await tmdbEnhanced.getMovieDetails(id).catch(() => null);

  if (!movie) {
    return {
      title: 'Movie Not Found | CinemaRebel',
      description: 'The movie you are looking for could not be found.',
    };
  }

  const movieData = movie;
  const title = movieData.title || 'Movie';
  const description = movieData.overview || `Watch ${title} on CinemaRebel`;
  const year = movieData.release_date?.split('-')[0] || '';
  const imageUrl = movieData.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}`
    : movieData.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
    : undefined;

  return {
    title: `${title}${year ? ` (${year})` : ''} | CinemaRebel`,
    description,
    openGraph: {
      title: `${title}${year ? ` (${year})` : ''}`,
      description,
      type: 'video.movie',
      images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
      siteName: 'CinemaRebel',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}${year ? ` (${year})` : ''}`,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

