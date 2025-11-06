import { searchMulti } from '@/lib/tmdb';
import Link from 'next/link';
import MediaCard from '@/components/ui/MediaCard';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const data = q ? await searchMulti(q, 1).catch(() => ({ results: [] as any[] })) : { results: [] as any[] };

  // Filter out person results and organize by media type
  const movieResults = data.results?.filter((item: any) => item.media_type === 'movie') || [];
  const tvResults = data.results?.filter((item: any) => item.media_type === 'tv') || [];
  const otherResults = data.results?.filter((item: any) => !['movie', 'tv'].includes(item.media_type)) || [];

  return (
    <main className="min-h-screen bg-cinema-black pt-24 px-6">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-section font-bold text-white">Search</h1>
          <p className="text-cinema-white-dim">Discover movies and TV shows</p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto">
          <form action="/search" className="relative">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search for movies, TV shows, actors..."
                className="w-full bg-cinema-gray-dark border border-cinema-gray-medium rounded-lg px-6 py-4 pr-12 text-white placeholder-cinema-white-dim focus:outline-none focus:ring-2 focus:ring-cinema-orange focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-cinema-white-dim hover:text-cinema-orange transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {q && (
          <div className="space-y-8">
            {/* Results Summary */}
            <div className="text-center">
              <p className="text-cinema-white-muted">
                {data.results?.length ? (
                  <>
                    Found <span className="text-cinema-orange font-semibold">{data.results.length}</span> results for{" "}
                    <span className="text-white font-semibold">&quot;{q}&quot;</span>
                  </>
                ) : (
                  <>
                    No results found for <span className="text-white font-semibold">&quot;{q}&quot;</span>
                  </>
                )}
              </p>
            </div>

            {/* Movies Section */}
            {movieResults.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Movies <span className="text-cinema-orange">({movieResults.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {movieResults.map((item: any) => (
                    <MediaCard
                      key={`movie-${item.id}`}
                      item={{
                        ...item,
                        title: item.title,
                        media_type: 'movie'
                      }}
                      size="medium"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* TV Shows Section */}
            {tvResults.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-6">
                  TV Shows <span className="text-cinema-orange">({tvResults.length})</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {tvResults.map((item: any) => (
                    <MediaCard
                      key={`tv-${item.id}`}
                      item={{
                        ...item,
                        name: item.name,
                        media_type: 'tv'
                      }}
                      size="medium"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Results */}
            {otherResults.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold text-white mb-6">
                  Other Results <span className="text-cinema-orange">({otherResults.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherResults.map((item: any) => (
                    <div key={`other-${item.id}`} className="bg-cinema-gray-dark rounded-lg p-4 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-cinema-gray-medium rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-cinema-white-dim" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{item.name || item.title}</h3>
                        <p className="text-cinema-white-dim text-sm capitalize">{item.media_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {data.results?.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="w-24 h-24 bg-cinema-gray-dark rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-cinema-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">No results found</h3>
                <p className="text-cinema-white-dim max-w-md mx-auto">
                  Try searching for something else or check your spelling. You can also browse our trending content below.
                </p>
                <Link href="/" className="btn-primary mt-6">
                  Browse Trending
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Default State - No Search Query */}
        {!q && (
          <div className="text-center py-16 space-y-4">
            <div className="w-24 h-24 bg-cinema-gray-dark rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-cinema-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Search for Movies & TV Shows</h3>
            <p className="text-cinema-white-dim max-w-md mx-auto">
              Find your next favorite movie or TV show. Search by title, actor, or genre.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}