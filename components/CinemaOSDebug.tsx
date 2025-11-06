'use client';

export default function CinemaOSDebug({ url }: { url: string }) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md rounded-lg bg-black/80 px-3 py-2 text-xs text-white ring-1 ring-white/20">
      <div className="font-semibold mb-1">CinemaOS Debug:</div>
      <div className="break-all text-white/70">{url}</div>
    </div>
  );
}

