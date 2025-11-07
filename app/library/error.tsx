'use client';

import Link from 'next/link';

export default function LibraryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-cinema-black pt-20 px-6">
      <div className="container mx-auto max-w-2xl text-center py-16">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Failed to load library</h1>
            <p className="text-cinema-white-dim text-lg">
              {error.message || 'Something went wrong while loading your library'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={reset} 
              className="btn-primary px-6 py-3"
            >
              Try Again
            </button>
            <Link 
              href="/" 
              className="btn-secondary px-6 py-3"
            >
              Back to Home
            </Link>
          </div>

          {error.digest && (
            <p className="text-xs text-cinema-white-dim mt-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
