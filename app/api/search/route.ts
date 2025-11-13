import { NextRequest, NextResponse } from 'next/server';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import logger from '@/lib/logger';
import type { TMDBMediaItem } from '@/types/tmdb';
import { applyRateLimit, createRateLimitResponse, rateLimiters } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(100, 'Query too long'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1).refine(val => val > 0 && val <= 1000, 'Page must be between 1 and 1000'),
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, rateLimiters.search);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime);
  }

  const searchParams = request.nextUrl.searchParams;

  try {

    // Validate and parse query parameters
    const validationResult = searchQuerySchema.safeParse({
      q: searchParams.get('q'),
      page: searchParams.get('page'),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { q, page } = validationResult.data;

    const data = await tmdbEnhanced.searchMulti(q.trim(), page);

    return NextResponse.json({
      results: data.results || [],
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isValidationError = errorMessage.includes('Invalid') || errorMessage.includes('validation');

    logger.error('Error in search API route', {
      context: 'SearchAPI',
      error: error instanceof Error ? error : new Error(String(error)),
      query: searchParams.get('q'),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        error: isValidationError ? 'Invalid search parameters' : 'Failed to perform search',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An internal error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
