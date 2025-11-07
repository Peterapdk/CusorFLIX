import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting and performance
const PlayerFrame = dynamic(() => import('@/components/PlayerFrame'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-cinema-black flex items-center justify-center">
      <div className="text-cinema-white-dim">Loading player...</div>
    </div>
  ),
});

const AdBlockerStatus = dynamic(() => import('@/components/AdBlockerStatus'), {
  ssr: false,
});

// Only load debug component in development
const CinemaOSDebug = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import('@/components/CinemaOSDebug'), { ssr: false })
  : () => null;

const CINEMAOS_BASE = 'https://cinemaos.tech';

// Enable ISR caching for 1 hour - player URLs don't change frequently
export const revalidate = 3600;

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

  // Debug: log the constructed URL (development only)
  if (process.env.NODE_ENV === 'development') {
    // Using dynamic import to avoid including logger in production bundle
    import('@/lib/logger').then(({ default: logger }) => {
      logger.debug('CinemaOS URL constructed', { context: 'WatchPage', src });
    });
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


