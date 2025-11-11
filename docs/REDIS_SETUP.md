# Redis Setup Guide

**Purpose:** Configure Redis for caching and rate limiting  
**Provider:** Upstash (serverless Redis)  
**Status:** Optional (features work without Redis, but with reduced functionality)

---

## Why Redis?

Redis is used for:
1. **Caching:** TMDB API responses to reduce API calls and improve performance
2. **Rate Limiting:** Protect API routes from abuse
3. **List Caching:** Cache user lists for faster loading

**Note:** All features work without Redis (graceful degradation), but you'll get:
- No caching (slower responses, more API calls)
- Rate limiting allows all requests (no protection)
- No list caching (slower library page loads)

---

## Setup Instructions

### 1. Create Upstash Redis Database

1. **Sign up/Login to Upstash:**
   - Go to https://console.upstash.com/
   - Sign up or login to your account

2. **Create a Redis Database:**
   - Click "Create Database"
   - Choose a name (e.g., "cinemarebel-dev" or "cinemarebel-prod")
   - Select a region (choose closest to your deployment)
   - Choose "Regional" or "Global" (Regional is cheaper, Global is faster)
   - Click "Create"

3. **Get Your Credentials:**
   - After creation, you'll see your database details
   - Copy the `UPSTASH_REDIS_REST_URL` (REST URL)
   - Copy the `UPSTASH_REDIS_REST_TOKEN` (REST Token)

### 2. Configure Environment Variables

#### Local Development

1. **Copy example.env.local to .env.local:**
   ```bash
   cp example.env.local .env.local
   ```

2. **Add Redis credentials to .env.local:**
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

#### Production (Vercel)

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add Environment Variables:**
   - `UPSTASH_REDIS_REST_URL` = `https://your-redis-url.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `your-redis-token`
   - Select environments (Production, Preview, Development)

3. **Redeploy:**
   - Changes take effect on next deployment
   - Or trigger a redeploy manually

### 3. Verify Redis Connection

1. **Check Server Logs:**
   - Start your development server
   - Look for: `[INFO] [CacheManager] Redis cache initialized`
   - Or: `[WARN] [CacheManager] Redis cache not configured` (if not set up)

2. **Test Caching:**
   - Make a request to `/api/discover?type=movie`
   - Make the same request again
   - Second request should be faster (cached)

3. **Test Rate Limiting:**
   - Make 41+ requests to `/api/discover` in under 1 minute
   - Should get 429 response after 40 requests

---

## Upstash Free Tier

Upstash offers a generous free tier:
- **10,000 commands per day**
- **256 MB storage**
- **Regional databases**

This is usually enough for development and small production deployments.

---

## Troubleshooting

### Redis Not Initializing

**Problem:** Logs show "Redis cache not configured"

**Solutions:**
1. Check environment variables are set correctly
2. Verify `.env.local` file exists and is in the project root
3. Restart development server after adding variables
4. Check variable names match exactly (no typos)

### Rate Limiting Not Working

**Problem:** Rate limiting allows all requests

**Solutions:**
1. Check Redis is configured (see above)
2. Verify rate limiting is enabled in API route
3. Check server logs for rate limiting errors
4. Test with Redis configured (should work without Redis, but allows all requests)

### Caching Not Working

**Problem:** Responses are not cached

**Solutions:**
1. Check Redis is configured
2. Verify cache TTL is set correctly
3. Check cache keys are being generated
4. Look for cache errors in server logs

---

## Monitoring

### Upstash Dashboard

1. **Go to Upstash Console:**
   - https://console.upstash.com/
   - Select your database

2. **View Metrics:**
   - Commands per day
   - Storage usage
   - Latency
   - Error rates

### Application Logs

Check server logs for:
- `[INFO] [CacheManager] Redis cache initialized`
- `[DEBUG] [CacheManager] Cache hit` / `Cache miss`
- `[WARN] [RateLimiter] Rate limit exceeded`
- `[ERROR] [CacheManager] Error setting cache`

---

## Best Practices

1. **Use Different Databases:**
   - Development: `cinemarebel-dev`
   - Production: `cinemarebel-prod`
   - Use environment variables to switch between them

2. **Monitor Usage:**
   - Check Upstash dashboard regularly
   - Set up alerts for high usage
   - Monitor cache hit rates

3. **Cache Strategy:**
   - TMDB data: 1 hour TTL (good balance)
   - User lists: 5 minutes TTL (fresher data)
   - Rate limits: Per-window (1 minute windows)

4. **Error Handling:**
   - All features work without Redis (graceful degradation)
   - Log errors but don't fail requests
   - Monitor Redis errors in production

---

## Cost Estimation

### Free Tier (Development)
- 10,000 commands/day
- 256 MB storage
- Usually enough for development

### Paid Tier (Production)
- $0.20 per 100K commands
- $0.10 per GB storage
- Very affordable for small-medium apps

**Example:** 1M commands/month = $2/month

---

## Additional Resources

- [Upstash Documentation](https://docs.upstash.com/)
- [Upstash Console](https://console.upstash.com/)
- [Redis Commands Reference](https://redis.io/commands/)
- [Upstash Pricing](https://upstash.com/pricing)

---

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify environment variables
3. Test Redis connection in Upstash console
4. Check Upstash documentation
5. Review application code for Redis usage

---

**Last Updated:** 2025-01-28  
**Status:** Active

