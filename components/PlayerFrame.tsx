'use client';

import { useEffect, useRef } from 'react';
import logger from '@/lib/logger';

type PlayerFrameProps = {
  src: string;
  className?: string;
};

export default function PlayerFrame({ src, className }: PlayerFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const STORAGE_KEY = 'watch_progress';
    
    // Block pop-ups and window.open calls more aggressively
    const originalOpen = window.open;
    const blockedPopups: string[] = [];
    
    window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
      if (url && typeof url === 'string') {
        // Block known ad domains and pop-up patterns
        const blockedPatterns = [
          /popup/i,
          /advertisement/i,
          /ads?\./i,
          /doubleclick/i,
          /googleads/i,
          /adserver/i,
          /banner/i,
          /click/i,
          /redirect/i,
        ];
        
        const isBlocked = blockedPatterns.some(pattern => pattern.test(url));
        if (isBlocked || !url.startsWith('https://cinemaos.tech')) {
          blockedPopups.push(url);
          logger.adBlocker('Blocked pop-up attempt', { url, reason: 'popup' });
          // Dispatch custom event for ad blocker status
          window.dispatchEvent(new CustomEvent('adblocker:blocked', { detail: { url, reason: 'popup' } }));
          return null;
        }
        // URL passed all checks - allow legitimate CinemaOS navigation
        return originalOpen(url, target, features);
      }
      // Non-string URL or no URL - block for safety
      logger.adBlocker('Blocked pop-up attempt (non-string URL)', { url: String(url) });
      return null;
    };

    // Override window.open on iframe content as well
    const blockIframePopups = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentWindow) {
          // This won't work due to cross-origin restrictions, but we try
          try {
            (iframe.contentWindow as any).open = () => null;
          } catch (e) {
            // Cross-origin - expected
          }
        }
      } catch (e) {
        // Expected for cross-origin iframes
      }
    };

    // Monitor for new windows that might bypass our block
    const checkForNewWindows = () => {
      // This is a fallback - browsers should respect window.open override
      if (window.frames.length > 1) {
        logger.debug('Multiple frames detected - monitoring for pop-ups', { context: 'PlayerFrame' });
      }
    };

    // Enhanced message filtering to block ad-related messages
    const onMessage = (event: MessageEvent) => {
      // Only accept messages from CinemaOS domain - strict origin validation
      const allowedOrigin = 'https://cinemaos.tech';
      
      // Block messages from any origin other than the exact allowed origin
      if (event.origin !== allowedOrigin) {
        logger.adBlocker('Blocked message from suspicious origin', { origin: event.origin });
        window.dispatchEvent(new CustomEvent('adblocker:blocked', { detail: { url: event.origin, reason: 'suspicious-origin' } }));
        return;
      }

      // Filter out ad-related message types
      const blockedTypes = ['ad', 'advertisement', 'popup', 'redirect', 'click', 'clickthrough'];
      const messageType = event.data?.type || event.data?.action || '';
      
      if (blockedTypes.some(type => 
        String(messageType).toLowerCase().includes(type)
      )) {
        logger.adBlocker('Blocked ad-related message', { messageType });
        window.dispatchEvent(new CustomEvent('adblocker:blocked', { detail: { url: messageType, reason: 'ad-message' } }));
        return;
      }

      // Block redirect attempts
      if (event.data?.redirect || event.data?.url) {
        const redirectUrl = event.data.redirect || event.data.url;
        if (redirectUrl && !redirectUrl.includes('cinemaos.tech')) {
          logger.adBlocker('Blocked redirect attempt', { redirectUrl });
          window.dispatchEvent(new CustomEvent('adblocker:blocked', { detail: { url: redirectUrl, reason: 'redirect' } }));
          return;
        }
      }

      // Process legitimate media data messages
      if (event.data && typeof event.data === 'object' && 'type' in event.data && event.data.type === 'MEDIA_DATA') {
        const mediaData = 'data' in event.data ? event.data.data : null;
        if (mediaData && typeof mediaData === 'object' && mediaData !== null) {
          try {
            const json = localStorage.getItem(STORAGE_KEY) || '{}';
            const watchProgress = JSON.parse(json);
            if (
              'id' in mediaData &&
              'type' in mediaData &&
              (mediaData.type === 'movie' || mediaData.type === 'tv')
            ) {
              watchProgress[String(mediaData.id)] = {
                ...(watchProgress[String(mediaData.id)] || {}),
                ...mediaData,
                last_updated: Date.now(),
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
            }
          } catch (error) {
            logger.error('Failed to save watch progress to localStorage', {
              context: 'PlayerFrame',
              error: error instanceof Error ? error : new Error(String(error))
            });
          }
        }
      }
    };

    // Block blur-based pop-ups (common ad technique)
    let blurTimer: NodeJS.Timeout | null = null;
    const blockBlurPopups = () => {
      // Some ads use window blur to trigger pop-ups
      // We'll monitor this but allow legitimate blur events
      blurTimer = setTimeout(() => {
        // Check if a pop-up was opened during blur
        if (window.frames.length > 1) {
          logger.debug('Potential pop-up detected during blur', { context: 'PlayerFrame' });
        }
      }, 100);
    };

    const cancelBlurTimer = () => {
      if (blurTimer) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
    };

    // Try to block iframe pop-ups
    blockIframePopups();

    // Add event listeners
    window.addEventListener('message', onMessage);
    window.addEventListener('blur', blockBlurPopups);
    window.addEventListener('focus', cancelBlurTimer);
    
    // Periodic check for new windows
    const windowCheckInterval = setInterval(checkForNewWindows, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('blur', blockBlurPopups);
      window.removeEventListener('focus', cancelBlurTimer);
      window.open = originalOpen; // Restore original window.open
      clearInterval(windowCheckInterval);
      if (blurTimer) clearTimeout(blurTimer);
    };
  }, []);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        ref={iframeRef}
        src={src}
        style={{ width: '100%', height: '100%', border: '0' }}
        allowFullScreen
        referrerPolicy="no-referrer"
        sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
        loading="lazy"
        onLoad={() => {
          logger.debug('CinemaOS player iframe loaded', { context: 'PlayerFrame', src });
        }}
        title="CinemaOS Player"
      />
    </div>
  );
}


