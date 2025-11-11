# CinemaRebel Setup Guide

**Date:** 2025-01-28  
**Project:** CinemaRebel  
**Status:** Configuration In Progress

---

## Current Status

### ✅ Configured
- `UPSTASH_REDIS_REST_URL` - Production, Preview, Development
- `UPSTASH_REDIS_REST_TOKEN` - Production, Preview (sensitive)

### ❌ Missing (Critical)
- `DATABASE_URL` - **REQUIRED** for Prisma database connection
- `NEXT_PUBLIC_TMDB_API_KEY` - **REQUIRED** for TMDB API calls
- `TMDB_READ_ACCESS_TOKEN` - Recommended for TMDB v4 API

---

## How to Add Missing Variables

### Option 1: Copy from CusorFLIX (Quick Fix)

**Step 1: Get Values from CusorFLIX**
```bash
# Link to CusorFLIX project
npx vercel link --yes --project=cusorflix --scope=team_834Dra8BzpHNrIWqdx57WTnR

# Pull environment variables
npx vercel env pull .env.cusorflix

# View the file (values will be visible)
cat .env.cusorflix
```

**Step 2: Add to CinemaRebel**
```bash
# Link to CinemaRebel project
npx vercel link --yes --project=cinemarebel --scope=team_834Dra8BzpHNrIWqdx57WTnR

# Add DATABASE_URL (copy value from .env.cusorflix)
npx vercel env add DATABASE_URL production preview development
# Paste the DATABASE_URL value when prompted

# Add TMDB API key
npx vercel env add NEXT_PUBLIC_TMDB_API_KEY production preview development
# Paste the NEXT_PUBLIC_TMDB_API_KEY value when prompted

# Add TMDB v4 token (optional)
npx vercel env add TMDB_READ_ACCESS_TOKEN production preview development
# Paste the TMDB_READ_ACCESS_TOKEN value when prompted
```

### Option 2: Use Vercel Dashboard (Easier)

**Step 1: Get Values from CusorFLIX Dashboard**
1. Go to: https://vercel.com/peter-alexander-pedersen-s-projects/cusorflix/settings/environment-variables
2. Copy the values for:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_TMDB_API_KEY`
   - `TMDB_READ_ACCESS_TOKEN`

**Step 2: Add to CinemaRebel Dashboard**
1. Go to: https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings/environment-variables
2. Click "Add New"
3. Add each variable:
   - `DATABASE_URL` = (paste value from CusorFLIX)
   - `NEXT_PUBLIC_TMDB_API_KEY` = (paste value from CusorFLIX)
   - `TMDB_READ_ACCESS_TOKEN` = (paste value from CusorFLIX)
4. Select environments: Production, Preview, Development
5. Click "Save"

### Option 3: Create New Resources (Recommended for Production)

**Database:**
1. Create new Vercel Postgres database for CinemaRebel
2. Get connection string from Vercel dashboard
3. Add to CinemaRebel environment variables

**TMDB API:**
1. Create new TMDB API key for CinemaRebel
2. Get key from TMDB dashboard
3. Add to CinemaRebel environment variables

---

## Verification

### Check Environment Variables

```bash
# Link to CinemaRebel
npx vercel link --yes --project=cinemarebel --scope=team_834Dra8BzpHNrIWqdx57WTnR

# List environment variables
npx vercel env ls

# Expected output:
# DATABASE_URL ✅
# NEXT_PUBLIC_TMDB_API_KEY ✅
# TMDB_READ_ACCESS_TOKEN ✅
# UPSTASH_REDIS_REST_URL ✅
# UPSTASH_REDIS_REST_TOKEN ✅
```

### Redeploy After Adding Variables

```bash
# Redeploy CinemaRebel
npx vercel --prod

# Verify deployment
npx vercel ls --prod
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** Prisma cannot connect to database

**Solutions:**
1. Verify `DATABASE_URL` is set correctly
2. Check database is active and accessible
3. Verify connection string format
4. Check network connectivity
5. Verify database credentials

### TMDB API Issues

**Problem:** TMDB API calls fail

**Solutions:**
1. Verify `NEXT_PUBLIC_TMDB_API_KEY` is set correctly
2. Check API key is valid and not expired
3. Verify API key has correct permissions
4. Check rate limits
5. Verify TMDB service is accessible

---

## Next Steps

1. ✅ Add `DATABASE_URL` to CinemaRebel
2. ✅ Add `NEXT_PUBLIC_TMDB_API_KEY` to CinemaRebel
3. ✅ Add `TMDB_READ_ACCESS_TOKEN` to CinemaRebel (optional)
4. ✅ Redeploy CinemaRebel
5. ✅ Verify all services work correctly

---

**Last Updated:** 2025-01-28  
**Status:** Setup Guide Created

