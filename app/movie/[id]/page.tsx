import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import type { TMDBMovieDetails, TMDBCastMember, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { generateMetadata } from './metadata';
import { generateStructuredData } from '@/lib/structured-data';
import { getOrCreateDemoUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import WatchlistButton from '@/components/ui/WatchlistButton';
import logger from '@/lib/logger';

export { generateMetadata };

async function checkWatchlistStatus(userId: string | null, tmdbId: number): Promise<boolean> {
  if (!userId) return false;
  try {
    const watchlist = await prisma.list.findFirst({ where: { userId, type: 'watchlist' } });
    if (!watchlist) return false;
    const item = await prisma.listItem.findFirst({ 
      where: { listId: watchlist.id, tmdbId, mediaType: 'movie' } 
    });
    return !!item;
  } catch (error) {
    logger.error('Error checking watchlist status', { 
      context: 'MovieDetailsPage', 
      tmdbId,
      error: error instanceof Error ? error : new Error(String(error))
    });
    return false;
  }
}

export default async function MovieDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const userId = await getOrCreateDemoUser();
  
  const movie = await tmdbEnhanced.getMovieDetails(id, { append_to_response: 'credits,recommendations' }).catch((error) => {
    logger.error('Error fetching movie details', { 
      context: 'MovieDetailsPage', 
      movieId: id,
      error: error instanceof Error ? error : new Error(String(error))
    });
    return null;
  });

  if (!movie) {
    return (
      <main className="min-h-screen bg-background pt-20 px-6">
        <div className="container mx-auto text-center py-16">
          <h1 className="text-3xl font-bold text-foreground mb-4">Movie not found</h1>
          <p className="text-muted-foreground mb-8">The movie you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const movieData: TMDBMovieDetails = movie;
  const year = (movieData.release_date || "").split('-')[0];
  const runtime = movieData.runtime ? `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}m` : '';
  const genres = movieData.genres?.map((g) => g.name).join(', ') || 'Unknown';
  const structuredData = generateStructuredData(movieData);
  const inWatchlist = await checkWatchlistStatus(userId, parseInt(id));

  // Validate and sanitize structured data before rendering
  const sanitizedStructuredData = structuredData;
  const structuredDataJson = JSON.stringify(sanitizedStructuredData);

  return (
    <>
      <Script
        id="movie-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />
      <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${movieData.backdrop_path || movieData.poster_path}`}
            alt={`${movieData.title} backdrop`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <div className="flex items-center space-x-4">
                <span className="text-cinema-orange font-bold text-lg">CINEMAOS</span>
                <span className="text-muted-foreground">Movie</span>
              </div>

              {/* Title */}
              <h1 className="text-hero font-bold text-foreground leading-tight">
                {movieData.title}
              </h1>

              {/* Rating and Info */}
              <div className="flex items-center space-x-6 text-foreground">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-cinema-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold">{movieData.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-xl">{year}</span>
                {runtime && <span className="text-xl">{runtime}</span>}
                <span className="text-xl">{genres}</span>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {movieData.overview}
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Link
                  href={`/watch/movie/${id}`}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Watch Now
                </Link>
                <WatchlistButton 
                  mediaType="movie" 
                  tmdbId={parseInt(id)} 
                  initialInWatchlist={inWatchlist}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 space-y-16">
        {/* Cast and Crew */}
        {movieData.credits?.cast && (
          <section className="container mx-auto px-6">
            <h2 className="text-section font-semibold text-foreground mb-8">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movieData.credits.cast.slice(0, 12).map((person: TMDBCastMember) => (
                <div key={person.id} className="text-center">
                  <div className="w-full aspect-[2/3] bg-card rounded-lg overflow-hidden mb-3">
                    {person.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                        alt={`${person.name} profile`}
                        width={150}
                        height={225}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        sizes="150px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{person.name}</h3>
                  <p className="text-xs text-muted-foreground">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Movies */}
        {movieData.recommendations?.results && movieData.recommendations.results.length > 0 && (
          <section className="container mx-auto px-6">
            <h2 className="text-section font-semibold text-foreground mb-8">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movieData.recommendations.results.slice(0, 12).map((rec: TMDBMovie | TMDBTVShow) => (
                <Link key={rec.id} href={`/movie/${rec.id}`} className="group">
                  <div className="aspect-[2/3] bg-card rounded-lg overflow-hidden mb-3">
                    {rec.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                        alt={'title' in rec ? `${rec.title} poster` : `${rec.name} poster`}
                        width={150}
                        height={225}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        sizes="150px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-foreground group-hover:text-cinema-orange transition-colors">
                    {'title' in rec ? rec.title : rec.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {('release_date' in rec ? rec.release_date : rec.first_air_date)?.split('-')[0]}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
    </>
  );
}


