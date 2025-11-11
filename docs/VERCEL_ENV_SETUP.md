# Vercel Environment Variables Setup - Quick Guide

**Project:** CinemaRebel  
**Quick Setup:** Add Redis environment variables to Vercel

---

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard

Navigate to: https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings/environment-variables

Or:
1. Go to https://vercel.com/dashboard
2. Click on "cinemarebel" project
3. Click "Settings" tab
4. Click "Environment Variables" in left sidebar

### 2. Add Redis Environment Variables

#### Add UPSTASH_REDIS_REST_URL

1. Click "Add New" button
2. **Key:** `UPSTASH_REDIS_REST_URL`
3. **Value:** `https://expert-ghost-17567.upstash.io`
4. **Environment:** Select all (Production, Preview, Development)
5. **Type:** Plain text (or Secret)
6. Click "Save"

#### Add UPSTASH_REDIS_REST_TOKEN

1. Click "Add New" button
2. **Key:** `UPSTASH_REDIS_REST_TOKEN`
3. **Value:** `AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc`
4. **Environment:** Select all (Production, Preview, Development)
5. **Type:** Secret (recommended for security)
6. Click "Save"

### 3. Verify Variables Are Added

You should see both variables in the list:
- ✅ `UPSTASH_REDIS_REST_URL`
- ✅ `UPSTASH_REDIS_REST_TOKEN`

### 4. Redeploy Application

After adding environment variables, redeploy:

**Option A: Automatic (Recommended)**
- Push a commit to GitHub (triggers automatic deployment)
- Or create a dummy commit: `git commit --allow-empty -m "chore: trigger deployment"`

**Option B: Manual**
- Go to Deployments tab
- Click "Redeploy" on latest deployment
- Or click "Redeploy" button

**Option C: CLI**
```bash
vercel --prod
```

### 5. Verify Deployment

1. **Check Deployment Logs:**
   - Go to Deployments tab
   - Click on latest deployment
   - Look for: `[INFO] [CacheManager] Redis cache initialized`

2. **Test Functionality:**
   - Visit: https://cinemarebel.vercel.app
   - Test API endpoints
   - Check browser console for errors

---

## Environment Variables Checklist

### Required (Must Have)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API key

### Recommended (Should Have)
- [ ] `UPSTASH_REDIS_REST_URL` - Redis URL ⭐ **NEW**
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Redis token ⭐ **NEW**
- [ ] `TMDB_READ_ACCESS_TOKEN` - TMDB v4 token

### Optional (Future)
- [ ] `NEXTAUTH_SECRET` - For authentication
- [ ] `NEXTAUTH_URL` - For authentication

---

## Redis Credentials

**Development Database (cinemarebel-dev):**
- **REST URL:** `https://expert-ghost-17567.upstash.io`
- **REST Token:** `AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc`
- **Database ID:** `22832761-2162-4446-a535-0d6084d43f3a`
- **Console:** https://console.upstash.com/redis/22832761-2162-4446-a535-0d6084d43f3a

**Note:** For production, consider creating a separate database (`cinemarebel-prod`).

---

## Troubleshooting

### Variables Not Appearing

**Problem:** Environment variables not available in deployment

**Solution:**
1. Verify variables are saved in Vercel dashboard
2. Check environments (Production, Preview, Development) are selected
3. Redeploy after adding variables
4. Check variable names match exactly (case-sensitive)

### Redis Not Initializing

**Problem:** Logs show "Redis cache not configured"

**Solution:**
1. Verify environment variables are set in Vercel
2. Check variable values are correct
3. Redeploy after adding variables
4. Check deployment logs for errors

### Deployment Fails

**Problem:** Build fails or deployment errors

**Solution:**
1. Check build logs for specific errors
2. Verify all required environment variables are set
3. Check for missing dependencies
4. Verify Node.js version (22.x)

---

## Quick Links

- **Vercel Dashboard:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel
- **Environment Variables:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings/environment-variables
- **Deployments:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/deployments
- **Redis Console:** https://console.upstash.com/redis/22832761-2162-4446-a535-0d6084d43f3a

---

## Next Steps

1. ✅ Add Redis environment variables to Vercel
2. ✅ Redeploy application
3. ✅ Verify Redis initialization in logs
4. ✅ Test caching and rate limiting
5. ✅ Monitor Redis usage

---

**Last Updated:** 2025-01-28  
**Status:** Ready for Setup

