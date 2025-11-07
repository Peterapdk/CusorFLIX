'use client';

import Link from 'next/link';

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cinema-black flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Failed to load player</h1>
          <p className="text-cinema-white-dim text-lg">
            {error.message || 'Something went wrong while loading the video player'}
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
  );
}
