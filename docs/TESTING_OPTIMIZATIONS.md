# Testing Performance Optimizations

**Purpose:** Guide for testing rate limiting, caching, and performance monitoring  
**Status:** Active

---

## Quick Start

### Run All Tests
```bash
npm run test:optimizations
```

### Run Individual Tests
```bash
# Test rate limiting
npm run test:rate-limit

# Test caching
npm run test:caching

# View performance monitoring instructions
npm run test:performance
```

---

## Test Details

### 1. Rate Limiting Test

**Purpose:** Verify rate limiting is working correctly

**What it tests:**
- Rate limit enforcement (40 requests/minute)
- 429 responses when limit exceeded
- Rate limit headers (X-RateLimit-*)
- Retry-After header

**How to run:**
```bash
npm run test:rate-limit
# Or with custom URL:
node scripts/test-rate-limiting.js http://localhost:3000 40
```

**Expected results:**
- First 40 requests: 200 OK
- Requests 41+: 429 Too Many Requests
- Rate limit headers present in responses
- Retry-After header in 429 responses

**Troubleshooting:**
- If all requests succeed: Redis may not be configured (rate limiting allows all requests without Redis)
- If no rate limit headers: Check if rate limiting is enabled in API route
- If errors: Check server is running and endpoint is accessible

---

### 2. Caching Test

**Purpose:** Verify caching is working correctly

**What it tests:**
- Cache hit/miss behavior
- Response time improvement with caching
- Cache consistency

**How to run:**
```bash
npm run test:caching
# Or with custom URL/endpoint:
node scripts/test-caching.js http://localhost:3000 /api/discover?type=movie
```

**Expected results:**
- First request: Slower (cache miss)
- Second request: Faster (cache hit)
- Response times show improvement (50ms+ difference)
- Data size matches between requests

**Troubleshooting:**
- If no speed improvement: Redis may not be configured (no caching without Redis)
- If second request is slower: Cache may not be working or TTL expired
- If data differs: Cache may be serving stale data (check TTL settings)

---

### 3. Performance Monitoring Test

**Purpose:** Verify performance monitoring is working correctly

**What it tests:**
- Web Vitals tracking (CLS, INP, FCP, LCP, TTFB)
- Page load time measurement
- Slow page detection
- Browser console logs

**How to run:**
```bash
npm run test:performance
```

**Note:** This test provides instructions. Actual testing must be done in the browser.

**Steps:**
1. Start development server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Open DevTools (F12) → Console tab
4. Navigate between pages
5. Look for performance logs in console

**Expected results:**
- Web Vitals logs appear in console
- Page load time logs appear on navigation
- Slow pages (>2s) show warnings
- Web Vitals have ratings (good/needs-improvement/poor)

**Troubleshooting:**
- If no logs: Check PerformanceMonitorClient is in layout.tsx
- If logs don't appear: Check browser console is open and filtering is correct
- If metrics are missing: Check web-vitals package is installed

---

## Manual Testing

### Test Rate Limiting Manually

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Make requests:**
   ```bash
   # Using curl
   for i in {1..45}; do
     curl http://localhost:3000/api/discover?type=movie
     echo "Request $i"
   done
   ```

3. **Check responses:**
   - First 40 requests: 200 OK
   - Requests 41+: 429 Too Many Requests
   - Check headers for rate limit information

### Test Caching Manually

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Make first request:**
   ```bash
   curl http://localhost:3000/api/discover?type=movie
   ```
   Note the response time

3. **Make second request (same endpoint):**
   ```bash
   curl http://localhost:3000/api/discover?type=movie
   ```
   Should be faster (cached)

4. **Check Redis (if configured):**
   - Go to Upstash console
   - Check for cached keys
   - Verify TTL is set correctly

### Test Performance Monitoring Manually

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open browser DevTools:**
   - Press F12
   - Go to Console tab
   - Clear console

3. **Navigate to pages:**
   - Home page
   - Discovery page
   - Movie detail page
   - TV detail page

4. **Check console for logs:**
   - Web Vitals logs
   - Page load time logs
   - Slow page warnings

5. **Use Chrome DevTools Performance tab:**
   - Record page load
   - Analyze performance metrics
   - Compare with Web Vitals logs

---

## Test Results Interpretation

### Rate Limiting

**✅ Working correctly:**
- Requests 1-40: 200 OK
- Requests 41+: 429 Too Many Requests
- Rate limit headers present
- Retry-After header in 429 responses

**⚠️ Partially working:**
- All requests succeed (Redis not configured - graceful degradation)
- Rate limit headers missing (check API route configuration)

**❌ Not working:**
- Errors in responses
- No rate limiting at all
- Incorrect limit enforcement

### Caching

**✅ Working correctly:**
- Second request is 50ms+ faster
- Response times show clear improvement
- Data is consistent between requests
- Cache hit rate is high

**⚠️ Partially working:**
- Minimal speed improvement (Redis not configured or very fast responses)
- Cache works but TTL is too short

**❌ Not working:**
- No speed improvement
- Second request is slower
- Data differs between requests

### Performance Monitoring

**✅ Working correctly:**
- Web Vitals logs appear in console
- Page load time logs appear
- Slow page warnings appear for slow pages
- Metrics are accurate (compare with DevTools)

**⚠️ Partially working:**
- Some metrics missing
- Logs appear but metrics seem incorrect

**❌ Not working:**
- No logs in console
- PerformanceMonitorClient not loaded
- Errors in console

---

## Troubleshooting

### Rate Limiting Issues

**Problem:** Rate limiting not working

**Solutions:**
1. Check Redis is configured (see [Redis Setup Guide](REDIS_SETUP.md))
2. Verify rate limiting is enabled in API route
3. Check server logs for errors
4. Test without Redis (should allow all requests)

### Caching Issues

**Problem:** Caching not working

**Solutions:**
1. Check Redis is configured
2. Verify cache TTL is set correctly
3. Check cache keys are being generated
4. Look for cache errors in server logs
5. Test cache hit/miss rates

### Performance Monitoring Issues

**Problem:** Performance monitoring not working

**Solutions:**
1. Check PerformanceMonitorClient is in layout.tsx
2. Verify web-vitals package is installed
3. Check browser console for errors
4. Verify client-side only code is working
5. Check if browser supports Web Vitals API

---

## Advanced Testing

### Load Testing

**Test rate limiting under load:**
```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/discover?type=movie

# Using wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/discover?type=movie
```

### Cache Performance Testing

**Test cache hit rates:**
1. Make 100 requests to same endpoint
2. Check Redis for cache hits
3. Calculate cache hit rate
4. Verify cache TTL is working

### Performance Monitoring Testing

**Test with different conditions:**
1. Slow 3G network
2. CPU throttling
3. Different browsers
4. Different devices
5. Large pages (many items)

---

## CI/CD Integration

### Add Tests to CI/CD

```yaml
# Example GitHub Actions workflow
- name: Test Rate Limiting
  run: npm run test:rate-limit

- name: Test Caching
  run: npm run test:caching
```

### Monitor in Production

1. Set up monitoring for rate limiting
2. Track cache hit rates
3. Monitor Web Vitals in production
4. Set up alerts for performance issues

---

## Best Practices

1. **Test regularly:** Run tests after changes
2. **Monitor in production:** Track metrics over time
3. **Set up alerts:** Get notified of issues
4. **Document results:** Keep track of test results
5. **Update tests:** Keep tests up to date with changes

---

## Additional Resources

- [Redis Setup Guide](REDIS_SETUP.md)
- [Performance Monitoring Documentation](../lib/analytics/performance.ts)
- [Rate Limiting Documentation](../lib/rate-limit.ts)
- [Web Vitals Documentation](https://web.dev/vitals/)

---

**Last Updated:** 2025-01-28  
**Status:** Active

