import { PrismaClient } from '@prisma/client';
import logger from '@/lib/logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Performance monitoring for slow queries
const SLOW_QUERY_THRESHOLD_MS = 500;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          {
            emit: 'event',
            level: 'query',
          },
          'error',
          'warn',
        ]
      : ['error', 'warn'],
  });

// Development query logging and slow query detection
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: { query: string; params: string; duration: number; target: string }) => {
    const duration = e.duration;
    
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn('Slow query detected', {
        context: 'Prisma',
        duration: `${duration}ms`,
        query: e.query,
        params: e.params,
        target: e.target,
      });
    } else {
      logger.debug('Database query executed', {
        context: 'Prisma',
        duration: `${duration}ms`,
        target: e.target,
      });
    }
  });
}

// Production slow query detection via middleware
// Note: Using any for params type as Prisma middleware types are complex and vary by model
prisma.$use(async (params: any, next: any) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  const duration = after - before;

  if (duration > SLOW_QUERY_THRESHOLD_MS && process.env.NODE_ENV === 'production') {
    logger.warn('Slow query detected in production', {
      context: 'Prisma',
      duration: `${duration}ms`,
      model: params.model || 'unknown',
      action: params.action || 'unknown',
    });
  }

  return result;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


