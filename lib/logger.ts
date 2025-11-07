/**
 * Centralized logging utility for the application
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  error?: Error;
  [key: string]: unknown; // Allow additional properties
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG]${options?.context ? ` [${options.context}]` : ''} ${message}`, options?.error || '');
    }
  }

  /**
   * Log an info message
   */
  info(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      console.info(`[INFO]${options?.context ? ` [${options.context}]` : ''} ${message}`);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, options?: LogOptions): void {
    console.warn(`[WARN]${options?.context ? ` [${options.context}]` : ''} ${message}`, options?.error || '');
  }

  /**
   * Log an error message
   * Always logs in production for critical errors
   */
  error(message: string, options?: LogOptions): void {
    const error = options?.error;
    const context = options?.context ? ` [${options.context}]` : '';
    
    if (error) {
      console.error(`[ERROR]${context} ${message}`, error);
      
      // In production, you might want to send to error tracking service
      if (this.isProduction && error) {
        // FUTURE: Integrate with error tracking service (e.g., Sentry, LogRocket)
        // This is a planned enhancement for production monitoring.
        // When implementing, uncomment and configure:
        // errorTrackingService.captureException(error, { context, message });
      }
    } else {
      console.error(`[ERROR]${context} ${message}`);
    }
  }

  /**
   * Log ad blocker events (development only)
   */
  adBlocker(event: string, details?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(`[ADBLOCKER] ${event}`, details || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;

