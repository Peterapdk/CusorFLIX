import { getMovieDetails } from '@/lib/tmdb';

export default async function MovieDetailsPage({ params }: { params: { id: string } }) {
  const movie = await getMovieDetails(params.id).catch(() => null);

  if (!movie) {
    return (
      <main className="min-h-dvh p-6">
        <h1 className="text-xl font-semibold">Movie not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-dvh p-6 space-y-3">
      <h1 className="text-2xl font-semibold">{(movie as any).title}</h1>
      <p className="text-white/70">{(movie as any).overview}</p>
      <div className="pt-2">
        <a
          href={`/watch/movie/${params.id}`}
          className="inline-block rounded bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15"
        >
          Play with Vidora
        </a>
      </div>
    </main>
  );
}


