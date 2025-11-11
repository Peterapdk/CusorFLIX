import { NextRequest, NextResponse } from 'next/server';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import logger from '@/lib/logger';
import { rateLimiter, type RateLimitRequest } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/utils/request';
import type { TMDBMediaItem } from '@/types/tmdb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (TMDB search API: 40 requests per minute)
    const clientIp = getClientIp(request);
    const rateLimitRequest: RateLimitRequest = {
      identifier: clientIp,
      endpoint: '/api/search',
    };

    const rateLimitResult = await rateLimiter.checkLimit(rateLimitRequest, {
      limit: 40,
      window: 60, // 60 seconds = 1 minute
      keyGenerator: (req) => `tmdb:search:${req.identifier}`,
      allowOnFailure: true, // Graceful degradation - allow on Redis failure
    });

    // If rate limit exceeded, return 429 with Retry-After header
    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded for search API', {
        context: 'SearchAPI',
        identifier: clientIp,
        count: rateLimitResult.count,
        limit: rateLimitResult.limit,
        retryAfter: rateLimitResult.retryAfter,
      });

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`,
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': Math.max(0, rateLimitResult.limit - rateLimitResult.count).toString(),
            'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + rateLimitResult.retryAfter).toString(),
          },
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!q) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const data = await tmdbEnhanced.searchMulti(q, page);

    return NextResponse.json(
      {
        results: data.results || [],
        page: data.page || page,
        total_pages: data.total_pages || 1,
        total_results: data.total_results || 0,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': Math.max(0, rateLimitResult.limit - rateLimitResult.count).toString(),
          'X-RateLimit-Reset': (Math.floor(Date.now() / 1000) + rateLimitResult.resetTime).toString(),
        },
      }
    );
  } catch (error) {
    logger.error('Error in search API route', {
      context: 'SearchAPI',
      error: error instanceof Error ? error : new Error(String(error)),
    });

    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
