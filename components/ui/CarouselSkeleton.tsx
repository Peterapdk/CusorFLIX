export default function CarouselSkeleton() {
  return (
    <section className="py-8">
      {/* Header Skeleton */}
      <div className="container mx-auto px-6 mb-6">
        <div className="h-8 w-48 bg-cinema-gray-medium rounded animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="container mx-auto px-6">
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 animate-pulse"
            >
              {/* Poster Skeleton */}
              <div className="aspect-[2/3] bg-cinema-gray-medium rounded-lg mb-3" />
              
              {/* Title Skeleton */}
              <div className="h-4 w-3/4 bg-cinema-gray-medium rounded mb-2" />
              
              {/* Year Skeleton */}
              <div className="h-3 w-16 bg-cinema-gray-medium rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
