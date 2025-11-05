import { searchMulti } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || '';
  const data = q ? await searchMulti(q, 1).catch(() => ({ results: [] })) : { results: [] as any[] };

  return (
    <main className="min-h-dvh p-6 space-y-4">
      <h1 className="text-xl font-semibold">Search</h1>
      <form action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search movies and TV..."
          className="w-full rounded bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/20"
        />
        <button className="rounded bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/15">Go</button>
      </form>

      {q && (
        <p className="text-sm text-white/60">Results for "{q}" — {data.results?.length ?? 0}</p>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data.results?.map((item: any) => (
          <li key={`${item.media_type}-${item.id}`} className="rounded border border-white/10 p-3">
            <div className="text-xs uppercase text-white/50">{item.media_type}</div>
            <div className="font-medium">{item.title || item.name}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}


