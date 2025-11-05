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
    <iframe
      src={src}
      className={className}
      style={{ width: '100%', height: '100%', border: '0' }}
      allowFullScreen
    />
  );
}


