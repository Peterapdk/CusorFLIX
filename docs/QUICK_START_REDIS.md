# Quick Start: Redis Setup

**Time:** 5-10 minutes  
**Difficulty:** Easy  
**Required:** Upstash account (free tier available)

---

## Step 1: Create Upstash Redis Database

1. Go to https://console.upstash.com/
2. Sign up or login
3. Click "Create Database"
4. Choose a name (e.g., "cinemarebel-dev")
5. Select a region (closest to you)
6. Click "Create"
7. Copy your credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Step 2: Configure Environment Variables

1. **Create/Edit `.env.local`:**
   ```bash
   cp example.env.local .env.local
   ```

2. **Add Redis credentials:**
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

3. **Restart development server:**
   ```bash
   npm run dev
   ```

---

## Step 3: Verify Setup

1. **Check server logs:**
   - Look for: `[INFO] [CacheManager] Redis cache initialized`
   - Or: `[WARN] [CacheManager] Redis cache not configured` (if not set up)

2. **Test caching:**
   ```bash
   npm run test:caching
   ```

3. **Test rate limiting:**
   ```bash
   npm run test:rate-limit
   ```

---

## That's It! 🎉

Redis is now configured and ready to use. Your app will now:
- ✅ Cache TMDB API responses (faster responses)
- ✅ Rate limit API requests (protect from abuse)
- ✅ Cache user lists (faster library page loads)

---

## Next Steps

- See [Redis Setup Guide](REDIS_SETUP.md) for detailed documentation
- See [Testing Optimizations](TESTING_OPTIMIZATIONS.md) for testing instructions
- Monitor Redis usage in Upstash console

---

## Troubleshooting

**Problem:** Redis not initializing

**Solution:** 
1. Check environment variables are set correctly
2. Verify `.env.local` file exists
3. Restart development server
4. Check variable names match exactly

**Problem:** Tests failing

**Solution:**
1. Make sure development server is running
2. Check Redis credentials are correct
3. Verify Redis database is active in Upstash console

---

**Last Updated:** 2025-01-28

