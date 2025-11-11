/**
 * Environment variable validation and configuration
 * 
 * This module validates all required environment variables at startup
 * and provides type-safe access to configuration values.
 */

import logger from './logger';

/**
 * Validated environment configuration
 */
export interface EnvConfig {
  // Database
  databaseUrl: string;
  
  // TMDB API
  tmdb: {
    apiKey?: string;
    readAccessToken?: string;
    baseUrl: string;
    v4BaseUrl: string;
  };
  
  // Redis (optional)
  redis?: {
    url: string;
    token: string;
  };
  
  // NextAuth (optional, for future use)
  nextAuth?: {
    secret: string;
    url: string;
  };
  
  // Node environment
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Environment variable validation errors
 */
export class EnvValidationError extends Error {
  constructor(message: string, public readonly missingVars: string[]) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validate and return environment configuration
 */
export function validateEnv(): EnvConfig {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  
  // Required: DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    missingRequired.push('DATABASE_URL');
  }
  
  // TMDB API - at least one authentication method is required
  const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim();
  const tmdbReadAccessToken = process.env.TMDB_READ_ACCESS_TOKEN?.trim();
  const tmdbBaseUrl = process.env.NEXT_PUBLIC_TMDB_BASE_URL?.trim() || 'https://api.themoviedb.org/3';
  const tmdbV4BaseUrl = process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL?.trim() || 'https://api.themoviedb.org/4';
  
  if (!tmdbApiKey && !tmdbReadAccessToken) {
    missingRequired.push('NEXT_PUBLIC_TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN');
  }
  
  // Redis (optional) - check if partially configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  
  if ((redisUrl && !redisToken) || (!redisUrl && redisToken)) {
    missingOptional.push('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (both required if using Redis)');
  }
  
  // NextAuth (optional, for future use)
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  
  if ((nextAuthSecret && !nextAuthUrl) || (!nextAuthSecret && nextAuthUrl)) {
    missingOptional.push('NEXTAUTH_SECRET and NEXTAUTH_URL (both required if using NextAuth)');
  }
  
  // Node environment
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  
  // Throw error if required variables are missing
  if (missingRequired.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingRequired.join(', ')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See ENV_EXAMPLE.txt for reference.`;
    
    logger.error('Environment validation failed', {
      context: 'EnvValidation',
      missingRequired,
      missingOptional,
    });
    
    throw new EnvValidationError(errorMessage, missingRequired);
  }
  
  // Log warnings for missing optional variables (only in development)
  if (missingOptional.length > 0 && nodeEnv === 'development') {
    logger.warn('Optional environment variables not configured', {
      context: 'EnvValidation',
      missingOptional,
      note: 'Features will work with graceful degradation',
    });
  }
  
  // Log configuration status (only in development)
  if (nodeEnv === 'development') {
    logger.info('Environment configuration validated', {
      context: 'EnvValidation',
      database: 'configured',
      tmdb: {
        hasApiKey: !!tmdbApiKey,
        hasReadAccessToken: !!tmdbReadAccessToken,
        baseUrl: tmdbBaseUrl,
        v4BaseUrl: tmdbV4BaseUrl,
      },
      redis: redisUrl && redisToken ? 'configured' : 'not configured (optional)',
      nextAuth: nextAuthSecret && nextAuthUrl ? 'configured' : 'not configured (optional)',
    });
  }
  
  // Build configuration object
  const config: EnvConfig = {
    databaseUrl: databaseUrl!,
    tmdb: {
      apiKey: tmdbApiKey,
      readAccessToken: tmdbReadAccessToken,
      baseUrl: tmdbBaseUrl,
      v4BaseUrl: tmdbV4BaseUrl,
    },
    nodeEnv,
  };
  
  // Add optional Redis configuration
  if (redisUrl && redisToken) {
    config.redis = {
      url: redisUrl,
      token: redisToken,
    };
  }
  
  // Add optional NextAuth configuration
  if (nextAuthSecret && nextAuthUrl) {
    config.nextAuth = {
      secret: nextAuthSecret,
      url: nextAuthUrl,
    };
  }
  
  return config;
}

/**
 * Get validated environment configuration
 * Validates once and caches the result
 */
let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnv();
  }
  return cachedConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetEnvConfig(): void {
  cachedConfig = null;
}

