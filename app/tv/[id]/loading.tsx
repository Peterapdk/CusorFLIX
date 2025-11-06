export default function Loading() {
  return (
    <div className="min-h-screen bg-cinema-black">
      {/* Hero skeleton */}
      <div className="relative h-screen">
        <div className="absolute inset-0 bg-cinema-gray-dark animate-pulse"></div>
        <div className="relative z-10 flex h-full items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl space-y-6">
              <div className="h-6 bg-cinema-gray-medium rounded w-32"></div>
              <div className="h-16 bg-cinema-gray-medium rounded w-3/4"></div>
              <div className="h-6 bg-cinema-gray-medium rounded w-48"></div>
              <div className="h-24 bg-cinema-gray-medium rounded"></div>
              <div className="flex space-x-4">
                <div className="h-12 bg-cinema-gray-medium rounded w-32"></div>
                <div className="h-12 bg-cinema-gray-medium rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="relative z-10 -mt-32 space-y-16">
        <div className="container mx-auto px-6">
          <div className="h-10 bg-cinema-gray-dark rounded w-48 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] bg-cinema-gray-dark rounded-lg animate-pulse"></div>
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

