# Vercel Setup Guide

**Project:** CinemaRebel  
**Project ID:** `prj_ZkIVRUXzPhiBwyoJ11Sso37LlFUI`  
**Team:** Peter Alexander Pedersen 's projects  
**Status:** Active

---

## Project Details

- **Name:** cinemarebel
- **Framework:** Next.js
- **Node Version:** 22.x
- **Latest Deployment:** Ready
- **URLs:**
  - Production: https://cinemarebel.vercel.app
  - Preview: https://cinemarebel-peter-alexander-pedersen-s-projects.vercel.app
  - Main Branch: https://cinemarebel-git-main-peter-alexander-pedersen-s-projects.vercel.app

---

## Environment Variables Setup

### Required Environment Variables

The following environment variables need to be configured in Vercel:

#### 1. Database
- `DATABASE_URL` - PostgreSQL connection string (Required)

#### 2. TMDB API
- `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API v3 key (Required)
- `TMDB_READ_ACCESS_TOKEN` - TMDB API v4 access token (Optional but recommended)
- `NEXT_PUBLIC_TMDB_BASE_URL` - TMDB API base URL (Optional, defaults to https://api.themoviedb.org/3)
- `NEXT_PUBLIC_TMDB_V4_BASE_URL` - TMDB API v4 base URL (Optional, defaults to https://api.themoviedb.org/4)

#### 3. Redis (Upstash) - **NEW**
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL (Optional but recommended)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token (Optional but recommended)

#### 4. NextAuth (Future)
- `NEXTAUTH_SECRET` - Secret for NextAuth (Optional, for future authentication)
- `NEXTAUTH_URL` - Base URL for NextAuth (Optional, for future authentication)

---

## How to Configure Environment Variables

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Navigate to: https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel
   - Or: https://vercel.com/dashboard → Select "cinemarebel" project

2. **Open Settings:**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add Environment Variables:**
   - Click "Add New" button
   - Enter the variable name (e.g., `UPSTASH_REDIS_REST_URL`)
   - Enter the variable value (e.g., `https://expert-ghost-17567.upstash.io`)
   - Select environments: Production, Preview, Development (or all)
   - Click "Save"

4. **Repeat for each variable:**
   - Add all required environment variables
   - Make sure to select the correct environments for each variable

### Option 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel link
   ```

4. **Add environment variables:**
   ```bash
   # Add Redis URL
   vercel env add UPSTASH_REDIS_REST_URL production preview development
   # Enter value when prompted: https://expert-ghost-17567.upstash.io

   # Add Redis Token
   vercel env add UPSTASH_REDIS_REST_TOKEN production preview development
   # Enter value when prompted: AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc
   ```

5. **Pull environment variables (for local testing):**
   ```bash
   vercel env pull .env.local
   ```

---

## Redis Configuration for Vercel

### Current Redis Database (Development)

- **Database Name:** cinemarebel-dev
- **Database ID:** 22832761-2162-4446-a535-0d6084d43f3a
- **REST URL:** `https://expert-ghost-17567.upstash.io`
- **REST Token:** `AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc`
- **Console:** https://console.upstash.com/redis/22832761-2162-4446-a535-0d6084d43f3a

### Add to Vercel

**In Vercel Dashboard → Settings → Environment Variables:**

1. **UPSTASH_REDIS_REST_URL**
   - Value: `https://expert-ghost-17567.upstash.io`
   - Type: Plain text (or Secret for extra security)
   - Environments: Production, Preview, Development

2. **UPSTASH_REDIS_REST_TOKEN**
   - Value: `AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc`
   - Type: Secret (recommended)
   - Environments: Production, Preview, Development

### Production Database (Recommended)

For production, consider creating a separate Redis database:
- **Database Name:** cinemarebel-prod
- **Region:** Choose closest to your Vercel deployment region
- **Benefits:** Separate dev/prod data, better isolation

---

## Deployment

### Automatic Deployment

The project is connected to GitHub and deploys automatically on:
- Push to `main` branch → Production deployment
- Pull requests → Preview deployments

### Manual Deployment

1. **Using Vercel CLI:**
   ```bash
   vercel --prod
   ```

2. **Using Vercel Dashboard:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or trigger new deployment from GitHub

### After Adding Environment Variables

After adding environment variables, you need to redeploy:

1. **Automatic:** Push a new commit to trigger deployment
2. **Manual:** Click "Redeploy" in Vercel dashboard
3. **CLI:** Run `vercel --prod`

---

## Verification

### Check Environment Variables

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Verify all variables are present
   - Check environments (Production, Preview, Development)

2. **In Deployment Logs:**
   - Go to Deployments tab
   - Click on latest deployment
   - Check build logs for environment variable usage
   - Look for Redis initialization messages

### Test Redis Connection

After deployment, check server logs for:
```
[INFO] [CacheManager] Redis cache initialized
[INFO] [RateLimiter] Rate limiter Redis client initialized
```

If you see warnings instead:
```
[WARN] [CacheManager] Redis cache not configured
```
This means environment variables are not set or not loaded.

### Test Functionality

1. **Test Caching:**
   - Visit: https://cinemarebel.vercel.app/api/discover?type=movie
   - Make the same request twice
   - Second request should be faster (cached)

2. **Test Rate Limiting:**
   - Make 41+ requests to `/api/discover` in under 1 minute
   - Should get 429 response after 40 requests

3. **Check Performance:**
   - Open browser console
   - Navigate between pages
   - Look for Web Vitals logs

---

## Current Deployment Status

- **Latest Deployment:** Ready ✅
- **Deployment ID:** `dpl_CUFxsPJWgb3FPWAVHrYTcL1JpW77`
- **URL:** https://cinemarebel.vercel.app
- **State:** READY
- **Framework:** Next.js
- **Regions:** iad1 (US East)

---

## Troubleshooting

### Environment Variables Not Loading

**Problem:** Environment variables are not available in deployment

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Check environments (Production, Preview, Development)
3. Redeploy after adding variables
4. Check variable names match exactly (case-sensitive)
5. Verify variable values are correct

### Redis Not Working in Production

**Problem:** Redis cache not initialized in production

**Solutions:**
1. Check environment variables are set in Vercel
2. Verify Redis database is active in Upstash console
3. Check deployment logs for Redis errors
4. Verify REST URL and token are correct
5. Check network connectivity from Vercel to Upstash

### Build Failures

**Problem:** Build fails on Vercel

**Solutions:**
1. Check build logs for specific errors
2. Verify all required environment variables are set
3. Check Node.js version (currently 22.x)
4. Verify package.json scripts are correct
5. Check for missing dependencies

### Deployment Errors

**Problem:** Deployment fails or errors

**Solutions:**
1. Check deployment logs
2. Verify GitHub connection is working
3. Check for build errors
4. Verify environment variables
5. Check for missing files or configurations

---

## Best Practices

### Environment Variable Security

1. **Use Secrets for Sensitive Data:**
   - Redis tokens → Use "Secret" type
   - API keys → Use "Secret" type
   - Database URLs → Use "Secret" type

2. **Separate Dev/Prod:**
   - Use different Redis databases for dev/prod
   - Use different API keys if possible
   - Keep production credentials secure

3. **Limit Access:**
   - Only add variables to necessary environments
   - Don't expose sensitive data in logs
   - Rotate secrets periodically

### Deployment Strategy

1. **Use Preview Deployments:**
   - Test changes in preview before production
   - Verify environment variables work
   - Test functionality before merging

2. **Monitor Deployments:**
   - Check deployment logs regularly
   - Monitor for errors or warnings
   - Set up alerts for failed deployments

3. **Version Control:**
   - Keep environment variables documented
   - Use `.env.example` for reference
   - Don't commit `.env.local` to git

---

## Next Steps

1. **Add Environment Variables:**
   - Add Redis credentials to Vercel
   - Verify all required variables are set
   - Check variable types and environments

2. **Redeploy:**
   - Trigger new deployment after adding variables
   - Check deployment logs for Redis initialization
   - Verify deployment is successful

3. **Test:**
   - Test caching functionality
   - Test rate limiting
   - Verify performance monitoring
   - Check all features work correctly

4. **Monitor:**
   - Monitor Redis usage in Upstash console
   - Check deployment logs regularly
   - Monitor performance metrics
   - Set up alerts for issues

---

## Resources

- **Vercel Dashboard:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel
- **Project Settings:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings
- **Environment Variables:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings/environment-variables
- **Deployments:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/deployments
- **Redis Setup:** [docs/REDIS_SETUP_COMPLETE.md](REDIS_SETUP_COMPLETE.md)
- **Testing Guide:** [docs/TESTING_OPTIMIZATIONS.md](TESTING_OPTIMIZATIONS.md)

---

## Quick Reference

### Environment Variables to Add

```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://expert-ghost-17567.upstash.io
UPSTASH_REDIS_REST_TOKEN=AUSfAAIncDIxYzA1NTAzNGY5NWU0NzQyODBkYjRhYmJiYTFmYmViNHAyMTc1Njc

# Database (if not already set)
DATABASE_URL=your-postgres-connection-string

# TMDB (if not already set)
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
TMDB_READ_ACCESS_TOKEN=your-tmdb-token
```

### Vercel CLI Commands

```bash
# Login
vercel login

# Link project
vercel link

# Add environment variable
vercel env add VARIABLE_NAME production preview development

# Pull environment variables
vercel env pull .env.local

# Deploy to production
vercel --prod
```

---

**Last Updated:** 2025-01-28  
**Status:** Active

