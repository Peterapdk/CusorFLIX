'use client';

import { useEffect } from 'react';
import { PerformanceMonitor } from '@/lib/analytics/performance';
import { usePathname } from 'next/navigation';

/**
 * Client component for initializing performance monitoring
 * Must be client-side only since Web Vitals requires browser APIs
 */
export default function PerformanceMonitorClient() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Web Vitals tracking once on mount
    PerformanceMonitor.init();
  }, []);

  useEffect(() => {
    // Measure page load time for each route change
    const pageName = pathname || '/';
    let endMeasurement: (() => void) | null = null;

    // Start measurement when route changes
    const startMeasurement = () => {
      endMeasurement = PerformanceMonitor.measurePageLoad(pageName);
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      // Page is already loaded, start measurement immediately
      startMeasurement();
      // End measurement after a short delay to capture load time
      const timeoutId = setTimeout(() => {
        if (endMeasurement) {
          endMeasurement();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // Wait for page to load
      startMeasurement();
      const handleLoad = () => {
        // Small delay to ensure all resources are loaded
        setTimeout(() => {
          if (endMeasurement) {
            endMeasurement();
          }
        }, 100);
      };

      window.addEventListener('load', handleLoad);
      return () => {
        window.removeEventListener('load', handleLoad);
        if (endMeasurement) {
          endMeasurement();
        }
      };
    }
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

