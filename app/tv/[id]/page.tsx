import { getTVDetails } from '@/lib/tmdb';

export default async function TVDetailsPage({ params }: { params: { id: string } }) {
  const tv = await getTVDetails(params.id).catch(() => null);

  if (!tv) {
    return (
      <main className="min-h-dvh p-6">
        <h1 className="text-xl font-semibold">TV Show not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-dvh p-6 space-y-3">
      <h1 className="text-2xl font-semibold">{(tv as any).name}</h1>
      <p className="text-white/70">{(tv as any).overview}</p>
      <div className="pt-2">
        <a
          href={`/watch/tv/${params.id}`}
          className="inline-block rounded bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15"
        >
          Play with Vidora
        </a>
      </div>
    </main>
  );
}


