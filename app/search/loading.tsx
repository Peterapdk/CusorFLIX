export default function Loading() {
  return (
    <div className="min-h-screen bg-cinema-black pt-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="animate-pulse space-y-8">
          {/* Search bar skeleton */}
          <div className="max-w-2xl mx-auto">
            <div className="h-14 bg-cinema-gray-dark rounded-lg"></div>
          </div>
          
          {/* Results skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] bg-cinema-gray-dark rounded-lg"></div>
                <div className="h-4 bg-cinema-gray-dark rounded w-3/4"></div>
                <div className="h-3 bg-cinema-gray-dark rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

