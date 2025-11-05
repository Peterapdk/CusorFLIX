import { getTrending } from '@/lib/tmdb';

export default async function HomePage() {
  const [movies, tv] = await Promise.all([
    getTrending('movie').catch(() => ({ results: [] })),
    getTrending('tv').catch(() => ({ results: [] })),
  ]);

  return (
    <main className="min-h-dvh p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">CinemaRebel</h1>
        <p className="mt-2 text-sm text-white/70">Trending from TMDB</p>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Trending Movies</h2>
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {movies.results.slice(0, 8).map((m: any) => (
            <li key={m.id} className="rounded border border-white/10 p-3">{m.title}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-lg font-semibold">Trending TV</h2>
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tv.results.slice(0, 8).map((t: any) => (
            <li key={t.id} className="rounded border border-white/10 p-3">{t.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


