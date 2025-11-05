import PlayerFrame from '@/components/PlayerFrame';

const VIDORA_BASE = process.env.NEXT_PUBLIC_VIDORA_BASE_URL || 'https://vidora.su';
const VIDORA_THEME = process.env.NEXT_PUBLIC_VIDORA_THEME_COLOR || '00ff9d';

export default async function WatchPage(props: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await props.params;
  const safeType = type === 'tv' ? 'tv' : 'movie';

  const src = `${VIDORA_BASE}/${safeType}/${id}?autoplay=true&colour=${VIDORA_THEME}`;

  return (
    <main className="min-h-dvh p-0">
      <div className="h-[100dvh] w-full">
        <PlayerFrame src={src} className="h-full w-full" />
      </div>
    </main>
  );
}


