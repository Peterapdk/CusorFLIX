'use client';

import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting and performance
const PlayerFrame = dynamic(() => import('@/components/PlayerFrame'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-cinema-black flex items-center justify-center">
      <div className="text-cinema-white-dim">Loading player...</div>
    </div>
  ),
});

const AdBlockerStatus = dynamic(() => import('@/components/AdBlockerStatus'), {
  ssr: false,
});

// Only load debug component in development
const CinemaOSDebug = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import('@/components/CinemaOSDebug'), { ssr: false })
  : () => null;

interface WatchPlayerProps {
  src: string;
}

export default function WatchPlayer({ src }: WatchPlayerProps) {
  return (
    <div className="h-[100dvh] w-full">
      <PlayerFrame src={src} className="h-full w-full" />
      <AdBlockerStatus />
      <CinemaOSDebug url={src} />
    </div>
  );
}

