import { z } from 'zod';
import logger from './logger';

// Custom error for environment validation issues
export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

// Zod schema for environment variables
const envSchema = z.object({
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),
  tmdb: z.object({
    apiKey: z.string().optional(),
    readAccessToken: z.string().optional(),
    baseUrl: z.string().url().default('https://api.themoviedb.org/3'),
    v4BaseUrl: z.string().url().default('https://api.themoviedb.org/4'),
  }).refine(
    (data) => data.apiKey || data.readAccessToken,
    'Either NEXT_PUBLIC_TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN must be provided'
  ),
  redis: z.object({
    url: z.string().url(),
    token: z.string().min(1),
  }).optional(),
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
});

// Type definition for the configuration object
export type EnvConfig = z.infer<typeof envSchema>;

// Singleton instance to hold the validated environment configuration
let _envConfig: EnvConfig | null = null;

/**
 * Validates and returns the environment configuration.
 * Caches the configuration after the first successful validation.
 * @returns The validated environment configuration.
 * @throws {EnvValidationError} If validation fails.
 */
export function validateEnv(): EnvConfig {
  try {
    const rawEnv = {
      databaseUrl: process.env.DATABASE_URL?.trim(),
      tmdb: {
        apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY?.trim(),
        readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN?.trim(),
        baseUrl: process.env.NEXT_PUBLIC_TMDB_BASE_URL?.trim(),
        v4BaseUrl: process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL?.trim(),
      },
      redis:
        process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
          ? {
              url: process.env.UPSTASH_REDIS_REST_URL.trim(),
              token: process.env.UPSTASH_REDIS_REST_TOKEN.trim(),
            }
          : undefined,
      nodeEnv: process.env.NODE_ENV?.trim(),
    };

    const validatedEnv = envSchema.parse(rawEnv);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      const errorMessage = `Environment validation failed:\n- ${messages.join('\n- ')}`;
      logger.error(errorMessage, { context: 'env' });
      throw new EnvValidationError(errorMessage);
    }
    logger.error('An unexpected error occurred during environment validation', { context: 'env', error });
    throw error;
  }
}

/**
 * Retrieves the validated environment configuration.
 * On the first call, it validates the environment and caches the result.
 * Subsequent calls return the cached configuration.
 * @returns The validated environment configuration.
 */
export function getEnvConfig(): EnvConfig {
  if (!_envConfig) {
    _envConfig = validateEnv();
  }
  return _envConfig;
}

/**
 * Resets the cached environment configuration.
 * Primarily for testing purposes to allow re-validation.
 */
export function resetEnvConfig(): void {
  _envConfig = null;
}
