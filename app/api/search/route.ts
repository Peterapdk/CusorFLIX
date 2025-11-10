import { NextRequest, NextResponse } from 'next/server';
import { tmdbEnhanced } from '@/lib/tmdb-enhanced';
import logger from '@/lib/logger';
import type { TMDBMediaItem } from '@/types/tmdb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      results: data.results || [],
      page: data.page || page,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0,
    });
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
