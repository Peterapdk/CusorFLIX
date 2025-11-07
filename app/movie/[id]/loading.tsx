export default function MovieLoading() {
  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-64 h-96 bg-muted rounded-lg" />
            </div>

            {/* Info Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="h-12 w-3/4 bg-muted rounded" />
                <div className="h-6 w-1/4 bg-muted rounded" />
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-8 w-24 bg-muted rounded" />
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>

              <div className="flex space-x-4">
                <div className="h-12 w-32 bg-muted rounded" />
                <div className="h-12 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Cast Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="flex space-x-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <div className="aspect-[2/3] bg-muted rounded-lg mb-2" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

