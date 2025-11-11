/**
 * Vitest setup file
 * 
 * This file is run before each test file to configure the testing environment.
 * 
 * IMPORTANT: Environment variables must be set BEFORE any modules are imported
 * to prevent environment validation from failing during test setup.
 */

// Set environment variables FIRST, before any imports
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_TMDB_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_TMDB_BASE_URL = 'https://api.themoviedb.org/3';
process.env.NEXT_PUBLIC_TMDB_V4_BASE_URL = 'https://api.themoviedb.org/4';

// Now import testing libraries
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
  }),
}));

// Mock logger to prevent console output during tests
vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  },
}));

// Mock Prisma to prevent database connection attempts
vi.mock('@/lib/db', () => ({
  prisma: {
    list: { findMany: vi.fn(), findFirst: vi.fn() },
    listItem: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

// Mock Redis cache to prevent connection attempts
vi.mock('@/lib/cache/redis-cache', () => ({
  cacheManager: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    invalidateTag: vi.fn(),
    invalidateTags: vi.fn(),
  },
}));

// Mock rate limiter to prevent Redis connection attempts
vi.mock('@/lib/rate-limit', () => ({
  rateLimiter: {
    checkLimit: vi.fn(),
    resetLimit: vi.fn(),
  },
  rateLimit: vi.fn(),
}));
