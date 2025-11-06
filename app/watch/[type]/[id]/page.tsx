import PlayerFrame from '@/components/PlayerFrame';
import AdBlockerStatus from '@/components/AdBlockerStatus';
import CinemaOSDebug from '@/components/CinemaOSDebug';

const CINEMAOS_BASE = 'https://cinemaos.tech';

export default async function WatchPage(props: { 
  params: Promise<{ type: string; id: string; season?: string; episode?: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}) {
  const { type, id } = await props.params;
  const searchParams = await props.searchParams;
  const safeType = type === 'tv' ? 'tv' : 'movie';

  // Ensure ID is numeric (TMDB IDs are numeric)
  const numericId = id.replace(/[^0-9]/g, '');
  if (!numericId) {
    return (
      <main className="min-h-dvh p-6">
        <h1 className="text-xl font-semibold">Invalid ID format</h1>
        <p className="text-white/70 mt-2">The provided ID is not valid.</p>
      </main>
    );
  }

  // For TV shows, we need season and episode numbers
  let src: string;
  if (safeType === 'tv') {
    const season = searchParams.season || '1';
    const episode = searchParams.episode || '1';
    // Ensure season and episode are numeric
    const numericSeason = season.replace(/[^0-9]/g, '') || '1';
    const numericEpisode = episode.replace(/[^0-9]/g, '') || '1';
    src = `${CINEMAOS_BASE}/player/${numericId}/${numericSeason}/${numericEpisode}`;
  } else {
    // For movies, just use the ID
    src = `${CINEMAOS_BASE}/player/${numericId}`;
  }

  // Debug: log the constructed URL (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('CinemaOS URL:', src);
  }

  return (
    <main className="min-h-dvh p-0">
      <div className="h-[100dvh] w-full">
        <PlayerFrame src={src} className="h-full w-full" />
        <AdBlockerStatus />
        <CinemaOSDebug url={src} />
      </div>
    </main>
  );
}


