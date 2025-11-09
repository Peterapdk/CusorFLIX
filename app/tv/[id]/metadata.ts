import type { Metadata } from 'next';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const tv = await tmdbEnhanced.getTVDetails(id).catch(() => null);

  if (!tv) {
    return {
      title: 'TV Show Not Found | CinemaRebel',
      description: 'The TV show you are looking for could not be found.',
    };
  }

  const tvData = tv;
  const title = tvData.name || 'TV Show';
  const description = tvData.overview || `Watch ${title} on CinemaRebel`;
  const year = tvData.first_air_date?.split('-')[0] || '';
  const imageUrl = tvData.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${tvData.backdrop_path}`
    : tvData.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvData.poster_path}`
    : undefined;

  return {
    title: `${title}${year ? ` (${year})` : ''} | CinemaRebel`,
    description,
    openGraph: {
      title: `${title}${year ? ` (${year})` : ''}`,
      description,
      type: 'video.tv_show',
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

