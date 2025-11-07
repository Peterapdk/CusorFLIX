export default function HeroSkeleton() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-cinema-gray-dark animate-pulse">
      {/* Background Skeleton */}
      <div className="absolute inset-0 bg-gradient-to-r from-cinema-black via-cinema-gray-dark to-cinema-gray-medium" />
      
      {/* Content Skeleton */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl space-y-6">
            {/* Badge Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-6 w-24 bg-cinema-gray-medium rounded" />
              <div className="h-6 w-16 bg-cinema-gray-medium rounded" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-16 w-3/4 bg-cinema-gray-medium rounded" />
              <div className="h-16 w-1/2 bg-cinema-gray-medium rounded" />
            </div>

            {/* Rating Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-cinema-gray-medium rounded" />
              <div className="h-8 w-16 bg-cinema-gray-medium rounded" />
              <div className="h-8 w-24 bg-cinema-gray-medium rounded" />
            </div>

            {/* Description Skeleton */}
            <div className="space-y-2 max-w-xl">
              <div className="h-4 w-full bg-cinema-gray-medium rounded" />
              <div className="h-4 w-full bg-cinema-gray-medium rounded" />
              <div className="h-4 w-3/4 bg-cinema-gray-medium rounded" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex space-x-4">
              <div className="h-14 w-40 bg-cinema-gray-medium rounded" />
              <div className="h-14 w-32 bg-cinema-gray-medium rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
