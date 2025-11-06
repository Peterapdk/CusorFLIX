'use client';

import { useEffect, useState, useRef } from 'react';
import type { AdBlockerBlockedEvent } from '@/types/events';

export default function AdBlockerStatus() {
  const [blockedCount, setBlockedCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleBlocked = (event: AdBlockerBlockedEvent) => {
      setBlockedCount((prev) => prev + 1);
      setIsVisible(true);
      
      // Clear any existing timeout before creating a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        timeoutRef.current = null;
      }, 3000);
    };

    window.addEventListener('adblocker:blocked', handleBlocked as EventListener);

    return () => {
      window.removeEventListener('adblocker:blocked', handleBlocked as EventListener);
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  if (!isVisible || blockedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="rounded-lg bg-green-500/90 px-4 py-2 text-sm text-white shadow-lg ring-1 ring-green-400/50">
        🛡️ Ad blocker active - {blockedCount} pop-up{blockedCount !== 1 ? 's' : ''} blocked
      </div>
    </div>
  );
}
