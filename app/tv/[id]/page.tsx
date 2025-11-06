import { getTVDetails, getTVSeason } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import type { TMDBTVShowDetails, TMDBSeason, TMDBCastMember, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { generateMetadata } from './metadata';
import { generateTVStructuredData } from '@/lib/structured-data';

export { generateMetadata };

export default async function TVDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const tv = await getTVDetails(id, { append_to_response: 'seasons,credits,recommendations' }).catch(() => null);

  if (!tv) {
    return (
      <main className="min-h-screen bg-cinema-black pt-20 px-6">
        <div className="container mx-auto text-center py-16">
          <h1 className="text-3xl font-bold text-white mb-4">TV Show not found</h1>
          <p className="text-cinema-white-dim mb-8">The TV show you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const tvData: TMDBTVShowDetails = tv;
  const seasons: TMDBSeason[] = tvData.seasons || [];
  const numberOfSeasons = tvData.number_of_seasons || 0;
  const numberOfEpisodes = tvData.number_of_episodes || 0;
  const year = (tvData.first_air_date || "").split('-')[0];
  const genres = tvData.genres?.map((g) => g.name).join(', ') || 'Unknown';
  const status = tvData.status || 'Unknown';
  const networks = tvData.networks?.map((n) => n.name).join(', ') || 'Unknown';
  const structuredData = generateTVStructuredData(tvData);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-cinema-black">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${tvData.backdrop_path || tvData.poster_path}`}
            alt={`${tvData.name} backdrop`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              {/* Badge */}
              <div className="flex items-center space-x-4">
                <span className="text-cinema-orange font-bold text-lg">CINEMAOS</span>
                <span className="text-cinema-white-dim">TV Show</span>
              </div>

              {/* Title */}
              <h1 className="text-hero font-bold text-white leading-tight">
                {tvData.name}
              </h1>

              {/* Rating and Info */}
              <div className="flex items-center space-x-6 text-cinema-white flex-wrap gap-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-cinema-yellow" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-2xl font-bold">{tvData.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-xl">{year}</span>
                {numberOfSeasons > 0 && <span className="text-xl">{numberOfSeasons} Season{numberOfSeasons > 1 ? 's' : ''}</span>}
                {numberOfEpisodes > 0 && <span className="text-xl">{numberOfEpisodes} Episodes</span>}
                <span className="text-xl">{status}</span>
                <span className="text-xl">{genres}</span>
              </div>

              {/* Description */}
              <p className="text-lg text-cinema-white-muted leading-relaxed max-w-2xl">
                {tvData.overview || 'No description available.'}
              </p>

              {/* Network Info */}
              {networks !== 'Unknown' && (
                <div className="flex items-center space-x-2 text-cinema-white-dim">
                  <span>Networks:</span>
                  <span className="text-cinema-white">{networks}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Link
                  href={`/watch/tv/${id}?season=1&episode=1`}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Watch Now
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 -mt-32 space-y-16">
        {/* Seasons & Episodes */}
        {numberOfSeasons > 0 && (
          <section className="container mx-auto px-6">
            <h2 className="text-section font-semibold text-white mb-8">Seasons & Episodes</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {await Promise.all(
                seasons
                  .filter((season) => season.season_number >= 0 && season.air_date)
                  .map(async (season) => {
                    // Fetch season details to get episode count
                    const seasonDetails = await getTVSeason(id, season.season_number).catch(() => null);
                    const episodeCount = seasonDetails ? seasonDetails.episodes?.length || season.episode_count : season.episode_count;
                    const seasonYear = season.air_date?.split('-')[0];

                    return (
                      <div
                        key={season.season_number}
                        className="group bg-cinema-gray-dark rounded-lg overflow-hidden hover:bg-cinema-gray-medium transition-colors"
                      >
                        {/* Season Poster */}
                        <div className="aspect-[2/3] bg-cinema-gray-medium">
                          {season.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                              alt={season.name || `Season ${season.season_number} poster`}
                              width={150}
                              height={225}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              sizes="150px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-cinema-white-dim">
                              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Season Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2">
                            {season.name || `Season ${season.season_number}`}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-cinema-white-dim mb-3">
                            <span>
                              {episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'}
                            </span>
                            {seasonYear && <span>{seasonYear}</span>}
                          </div>
                          {episodeCount > 0 && (
                            <Link
                              href={`/tv/${id}/season/${season.season_number}`}
                              className="w-full block text-center bg-cinema-orange hover:bg-cinema-orange-light text-white font-medium py-2 px-3 rounded transition-colors"
                            >
                              View Episodes
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </section>
        )}

        {/* Cast */}
        {tvData.credits?.cast && (
          <section className="container mx-auto px-6">
            <h2 className="text-section font-semibold text-white mb-8">Cast</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {tvData.credits.cast.slice(0, 12).map((person: TMDBCastMember) => (
                <div key={person.id} className="text-center">
                  <div className="w-full aspect-[2/3] bg-cinema-gray-dark rounded-lg overflow-hidden mb-3">
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
                      <div className="w-full h-full flex items-center justify-center text-cinema-white-dim">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white">{person.name}</h3>
                  <p className="text-xs text-cinema-white-dim">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Shows */}
        {tvData.recommendations?.results && tvData.recommendations.results.length > 0 && (
          <section className="container mx-auto px-6">
            <h2 className="text-section font-semibold text-white mb-8">More Like This</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {tvData.recommendations.results.slice(0, 12).map((rec: TMDBMovie | TMDBTVShow) => (
                <Link key={rec.id} href={`/tv/${rec.id}`} className="group">
                  <div className="aspect-[2/3] bg-cinema-gray-dark rounded-lg overflow-hidden mb-3">
                    {rec.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                        alt={'name' in rec ? rec.name : rec.title || 'TV show poster'}
                        width={150}
                        height={225}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cinema-white-dim">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white group-hover:text-cinema-orange transition-colors">
                    {'name' in rec ? rec.name : rec.title}
                  </h3>
                  <p className="text-xs text-cinema-white-dim">
                    {('first_air_date' in rec ? rec.first_air_date : rec.release_date)?.split('-')[0]}
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


