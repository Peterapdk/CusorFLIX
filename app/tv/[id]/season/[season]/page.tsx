import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import Image from 'next/image';
import Link from 'next/link';
import type { TMDBSeasonDetails } from '@/types/tmdb';

export const dynamic = 'force-dynamic';

export default async function TVSeasonPage(props: { params: Promise<{ id: string; season: string }> }) {
  const { id, season } = await props.params;
  const seasonNum = Number(season);

  // Fetch TV show basic info (name/backdrop) and the specific season details (with caching)
  const [tv, seasonDetails] = await Promise.all([
    tmdbEnhanced.getTVDetails(id).catch(() => null),
    tmdbEnhanced.getTVSeason(id, seasonNum).catch(() => null)
  ]);

  if (!tv || !seasonDetails) {
    return (
      <main className="min-h-screen bg-cinema-black pt-20 px-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Season not found</h1>
          <p className="text-cinema-white-dim">The requested season does not exist.</p>
          <Link href={`/tv/${id}`} className="btn-primary mt-6">Back to Show</Link>
        </div>
      </main>
    );
  }

  const seasonData = seasonDetails as TMDBSeasonDetails;

  return (
    <main className="min-h-screen bg-cinema-black pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Season Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Poster */}
          <div className="w-40 md:w-56 lg:w-60 aspect-[2/3] bg-cinema-gray-dark rounded-lg overflow-hidden relative">
            {seasonData.poster_path && (
              <Image
                src={`https://image.tmdb.org/t/p/w500${seasonData.poster_path}`}
                alt={seasonData.name || `Season ${seasonNum} poster`}
                fill
                className="object-cover"
              />
            )}
          </div>
          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold text-white">
              {tv.name} – Season {seasonNum}
            </h1>
            {seasonData.overview && (
              <p className="text-lg text-cinema-white-muted leading-relaxed max-w-2xl">
                {seasonData.overview}
              </p>
            )}
            <p className="text-cinema-white-dim">
              {seasonData.air_date?.split('-')[0]} • {seasonData.episodes.length} episodes
            </p>
            <Link href={`/tv/${id}`} className="btn-secondary inline-block">
              Back to Show
            </Link>
          </div>
        </div>

        {/* Episode List */}
        <section className="space-y-6">
          <h2 className="text-section font-semibold text-white">Episodes</h2>
          <ul className="space-y-4">
            {seasonData.episodes.map((ep) => (
              <li key={ep.id} className="flex gap-4 bg-cinema-gray-dark rounded-lg overflow-hidden">
                {/* Still image */}
                <div className="relative w-40 aspect-video bg-cinema-gray-medium shrink-0">
                  {ep.still_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                      alt={ep.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {/* Episode details */}
                <div className="flex-1 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      {ep.episode_number}. {ep.name}
                    </h3>
                    <Link
                      href={`/watch/tv/${id}?season=${seasonNum}&episode=${ep.episode_number}`}
                      className="btn-primary py-1 px-3 text-sm"
                    >
                      Play
                    </Link>
                  </div>
                  {ep.overview && (
                    <p className="text-cinema-white-dim text-sm line-clamp-3">
                      {ep.overview}
                    </p>
                  )}
                  <p className="text-cinema-white-dim text-xs">
                    Air date: {ep.air_date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
