import MediaCardSkeleton from '@/components/ui/MediaCardSkeleton';

export default function LibraryLoading() {
  return (
    <main className="min-h-screen bg-cinema-black pt-20 px-6">
      <div className="container mx-auto py-8">
        <div className="animate-pulse mb-8">
          <div className="h-10 w-48 bg-cinema-gray-medium rounded" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(12)].map((_, index) => (
            <MediaCardSkeleton key={index} size="medium" />
          ))}
        </div>
      </div>
    </main>
  );
}

