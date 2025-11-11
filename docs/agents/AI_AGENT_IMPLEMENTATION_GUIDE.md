# CinemaRebel - AI Agent Implementation Guide
**For Autonomous AI Engineers | Production Deployment**

## Executive Summary
This guide distills the refined optimization strategy into **actionable, agent-executable tasks** for CinemaRebel (Next.js 15 + Prisma + TMDB). Each task includes:
- **Exact file paths** to modify
- **Copy-paste ready code snippets**
- **Environment variable requirements**
- **Testing commands**
- **Rollback procedures**

## Project Context
- **Framework**: Next.js 15 (App Router), TypeScript strict
- **Database**: PostgreSQL via Prisma (User, List, ListItem)
- **External**: TMDB API for movie/TV data
- **Current**: YOLO mode enabled, MCP servers configured

## Phase 1: Database Optimization (Priority: Critical)

### 1.1 Database Configuration
**File**: `lib/db.ts`
**Action**: Replace entire file content

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query', (e) => {
    if (e.duration > 500) {
      console.warn(`Slow query: ${e.duration}ms`, {
        query: e.query.substring(0, 100),
        params: e.params,
      })
    }
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### 1.2 Database Indexes
**File**: `prisma/migrations/20241109_add_indexes.sql`
**Action**: Create new migration file

```sql
-- Optimized indexes for CinemaRebel
CREATE INDEX CONCURRENTLY idx_list_user_type 
ON lists(user_id, type, created_at DESC);

CREATE INDEX CONCURRENTLY idx_list_item_list_media 
ON list_items(list_id, media_type, created_at DESC);

CREATE INDEX CONCURRENTLY idx_list_item_tmdb_media 
ON list_items(tmdb_id, media_type);

CREATE INDEX CONCURRENTLY idx_user_watchlist_items 
ON list_items(list_id, tmdb_id, created_at DESC) 
WHERE EXISTS (SELECT 1 FROM lists WHERE lists.id = list_items.list_id AND lists.type = 'watchlist');

CREATE INDEX CONCURRENTLY idx_active_lists 
ON lists(created_at DESC) 
WHERE created_at > CURRENT_DATE - INTERVAL '6 months';

ANALYZE lists;
ANALYZE list_items;
ANALYZE users;
```

**Apply**: `npx prisma db execute --file ./prisma/migrations/20241109_add_indexes.sql`

## Phase 2: Redis Caching Setup (Priority: High)

### 2.1 Cache Manager
**File**: `lib/cache/redis-cache.ts`
**Action**: Create new file

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface CacheOptions {
  ttl?: number
  tags?: string[]
}

export class CacheManager {
  private static instance: CacheManager
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const { ttl = 3600, tags = [] } = options

    try {
      const cached = await redis.get(key)
      if (cached) return JSON.parse(cached) as T
    } catch (error) {
      console.warn('Redis cache miss:', error)
    }

    const data = await fetcher()

    try {
      await redis.setex(key, ttl, JSON.stringify(data))
      if (tags.length > 0) {
        await Promise.all(tags.map(tag => redis.sadd(`tag:${tag}`, key)))
      }
    } catch (error) {
      console.warn('Cache set failed:', error)
    }

    return data
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.warn('Cache invalidation failed:', error)
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.warn('Pattern invalidation failed:', error)
    }
  }
}

export const cacheManager = CacheManager.getInstance()
```

### 2.2 List Cache Manager
**File**: `lib/list-cache.ts`
**Action**: Create new file

```typescript
import { cacheManager } from '@/lib/cache/redis-cache'
import { prisma } from '@/lib/db'
import type { List, ListItem, MediaType, ListType } from '@prisma/client'

export class ListCacheManager {
  static async getUserLists(userId: string, type?: ListType) {
    const cacheKey = `user:${userId}:lists${type ? `:${type}` : ''}`
    
    return cacheManager.get(cacheKey, async () => {
      return prisma.list.findMany({
        where: { userId, ...(type && { type }) },
        include: {
          _count: {
            select: { items: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }, {
      ttl: 1800,
      tags: [`user:${userId}`, 'lists']
    })
  }

  static async getListItems(listId: string, page = 1, limit = 20) {
    const cacheKey = `list:${listId}:items:${page}:${limit}`
    
    return cacheManager.get(cacheKey, async () => {
      const skip = (page - 1) * limit
      
      const [items, total] = await Promise.all([
        prisma.listItem.findMany({
          where: { listId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.listItem.count({ where: { listId } })
      ])

      return { items, total, page, limit }
    }, {
      ttl: 900,
      tags: [`list:${listId}`, 'list-items']
    })
  }

  static async addListItem(listId: string, tmdbId: number, mediaType: MediaType) {
    const item = await prisma.listItem.create({
      data: { listId, tmdbId, mediaType },
      include: { list: true }
    })

    await Promise.all([
      cacheManager.invalidateByTag(`list:${listId}`),
      cacheManager.invalidateByTag(`user:${item.list.userId}`),
    ])

    return item
  }

  static async removeListItem(listId: string, tmdbId: number, mediaType: MediaType) {
    const item = await prisma.listItem.deleteMany({
      where: { listId, tmdbId, mediaType }
    })

    if (item.count > 0) {
      const list = await prisma.list.findUnique({ where: { id: listId } })
      if (list) {
        await Promise.all([
          cacheManager.invalidateByTag(`list:${listId}`),
          cacheManager.invalidateByTag(`user:${list.userId}`),
        ])
      }
    }

    return item
  }
}
```

## Phase 3: TMDB Enhanced Client (Priority: High)

### 3.1 Enhanced TMDB Client
**File**: `lib/tmdb-enhanced.ts`
**Action**: Create new file

```typescript
import { cacheManager } from '@/lib/cache/redis-cache'
import { tmdb } from '@/lib/tmdb'
import logger from '@/lib/logger'

export class TMDBEnhanced {
  private static readonly CACHE_CONFIGS = {
    trending: { ttl: 1800, tags: ['trending'] },
    movieDetails: { ttl: 3600, tags: ['movies'] },
    tvDetails: { ttl: 3600, tags: ['tv'] },
    search: { ttl: 900, tags: ['search'] },
    discover: { ttl: 1800, tags: ['discover'] },
  }

  static async getTrending(mediaType = 'movie', timeWindow = 'week') {
    const cacheKey = `tmdb:trending:${mediaType}:${timeWindow}`
    
    return cacheManager.get(cacheKey, async () => {
      const result = await tmdb.getTrending(mediaType as any, timeWindow)
      
      result.results.forEach(item => {
        const itemKey = `tmdb:item:${item.media_type}:${item.id}`
        cacheManager.get(itemKey, async () => item, {
          ttl: 3600,
          tags: [`${item.media_type}s`, 'items']
        })
      })
      
      return result
    }, this.CACHE_CONFIGS.trending)
  }

  static async getMovieDetails(id: string | number, options?: { append_to_response?: string }) {
    const cacheKey = `tmdb:movie:${id}:${options?.append_to_response || 'basic'}`
    
    return cacheManager.get(cacheKey, async () => {
      return tmdb.getMovieDetails(id, options)
    }, this.CACHE_CONFIGS.movieDetails)
  }

  static async getTVDetails(id: string | number, options?: { append_to_response?: string }) {
    const cacheKey = `tmdb:tv:${id}:${options?.append_to_response || 'basic'}`
    
    return cacheManager.get(cacheKey, async () => {
      return tmdb.getTVDetails(id, options)
    }, this.CACHE_CONFIGS.tvDetails)
  }

  static async searchMulti(query: string, page = 1) {
    const cacheKey = `tmdb:search:${encodeURIComponent(query)}:${page}`
    
    return cacheManager.get(cacheKey, async () => {
      const result = await tmdb.searchMulti(query, page)
      logger.info('TMDB search completed', { query, page, resultCount: result.results.length })
      return result
    }, this.CACHE_CONFIGS.search)
  }

  static async getBatchDetails(items: Array<{ id: number; media_type: string }>) {
    const promises = items.map(item => {
      if (item.media_type === 'movie') return this.getMovieDetails(item.id)
      if (item.media_type === 'tv') return this.getTVDetails(item.id)
      return Promise.resolve(null)
    })
    return Promise.all(promises)
  }
}

export const tmdbEnhanced = TMDBEnhanced
```

## Phase 4: Next.js Configuration (Priority: Medium)

### 4.1 Optimized Next.js Config
**File**: `next.config.mjs`
**Action**: Replace entire file

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [92, 154, 185, 342, 500, 780],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    turbo: {},
    typedRoutes: true,
    serverActions: { bodySizeLimit: '2mb' },
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=600' },
        ],
      },
    ]
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          tmdb: {
            test: /[\/]lib[\/]tmdb/,
            name: 'tmdb',
            chunks: 'all',
          },
          components: {
            test: /[\/]components[\/]/,
            name: 'components',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },

  compress: true,
  poweredByHeader: false,
}

export default nextConfig
```

## Phase 5: Rate Limiting (Priority: Medium)

### 5.1 Rate Limiting Utility
**File**: `lib/rate-limit.ts`
**Action**: Create new file

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: Request) => string
}

export class RateLimiter {
  static async check(
    request: Request,
    config: RateLimitConfig
  ): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : `rate-limit:${this.getClientIP(request)}`

    const window = Math.floor(Date.now() / config.windowMs) * config.windowMs
    const windowKey = `${key}:${window}`

    try {
      const current = await redis.incr(windowKey)
      
      if (current === 1) {
        await redis.expire(windowKey, Math.ceil(config.windowMs / 1000))
      }

      const success = current <= config.maxRequests
      const remaining = Math.max(0, config.maxRequests - current)
      const resetTime = window + config.windowMs

      return { success, limit: config.maxRequests, remaining, resetTime }
    } catch (error) {
      console.warn('Rate limiting error:', error)
      return { success: true, limit: config.maxRequests, remaining: config.maxRequests, resetTime: Date.now() + config.windowMs }
    }
  }

  private static getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) return forwarded.split(',')[0].trim()
    if (realIP) return realIP
    return 'unknown'
  }
}

export const RATE_LIMITS = {
  search: { windowMs: 60000, maxRequests: 30 },
  lists: { windowMs: 60000, maxRequests: 100 },
  tmdb: { windowMs: 60000, maxRequests: 40 },
}
```

## Phase 6: Monitoring Setup (Priority: Low)

### 6.1 Performance Monitoring
**File**: `lib/analytics/performance.ts`
**Action**: Create new file

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export class PerformanceMonitor {
  static init() {
    if (typeof window === 'undefined') return

    const sendToAnalytics = (metric: any) => {
      console.log('Performance metric:', metric)
      
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.value),
        })
      }
    }

    getCLS(sendToAnalytics)
    getFID(sendToAnalytics)
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)
  }

  static measurePageLoad(pageName: string) {
    if (typeof window === 'undefined') return

    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      console.log(`Page load time for ${pageName}: ${loadTime.toFixed(2)}ms`)
      
      if (loadTime > 2000) {
        console.warn(`Slow page load detected: ${pageName} took ${loadTime.toFixed(2)}ms`)
      }
    }
  }
}
```

## Environment Variables

Add to `.env.local`:
```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Optional: Sentry
SENTRY_DSN=your-sentry-dsn

# Optional: Bundle Analysis
ANALYZE=true
```

## Package Dependencies

**Install required packages:**
```bash
npm install @upstash/redis web-vitals
npm install --save-dev @next/bundle-analyzer webpack-bundle-analyzer
```

## Implementation Checklist

### ✅ Database Phase
- [ ] Replace `lib/db.ts` with enhanced version
- [ ] Run database migration for indexes
- [ ] Verify slow query logging works

### ✅ Caching Phase
- [ ] Create `lib/cache/redis-cache.ts`
- [ ] Create `lib/list-cache.ts`
- [ ] Test cache invalidation on list updates

### ✅ TMDB Phase
- [ ] Create `lib/tmdb-enhanced.ts`
- [ ] Replace all TMDB calls with enhanced version
- [ ] Verify cache hit rates

### ✅ Next.js Phase
- [ ] Replace `next.config.mjs` with optimized version
- [ ] Test bundle splitting
- [ ] Verify image optimization

### ✅ Rate Limiting Phase
- [ ] Create `lib/rate-limit.ts`
- [ ] Add rate limiting to API routes
- [ ] Test rate limiting functionality

### ✅ Monitoring Phase
- [ ] Create `lib/analytics/performance.ts`
- [ ] Add performance monitoring to layout
- [ ] Set up error tracking

## Testing Commands

### Database Performance
```bash
# Check indexes
npx prisma db execute --file ./prisma/migrations/20241109_add_indexes.sql

# Verify slow query logging
npm run dev
# Check console for slow query warnings
```

### Cache Testing
```bash
# Test Redis connection
node -e "require('./lib/cache/redis-cache').cacheManager.get('test', () => Promise.resolve('ok'), {ttl: 60}).then(console.log)"

# Test cache invalidation
node -e "require('./lib/cache/redis-cache').cacheManager.invalidateByTag('test').then(console.log)"
```

### Performance Testing
```bash
# Bundle analysis
npm run build
npm run analyze

# Lighthouse audit
npm run lighthouse
```

## Rollback Procedures

### Database Rollback
```sql
-- Drop indexes if needed
DROP INDEX CONCURRENTLY IF EXISTS idx_list_user_type;
DROP INDEX CONCURRENTLY IF EXISTS idx_list_item_list_media;
DROP INDEX CONCURRENTLY IF EXISTS idx_list_item_tmdb_media;
DROP INDEX CONCURRENTLY IF EXISTS idx_user_watchlist_items;
DROP INDEX CONCURRENTLY IF EXISTS idx_active_lists;
```

### Cache Rollback
```typescript
// Revert to original tmdb.ts
import { tmdb } from '@/lib/tmdb' // instead of tmdbEnhanced
```

### Configuration Rollback
```javascript
// Revert next.config.mjs to original
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    turbo: {},
    typedRoutes: true,
    serverActions: { bodySizeLimit: '2mb' }
  },
}
```

## Success Metrics

### Performance Targets
- **Database Queries**: < 50ms p95
- **API Response**: < 200ms p95
- **Page Load**: < 2s for list pages
- **Cache Hit Rate**: > 85% for TMDB data
- **API Cost Reduction**: 60% fewer TMDB calls

### Monitoring Commands
```bash
# Check Redis memory usage
redis-cli info memory

# Check database performance
npx prisma db execute --file check_performance.sql

# Check bundle size
npm run build && du -sh .next/
```

## Next Steps
1. **Phase 1**: Implement database optimizations first (low risk, high impact)
2. **Phase 2**: Add Redis caching (requires external service)
3. **Phase 3**: Upgrade TMDB client (can be feature-flagged)
4. **Phase 4**: Optimize Next.js config (requires testing)
5. **Phase 5**: Add rate limiting (requires monitoring)
6. **Phase 6**: Implement monitoring (low priority)

## AI Agent Notes
- All file paths are absolute from project root
- Each phase can be implemented independently
- Environment variables must be set before deployment
- Testing commands provided for validation
- Rollback procedures ensure safe deployment
