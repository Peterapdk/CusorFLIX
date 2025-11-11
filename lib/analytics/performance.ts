/**
 * Performance Monitoring - Web Vitals tracking and page load time measurement
 * Uses web-vitals library for Core Web Vitals metrics
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';
import logger from '@/lib/logger';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Web Vitals thresholds (Google's recommended thresholds)
 */
const WEB_VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 }, // milliseconds (replaces FID)
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  TTFB: { good: 800, poor: 1800 }, // milliseconds
} as const;

/**
 * Get performance rating based on metric value
 */
function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS];
  if (!thresholds) {
    return 'needs-improvement';
  }

  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.poor) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Send metric to analytics (gtag if available, otherwise log)
 */
function sendToAnalytics(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);
  
  // Log metric with rating
  logger.info(`Web Vital: ${metric.name}`, {
    context: 'PerformanceMonitor',
    metric: metric.name,
    value: Math.round(metric.value),
    rating,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  // Send to gtag if available (Google Analytics)
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true,
        custom_map: {
          metric_rating: rating,
          metric_delta: metric.delta,
        },
      });
    } catch (error) {
      logger.error('Error sending metric to gtag', {
        context: 'PerformanceMonitor',
        error: error instanceof Error ? error : new Error(String(error)),
        metric: metric.name,
      });
    }
  }

  // Log warning for poor performance
  if (rating === 'poor') {
    logger.warn(`Poor ${metric.name} performance detected`, {
      context: 'PerformanceMonitor',
      metric: metric.name,
      value: Math.round(metric.value),
      threshold: WEB_VITALS_THRESHOLDS[metric.name as keyof typeof WEB_VITALS_THRESHOLDS]?.poor,
    });
  }
}

/**
 * Measure page load time
 */
export function measurePageLoad(pageName: string): () => void {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return () => {}; // Return no-op function if not in browser
  }

  const startTime = performance.now();
  const SLOW_PAGE_THRESHOLD = 2000; // 2 seconds

  return () => {
    const loadTime = performance.now() - startTime;
    const isSlow = loadTime > SLOW_PAGE_THRESHOLD;

    logger.info(`Page load time: ${pageName}`, {
      context: 'PerformanceMonitor',
      pageName,
      loadTime: Math.round(loadTime),
      isSlow,
    });

    if (isSlow) {
      logger.warn(`Slow page load detected: ${pageName}`, {
        context: 'PerformanceMonitor',
        pageName,
        loadTime: Math.round(loadTime),
        threshold: SLOW_PAGE_THRESHOLD,
      });
    }

    // Send to gtag if available
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', 'page_load_time', {
          event_category: 'Performance',
          event_label: pageName,
          value: Math.round(loadTime),
          non_interaction: true,
          custom_map: {
            is_slow: isSlow,
          },
        });
      } catch (error) {
        logger.error('Error sending page load time to gtag', {
          context: 'PerformanceMonitor',
          error: error instanceof Error ? error : new Error(String(error)),
          pageName,
        });
      }
    }
  };
}

/**
 * Initialize Web Vitals tracking
 * Should be called on client-side only (in layout.tsx or _app.tsx)
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') {
    logger.warn('Web Vitals initialization skipped - not in browser environment', {
      context: 'PerformanceMonitor',
    });
    return;
  }

  try {
    // Track Cumulative Layout Shift (CLS)
    onCLS(sendToAnalytics);

    // Track Interaction to Next Paint (INP) - replaces FID
    onINP(sendToAnalytics);

    // Track First Contentful Paint (FCP)
    onFCP(sendToAnalytics);

    // Track Largest Contentful Paint (LCP)
    onLCP(sendToAnalytics);

    // Track Time to First Byte (TTFB)
    onTTFB(sendToAnalytics);

    logger.info('Web Vitals tracking initialized', {
      context: 'PerformanceMonitor',
    });
  } catch (error) {
    logger.error('Error initializing Web Vitals tracking', {
      context: 'PerformanceMonitor',
      error: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

/**
 * Performance Monitor class for managing performance tracking
 */
export class PerformanceMonitor {
  private static initialized = false;

  /**
   * Initialize performance monitoring
   * Call this once in your app layout or _app.tsx
   */
  static init(): void {
    if (this.initialized) {
      logger.debug('Performance monitoring already initialized', {
        context: 'PerformanceMonitor',
      });
      return;
    }

    initWebVitals();
    this.initialized = true;
  }

  /**
   * Measure page load time for a specific page
   * Returns a function to call when the page has finished loading
   */
  static measurePageLoad(pageName: string): () => void {
    return measurePageLoad(pageName);
  }

  /**
   * Get current page performance metrics
   * Returns performance timing data if available
   */
  static getPageMetrics(): PerformanceNavigationTiming | null {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return null;
    }

    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      return navigation || null;
    } catch (error) {
      logger.error('Error getting page metrics', {
        context: 'PerformanceMonitor',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return null;
    }
  }
}

// Export default instance methods for convenience
export default PerformanceMonitor;

