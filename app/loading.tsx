export default function Loading() {
  return (
    <div className="min-h-dvh p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-4 text-white/60">Loading...</p>
      </div>
    </div>
  );
}

