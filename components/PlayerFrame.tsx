'use client';

import { useEffect } from 'react';

type PlayerFrameProps = {
  src: string;
  className?: string;
};

export default function PlayerFrame({ src, className }: PlayerFrameProps) {
  useEffect(() => {
    const STORAGE_KEY = 'watch_progress';
    const onMessage = (event: MessageEvent) => {
      if ((event as any).data?.type === 'MEDIA_DATA') {
        const mediaData = (event as any).data.data;
        try {
          const json = localStorage.getItem(STORAGE_KEY) || '{}';
          const watchProgress = JSON.parse(json);
          if (
            mediaData?.id &&
            (mediaData?.type === 'movie' || mediaData?.type === 'tv')
          ) {
            watchProgress[mediaData.id] = {
              ...(watchProgress[mediaData.id] || {}),
              ...mediaData,
              last_updated: Date.now(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
          }
        } catch {}
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-white/10 px-3 py-1 text-xs ring-1 ring-white/20 hover:bg-white/15"
        >
          Open in new tab
        </a>
      </div>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: '0' }}
        allowFullScreen
        referrerPolicy="no-referrer"
      />
    </div>
  );
}


