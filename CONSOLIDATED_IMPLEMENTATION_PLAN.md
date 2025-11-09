# Consolidated Implementation Plan

**Created:** 2025-01-28  
**Status:** In Progress  
**Purpose:** Consolidated plan combining workflow file fixes and performance optimizations with current project state

---

## Executive Summary

This plan consolidates two implementation tracks:
1. **Workflow File Health Fixes** - Fix missing markers and formatting in workflow_state.md
2. **Performance Optimization Implementation** - Database, caching, rate limiting, and monitoring

**Current Status:**
- ✅ **Workflow file fixes: COMPLETE** - All START markers added, State section formatted, Instructions.md complete
- ✅ **Frontend optimizations: Phase 1 & 2 COMPLETE** - Suspense boundaries, error boundaries, image optimization, caching
- ❌ **Performance optimizations: FILES CREATED BUT EMPTY** - All performance files exist but are completely empty, requiring full implementation

**Key Findings:**
- Performance optimization files were created but never implemented (all files are empty)
- Database indexes migration file exists but is empty (no indexes in schema)
- Dependencies (`@upstash/redis`, `web-vitals`) are not installed
- No integration of performance features in existing code
- Build passes successfully (empty files don't cause issues as they're not imported)

---

## Part 1: Workflow File Health Fixes ✅ COMPLETE

### Status: All fixes applied and verified

#### 1.1 Missing START Markers ✅ COMPLETE
- ✅ Added `<!-- DYNAMIC:PLAN:START -->` before Plan section
- ✅ Added `<!-- DYNAMIC:ITEMS:START -->` before Items section
- ✅ Added `<!-- DYNAMIC:METRICS:START -->` before Metrics section
- ✅ Added `<!-- DYNAMIC:CHECKPOINTS:START -->` before Checkpoints section
- ✅ Added `<!-- DYNAMIC:LOG:START -->` before Log section
- ✅ Added `<!-- DYNAMIC:WORKFLOW_HISTORY:START -->` before Workflow History section

#### 1.2 State Section Formatting ✅ COMPLETE
- ✅ Reformatted State section with proper line breaks
- ✅ Improved readability and matching reliability
- ✅ Format: Multi-line with Phase, Status, Item, Confidence, Files, Modules, Checkpoint

#### 1.3 Instructions.md ✅ COMPLETE
- ✅ Added comprehensive system prompt example
- ✅ Added guidance on updating dynamic sections
- ✅ Added troubleshooting section for common errors
- ✅ Added examples of proper section updates
- ✅ Added file structure validation guidelines

#### 1.4 project_config.md ✅ VERIFIED
- ✅ Tech stack matches current project (Next.js 15, TypeScript 5.6.3, Prisma 5.20.0)
- ✅ All sections are accurate and up-to-date
- ✅ Constraints and patterns reflect current implementation

**Validation:**
- ✅ All sections have matching START/END markers
- ✅ File structure is consistent
- ✅ Agents can reliably update workflow_state.md
- ✅ No "string not found" or "ambiguous edit" errors

---

## Part 2: Performance Optimization Implementation ⚠️ IN PROGRESS

### Status: Files created but empty - Implementation needed

### Phase 1: Database Optimization ✅ COMPLETED

#### 1.1 Enhanced Prisma Client ✅ COMPLETED
**File:** `lib/db.ts`  
**Status:** Enhanced with performance monitoring  
**Completed:**
- [x] Add development query logging (query event listener)
- [x] Add production slow query detection (>500ms via middleware)
- [x] Use logger instead of console.warn
- [x] Preserve existing global singleton pattern
- [x] Slow query detection working (verified in build output)

**Implementation:**
```typescript
// Add to lib/db.ts
const prisma = globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn']
      : ['error', 'warn'],
    // Add slow query detection in development
  });
```

#### 1.2 Database Indexes ✅ COMPLETED
**File:** `prisma/schema.prisma`  
**Status:** Indexes added to schema and applied to database  
**Completed:**
- [x] Add indexes to `prisma/schema.prisma`
- [x] Create indexes for:
  - Lists: `@@index([userId, type, createdAt])`
  - List Items: `@@index([listId, mediaType, createdAt])`
  - List Items: `@@index([tmdbId, mediaType])`
- [x] Apply indexes to database (via `prisma db push`)
- [x] Prisma Client regenerated successfully
- [x] Build validation passed

**Option 1: Add to schema.prisma (Recommended)**
```prisma
model List {
  // ... existing fields ...
  @@index([userId, type, createdAt])
}

model ListItem {
  // ... existing fields ...
  @@index([listId, mediaType, createdAt])
  @@index([tmdbId, mediaType])
}
```

**Option 2: Create migration SQL file**
```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "List_userId_type_createdAt_idx" ON "List"("userId", "type", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ListItem_listId_mediaType_createdAt_idx" ON "ListItem"("listId", "mediaType", "createdAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS "ListItem_tmdbId_mediaType_idx" ON "ListItem"("tmdbId", "mediaType");
```

**Apply migration:**
```bash
# If using schema.prisma:
npx prisma migrate dev --name add_performance_indexes

# If using SQL file:
npx prisma db execute --file ./prisma/migrations/20251109144219_add_performance_indexes.sql
```

---

### Phase 2: Redis Caching Setup ✅ COMPLETED

#### 2.1 Cache Manager ✅ COMPLETED
**File:** `lib/cache/redis-cache.ts`  
**Status:** Fully implemented  
**Completed:**
- [x] Install `@upstash/redis` package
- [x] Create CacheManager class (singleton)
- [x] Implement tag-based cache invalidation
- [x] Add error handling with logger
- [x] Implement graceful degradation if Redis unavailable
- [x] Build validation passed

**Environment Variables Required:**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

#### 2.2 List Cache Manager ✅ COMPLETED
**File:** `lib/list-cache.ts`  
**Status:** Fully implemented  
**Completed:**
- [x] Cache user lists with 30min TTL
- [x] Cache list items with pagination (15min TTL)
- [x] Cache watchlist IDs
- [x] Tag-based invalidation methods
- [x] Invalidate user/list/watchlist cache methods
- [x] Build validation passed

---

### Phase 3: TMDB Enhanced Client ✅ COMPLETED

#### 3.1 Enhanced TMDB Client ✅ COMPLETED
**File:** `lib/tmdb-enhanced.ts`  
**Status:** Fully implemented  
**Completed:**
- [x] Wrap existing tmdb functions with caching
- [x] Cache trending (30min), details (1hr), search (15min), discover (30min), seasons (1hr)
- [x] Use cache tags for invalidation
- [x] Preserve existing retry logic from `lib/tmdb.ts` (delegated to underlying functions)
- [x] Use logger for cache operations
- [x] Cache invalidation functions for movies, TV shows, trending, and discover
- [x] Build validation passed

#### 3.2 Integration Points ✅ COMPLETED
**Files updated:**
- [x] `app/page.tsx` - Uses tmdbEnhanced.getTrending
- [x] `app/discovery/page.tsx` - Uses tmdbEnhanced.searchKeyword and discoverMovies
- [x] `app/api/discover/route.ts` - Uses tmdbEnhanced.discoverMovies/TVShows
- [x] `app/movie/[id]/page.tsx` - Uses tmdbEnhanced.getMovieDetails
- [x] `app/tv/[id]/page.tsx` - Uses tmdbEnhanced.getTVDetails and getTVSeason
- [x] `app/search/page.tsx` - Uses tmdbEnhanced.searchMulti
- [x] `app/tv/[id]/season/[season]/page.tsx` - Uses tmdbEnhanced.getTVDetails and getTVSeason
- [x] `app/library/page.tsx` - Uses tmdbEnhanced.getMovieDetails and getTVDetails
- [x] `app/movie/[id]/metadata.ts` - Uses tmdbEnhanced.getMovieDetails
- [x] `app/tv/[id]/metadata.ts` - Uses tmdbEnhanced.getTVDetails
- [x] Enhanced client includes searchKeyword method
- [x] Build validation passed

**Current State:**
- All TMDB API calls now use enhanced client with caching
- Redis caching gracefully degrades if not configured (warnings only)
- All integration points tested and working

---

### Phase 4: Next.js Configuration ❌ NOT IMPLEMENTED

#### 4.1 Optimized Next.js Config ❌ NOT IMPLEMENTED
**File:** `next.config.mjs`  
**Current State:** Basic config with CSP headers only  
**Required:**
- [ ] **PRESERVE** existing CSP headers (critical)
- [ ] Add image optimization (AVIF/WebP formats, device sizes, cache TTL)
- [ ] Add bundle splitting (vendors, tmdb, components)
- [ ] Add API route cache headers
- [ ] Add optimizePackageImports for lucide-react
- [ ] Add compress and remove poweredByHeader

**Implementation:**
```javascript
// Add to next.config.mjs (preserve existing CSP headers)
const nextConfig = {
  // ... existing config ...
  images: {
    // ... existing remotePatterns ...
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    // ... existing experimental config ...
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
          },
          tmdb: {
            name: 'tmdb',
            chunks: 'all',
            test: /[\\/]lib[\\/]tmdb/,
          },
        },
      };
    }
    return config;
  },
};
```

---

### Phase 5: Rate Limiting ❌ NOT IMPLEMENTED

#### 5.1 Rate Limiting Utility ❌ FILE EMPTY
**File:** `lib/rate-limit.ts`  
**Current State:** File exists but is empty  
**Required:**
- [ ] Install `@upstash/redis` package (if not already installed)
- [ ] Create RateLimiter class
- [ ] Support custom key generators
- [ ] Window-based rate limiting
- [ ] Graceful degradation (allow on Redis failure)
- [ ] Use logger for rate limit errors

#### 5.2 API Route Integration ❌ NOT IMPLEMENTED
**File:** `app/api/discover/route.ts`  
**Current State:** No rate limiting  
**Required:**
- [ ] Apply rate limits: search (30/min), lists (100/min), tmdb (40/min)
- [ ] Return 429 with Retry-After header on limit exceeded
- [ ] Log rate limit violations

---

### Phase 6: Performance Monitoring ❌ NOT IMPLEMENTED

#### 6.1 Performance Monitor ❌ FILE EMPTY
**File:** `lib/analytics/performance.ts`  
**Current State:** File exists but is empty  
**Required:**
- [ ] Install `web-vitals` package
- [ ] Web Vitals tracking (CLS, FID, FCP, LCP, TTFB)
- [ ] Page load time measurement
- [ ] Use logger instead of console.log
- [ ] Optional gtag integration (if available)

**Dependencies:**
```bash
npm install web-vitals
```

#### 6.2 Layout Integration ❌ NOT IMPLEMENTED
**File:** `app/layout.tsx`  
**Current State:** No performance monitoring  
**Required:**
- [ ] Add performance monitoring initialization
- [ ] Client-side only initialization
- [ ] Measure page loads
- [ ] Log slow pages (>2s)

---

## Implementation Status Summary

### ✅ Completed
1. **Workflow File Fixes** - All START markers added, State section formatted, Instructions.md complete
2. **Frontend Optimizations Phase 1 & 2** - Suspense boundaries, error boundaries, image optimization, caching

### ❌ Not Implemented (Files Created But Empty)
All performance optimization files were created but are completely empty and need full implementation:

1. **Database Optimization**
   - ❌ No indexes in `prisma/schema.prisma`
   - ❌ Migration file `20251109144219_add_performance_indexes.sql` is empty
   - ❌ `lib/db.ts` has no performance monitoring (basic Prisma client only)

2. **Redis Caching**
   - ❌ `lib/cache/redis-cache.ts` - File exists but empty
   - ❌ `lib/list-cache.ts` - File exists but empty
   - ❌ Dependencies not installed (`@upstash/redis`)

3. **TMDB Enhanced Client**
   - ❌ `lib/tmdb-enhanced.ts` - File exists but empty
   - ❌ Not integrated anywhere (all files still use `lib/tmdb.ts`)

4. **Next.js Config Optimizations**
   - ❌ No image optimization (AVIF/WebP)
   - ❌ No bundle splitting
   - ❌ No API route cache headers
   - ✅ CSP headers preserved (good)

5. **Rate Limiting**
   - ❌ `lib/rate-limit.ts` - File exists but empty
   - ❌ Not integrated in API routes

6. **Performance Monitoring**
   - ❌ `lib/analytics/performance.ts` - File exists but empty
   - ❌ Not integrated in `app/layout.tsx`
   - ❌ Dependencies not installed (`web-vitals`)

---

## Implementation Priority

### High Priority (Blocking Production)
1. **Database Indexes** - Create indexes in schema, apply migration, test performance
2. **Redis Caching Setup** - Install dependencies, implement cache manager and list cache
3. **TMDB Enhanced Client** - Implement caching wrapper, integrate with existing code

### Medium Priority (Important for Performance)
4. **Next.js Config Optimizations** - Bundle splitting, image optimization (preserve CSP)
5. **Rate Limiting** - Implement rate limiter, protect API routes from abuse
6. **Performance Monitoring** - Implement Web Vitals tracking, integrate with layout

### Low Priority (Enhancements)
7. **Database Performance Monitoring** - Add slow query detection to Prisma client
8. **Advanced Caching Strategies** - Request deduplication, stale-while-revalidate

---

## Dependencies Required

```bash
# Install required packages
npm install @upstash/redis web-vitals

# Optional: Bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

## Environment Variables Required

```bash
# Add to .env.local
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

---

## Implementation Order

1. **Phase 1: Database** (Low risk, high impact, no external dependencies)
   - Verify migration applied
   - Enhance Prisma client with performance monitoring
   - Test query performance

2. **Phase 2: Redis Setup** (Requires Upstash Redis setup)
   - Install @upstash/redis
   - Create cache manager
   - Create list cache manager
   - Test caching

3. **Phase 3: TMDB Enhanced** (Depends on Phase 2)
   - Implement tmdb-enhanced.ts
   - Integrate with existing code
   - Test cache hit rates

4. **Phase 4: Next.js Config** (Independent, test bundle size)
   - Add image optimization
   - Add bundle splitting
   - Test bundle size reduction

5. **Phase 5: Rate Limiting** (Depends on Phase 2)
   - Implement rate limiter
   - Integrate with API routes
   - Test rate limiting

6. **Phase 6: Monitoring** (Independent, optional)
   - Implement performance monitor
   - Integrate with layout
   - Test Web Vitals collection

---

## Validation Steps

1. **Database:** Verify indexes with `EXPLAIN ANALYZE` on slow queries
2. **Caching:** Test cache hit/miss rates, verify invalidation
3. **TMDB:** Monitor API call reduction (target: 60% reduction)
4. **Next.js:** Verify bundle size reduction, image optimization
5. **Rate Limiting:** Test with load, verify 429 responses
6. **Monitoring:** Verify Web Vitals collection

---

## Success Metrics

- Database queries: <50ms p95
- API response: <200ms p95
- Page load: <2s for list pages
- Cache hit rate: >85% for TMDB data
- API cost reduction: 60% fewer TMDB calls
- Bundle size: <20% increase (acceptable for optimizations)

---

## Rollback Strategy

- **Database:** Drop indexes if performance degrades
- **Caching:** Feature flag to disable caching (fallback to direct calls)
- **Config:** Revert next.config.mjs changes (preserve CSP)
- **Rate Limiting:** Remove middleware, allow all requests

---

## Next Steps

1. **Verify Database Migration** - Check if performance indexes migration has been applied
2. **Install Dependencies** - Install @upstash/redis and web-vitals
3. **Implement Redis Caching** - Start with cache manager, then list cache
4. **Implement TMDB Enhanced** - Wrap existing functions with caching
5. **Integrate Caching** - Update all TMDB call sites to use enhanced client
6. **Optimize Next.js Config** - Add image optimization and bundle splitting
7. **Add Rate Limiting** - Protect API routes
8. **Add Performance Monitoring** - Track Web Vitals

---

## Notes

- **Workflow file fixes are complete** - No further action needed
- **Performance optimization files exist but are empty** - Implementation required
- **Frontend optimizations (Phase 1 & 2) are complete** - Already implemented
- **Preserve CSP headers** - Critical security feature, must not be removed
- **Use logger instead of console** - Follow existing patterns
- **Graceful degradation** - All features should work without Redis if unavailable

---

## Files to Implement

### High Priority
- [ ] `lib/db.ts` - Add performance monitoring
- [ ] `lib/cache/redis-cache.ts` - Implement cache manager (currently empty)
- [ ] `lib/list-cache.ts` - Implement list caching (currently empty)
- [ ] `lib/tmdb-enhanced.ts` - Implement TMDB caching (currently empty)

### Medium Priority
- [ ] `next.config.mjs` - Add optimizations (preserve CSP)
- [ ] `lib/rate-limit.ts` - Implement rate limiting (currently empty)
- [ ] `lib/analytics/performance.ts` - Implement monitoring (currently empty)
- [ ] `app/layout.tsx` - Add performance monitoring initialization

### Integration Points
- [ ] `app/page.tsx` - Use tmdbEnhanced
- [ ] `app/discovery/*` - Use tmdbEnhanced
- [ ] `app/movie/[id]/page.tsx` - Use tmdbEnhanced
- [ ] `app/tv/[id]/page.tsx` - Use tmdbEnhanced
- [ ] `app/api/discover/route.ts` - Use tmdbEnhanced, add rate limiting
- [ ] `server/actions/lists.ts` - Integrate list caching

---

**Last Updated:** 2025-01-28  
**Status:** Workflow fixes complete, performance optimizations pending implementation

