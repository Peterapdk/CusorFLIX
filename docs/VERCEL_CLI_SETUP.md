# Vercel CLI Setup Guide

**Purpose:** Set up Vercel CLI access so I can manage environment variables programmatically  
**Status:** Setup Required

---

## Option 1: Use Vercel Access Token (Recommended)

### Step 1: Create Vercel Access Token

1. **Go to Vercel Dashboard:**
   - Navigate to: https://vercel.com/account/tokens
   - Or: Settings → Tokens (in your account settings)

2. **Create New Token:**
   - Click "Create Token"
   - Name: `cinemarebel-cli-access` (or any name you prefer)
   - Expiration: Choose "No expiration" or set a long expiration
   - Scope: Select "Full Account" or "Team" access
   - Click "Create Token"

3. **Copy Token:**
   - ⚠️ **Important:** Copy the token immediately (you won't see it again)
   - Save it securely (you'll need to provide it to me)

### Step 2: Set Token as Environment Variable

**Option A: Add to .env.local (Local Development)**
```bash
# Add to .env.local
VERCEL_TOKEN=your_vercel_token_here
```

**Option B: Set in System Environment (Recommended for CLI)**
```bash
# Windows PowerShell
$env:VERCEL_TOKEN="your_vercel_token_here"

# Windows CMD
set VERCEL_TOKEN=your_vercel_token_here

# Linux/Mac
export VERCEL_TOKEN="your_vercel_token_here"
```

**Option C: Use Vercel CLI Login (Interactive)**
```bash
# This will open a browser for authentication
vercel login
```

### Step 3: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Or install locally in project
npm install --save-dev vercel
```

### Step 4: Verify Access

```bash
# Check if authenticated
vercel whoami

# List projects
vercel projects list

# Link project (if needed)
vercel link
```

---

## Option 2: Use Vercel CLI with Interactive Login

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will:
- Open your browser
- Ask you to authorize the CLI
- Store credentials locally
- Allow me to use the CLI

### Step 3: Link Project

```bash
# In your project directory
vercel link
```

This will:
- Ask you to select a team
- Ask you to select a project (cinemarebel)
- Create `.vercel` directory with project configuration

---

## Option 3: Use Environment Variables for CI/CD

If you want to set this up for automated deployments:

### Step 1: Create Token (same as Option 1)

### Step 2: Set Environment Variables

```bash
# Required environment variables
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_834Dra8BzpHNrIWqdx57WTnR
VERCEL_PROJECT_ID=prj_ZkIVRUXzPhiBwyoJ11Sso37LlFUI
```

### Step 3: Use in Commands

```bash
# Now you can run Vercel commands without interactive login
vercel env add UPSTASH_REDIS_REST_URL production preview development
```

---

## What I Can Do With Vercel CLI Access

Once you've set up access, I can:

1. **Add Environment Variables:**
   ```bash
   vercel env add UPSTASH_REDIS_REST_URL production preview development
   vercel env add UPSTASH_REDIS_REST_TOKEN production preview development
   ```

2. **List Environment Variables:**
   ```bash
   vercel env ls
   ```

3. **Remove Environment Variables:**
   ```bash
   vercel env rm VARIABLE_NAME
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

5. **Pull Environment Variables:**
   ```bash
   vercel env pull .env.local
   ```

---

## Quick Setup (Choose One Method)

### Method 1: Token in .env.local (Easiest)

1. **Create token:** https://vercel.com/account/tokens
2. **Add to .env.local:**
   ```bash
   VERCEL_TOKEN=your_token_here
   ```
3. **Install CLI:**
   ```bash
   npm install -g vercel
   ```
4. **I can then use it:** The token will be available for CLI commands

### Method 2: Interactive Login (User-Friendly)

1. **Install CLI:**
   ```bash
   npm install -g vercel
   ```
2. **Run login:**
   ```bash
   vercel login
   ```
3. **Link project:**
   ```bash
   vercel link
   ```
4. **I can then use it:** Credentials are stored locally

### Method 3: Provide Token Directly (For Scripts)

1. **Create token:** https://vercel.com/account/tokens
2. **Provide token to me:** I can use it in commands with `VERCEL_TOKEN` env var
3. **Install CLI:**
   ```bash
   npm install -g vercel
   ```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Token Security:**
   - Never commit tokens to git
   - Use environment variables, not hardcoded values
   - Rotate tokens periodically
   - Use tokens with minimal required permissions

2. **Token Scope:**
   - Use "Team" scope if possible (more restrictive)
   - Only use "Full Account" if necessary
   - Revoke tokens you no longer need

3. **Storage:**
   - Store tokens in `.env.local` (already in .gitignore)
   - Don't share tokens publicly
   - Use different tokens for different purposes

---

## Troubleshooting

### CLI Not Found

**Problem:** `vercel: command not found`

**Solution:**
```bash
# Install globally
npm install -g vercel

# Or use npx
npx vercel --version
```

### Authentication Failed

**Problem:** `Error: Authentication failed`

**Solution:**
1. Check token is correct
2. Verify token hasn't expired
3. Check token has correct permissions
4. Try `vercel login` for interactive authentication

### Project Not Linked

**Problem:** `Error: Project not found`

**Solution:**
```bash
# Link project
vercel link

# Or set environment variables
export VERCEL_ORG_ID=team_834Dra8BzpHNrIWqdx57WTnR
export VERCEL_PROJECT_ID=prj_ZkIVRUXzPhiBwyoJ11Sso37LlFUI
```

### Permission Denied

**Problem:** `Error: Permission denied`

**Solution:**
1. Check token has correct scope
2. Verify you have access to the team/project
3. Check token hasn't been revoked
4. Create a new token with correct permissions

---

## Next Steps

1. **Choose a setup method** (Token or Interactive Login)
2. **Install Vercel CLI** (`npm install -g vercel`)
3. **Authenticate** (Token or `vercel login`)
4. **Link project** (`vercel link` or set env vars)
5. **I can then manage environment variables** for you

---

## Alternative: Manual Setup (No CLI)

If you prefer not to use CLI, you can:
1. Use Vercel Dashboard to add environment variables
2. I'll guide you through the process
3. You manually add the variables
4. Then redeploy

See: [docs/VERCEL_ENV_SETUP.md](VERCEL_ENV_SETUP.md)

---

## Resources

- **Vercel Tokens:** https://vercel.com/account/tokens
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/peter-alexander-pedersen-s-projects/cinemarebel/settings

---

**Last Updated:** 2025-01-28  
**Status:** Ready for Setup

