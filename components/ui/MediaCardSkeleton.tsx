interface MediaCardSkeletonProps {
  size?: 'small' | 'medium' | 'large';
}

export default function MediaCardSkeleton({ size = 'medium' }: MediaCardSkeletonProps) {
  const sizeClasses = {
    small: 'w-32',
    medium: 'w-48',
    large: 'w-64',
  };

  return (
    <div className={`${sizeClasses[size]} animate-pulse`}>
      {/* Poster Skeleton */}
      <div className="aspect-[2/3] bg-cinema-gray-medium rounded-lg mb-3" />
      
      {/* Title Skeleton */}
      <div className="h-4 w-3/4 bg-cinema-gray-medium rounded mb-2" />
      
      {/* Metadata Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-cinema-gray-medium rounded" />
        <div className="h-3 w-12 bg-cinema-gray-medium rounded" />
      </div>
    </div>
  );
}
