import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEnv, getEnvConfig, resetEnvConfig, EnvValidationError } from './env';

// Mock logger to avoid console output in tests
vi.mock('./logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Ensure test environment is set before importing env module
if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test';
}

describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    resetEnvConfig();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    resetEnvConfig();
  });

  it('should validate environment with all required variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL = 'https://api.themoviedb.org/4';
    process.env.NODE_ENV = 'test';

    const config = validateEnv();

    expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.tmdb.apiKey).toBe('test-api-key');
    expect(config.tmdb.baseUrl).toBe('https://api.themoviedb.org/3');
    expect(config.tmdb.v4BaseUrl).toBe('https://api.themoviedb.org/4');
    expect(config.nodeEnv).toBe('test');
  });

  it('should validate with TMDB read access token instead of API key', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.TMDB_READ_ACCESS_TOKEN = 'test-token';
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY; // Clear API key from setup
    process.env.NODE_ENV = 'test';
    resetEnvConfig(); // Reset cached config

    const config = validateEnv();

    expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.tmdb.readAccessToken).toBe('test-token');
    expect(config.tmdb.apiKey).toBeUndefined();
  });

  it('should throw error when DATABASE_URL is missing', () => {
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    delete process.env.DATABASE_URL;

    expect(() => validateEnv()).toThrow(EnvValidationError);
    expect(() => validateEnv()).toThrow('DATABASE_URL');
  });

  it('should throw error when both TMDB API key and token are missing', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    delete process.env.NEXT_PUBLIC_TMDB_API_KEY;
    delete process.env.TMDB_READ_ACCESS_TOKEN;

    expect(() => validateEnv()).toThrow(EnvValidationError);
    expect(() => validateEnv()).toThrow('NEXT_PUBLIC_TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN');
  });

  it('should include Redis config when both URL and token are provided', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
    process.env.NODE_ENV = 'test';

    const config = validateEnv();

    expect(config.redis).toBeDefined();
    expect(config.redis?.url).toBe('https://redis.upstash.io');
    expect(config.redis?.token).toBe('test-redis-token');
  });

  it('should not include Redis config when only URL is provided', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.NODE_ENV = 'test';

    const config = validateEnv();

    expect(config.redis).toBeUndefined();
  });

  it('should use default TMDB URLs when not provided', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    delete process.env.NEXT_PUBLIC_TMDB_BASE_URL;
    delete process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL;
    process.env.NODE_ENV = 'test';

    const config = validateEnv();

    expect(config.tmdb.baseUrl).toBe('https://api.themoviedb.org/3');
    expect(config.tmdb.v4BaseUrl).toBe('https://api.themoviedb.org/4');
  });

  it('should trim whitespace from environment variables', () => {
    process.env.DATABASE_URL = '  postgresql://user:pass@localhost:5432/db  ';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = '  test-api-key  ';
    process.env.NODE_ENV = 'test';

    const config = validateEnv();

    expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/db');
    expect(config.tmdb.apiKey).toBe('test-api-key');
  });

  it('should cache configuration on subsequent calls', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'test';

    const config1 = getEnvConfig();
    const config2 = getEnvConfig();

    // Should be the same object reference (cached)
    expect(config1).toBe(config2);
  });

  it('should reset cached configuration', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
    process.env.NODE_ENV = 'test';

    const config1 = getEnvConfig();
    resetEnvConfig();
    
    // Change environment
    process.env.NEXT_PUBLIC_TMDB_API_KEY = 'new-api-key';
    const config2 = getEnvConfig();

    // Should get new configuration after reset
    expect(config2.tmdb.apiKey).toBe('new-api-key');
  });
});
