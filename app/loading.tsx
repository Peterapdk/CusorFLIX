export default function Loading() {
  return (
    <div className="min-h-dvh p-6 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cinema-orange border-t-transparent"></div>
        <p className="text-white/80 text-lg font-medium">Loading...</p>
        <p className="text-white/60 text-sm">Please wait while we load your content</p>
      </div>
    </div>
  );
}
