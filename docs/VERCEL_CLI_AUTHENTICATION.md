# Vercel CLI Authentication Guide

**Status:** Authentication Setup  
**Date:** 2025-01-28

---

## Authentication Methods

### Method 1: Interactive Login (Recommended)

```bash
npx vercel login
```

This will:
1. Open your browser
2. Ask you to authorize the CLI
3. Store credentials locally
4. Allow CLI commands to work

### Method 2: Access Token (For Automation)

1. **Create Token:**
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Name: `cinemarebel-cli` (or any name)
   - Copy the token

2. **Set Token as Environment Variable:**
   
   **Windows PowerShell:**
   ```powershell
   $env:VERCEL_TOKEN="your_token_here"
   ```
   
   **Windows CMD:**
   ```cmd
   set VERCEL_TOKEN=your_token_here
   ```
   
   **Linux/Mac:**
   ```bash
   export VERCEL_TOKEN="your_token_here"
   ```

3. **Or Add to .env.local:**
   ```bash
   VERCEL_TOKEN=your_token_here
   ```

4. **Use CLI with Token:**
   ```bash
   npx vercel --token=$VERCEL_TOKEN projects ls
   ```

### Method 3: Link Project First

If you're in a project directory:

```bash
npx vercel link
```

This will:
1. Ask you to select a team
2. Ask you to select a project
3. Create `.vercel` directory with project config
4. May prompt for authentication if not already logged in

---

## Verify Authentication

### Check Authentication Status

```bash
npx vercel whoami
```

**Expected Output (if authenticated):**
```
Vercel CLI 48.9.0
> Logged in as peterapdk@gmail.com
```

**If Not Authenticated:**
```
> No existing credentials found. Please log in:
  Visit https://vercel.com/oauth/device?user_code=XXXX-XXXX
```

### Test with a Command

```bash
npx vercel projects ls
```

If authenticated, this will list your projects.

---

## Troubleshooting

### Issue: "No existing credentials found"

**Solution:**
1. Run `npx vercel login`
2. Or set `VERCEL_TOKEN` environment variable
3. Or pass `--token` flag to commands

### Issue: "Authentication failed"

**Solutions:**
1. Check token is correct
2. Verify token hasn't expired
3. Check token has correct permissions
4. Try creating a new token

### Issue: "Project not found"

**Solution:**
1. Run `npx vercel link` in project directory
2. Or specify project with `--scope` flag
3. Or set project ID in `.vercel/project.json`

### Issue: Credentials Not Persisting

**Solution:**
1. Check if credentials are stored in `~/.vercel` directory
2. Verify file permissions
3. Try logging in again
4. Use token method instead

---

## Using Token in Scripts

### PowerShell Script

```powershell
# Set token
$env:VERCEL_TOKEN = "your_token_here"

# Use CLI
npx vercel projects ls
npx vercel env ls
```

### Bash Script

```bash
#!/bin/bash
export VERCEL_TOKEN="your_token_here"
npx vercel projects ls
npx vercel env ls
```

### With .env.local

```bash
# Load .env.local (requires dotenv-cli or similar)
npm install -g dotenv-cli
dotenv -e .env.local -- npx vercel projects ls
```

---

## Project-Specific Authentication

### Link Current Project

```bash
npx vercel link
```

This creates `.vercel/project.json` with:
```json
{
  "projectId": "prj_xxx",
  "orgId": "team_xxx"
}
```

### Use Specific Project

```bash
npx vercel --scope=team_xxx projects ls
npx vercel --scope=team_xxx env ls --project=prj_xxx
```

---

## Next Steps After Authentication

Once authenticated, you can:

1. **List Projects:**
   ```bash
   npx vercel projects ls
   ```

2. **View Environment Variables:**
   ```bash
   npx vercel env ls
   ```

3. **Add Environment Variables:**
   ```bash
   npx vercel env add VARIABLE_NAME production preview development
   ```

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```

5. **View Deployments:**
   ```bash
   npx vercel ls
   ```

---

## Security Best Practices

1. **Token Security:**
   - Never commit tokens to git
   - Use environment variables
   - Rotate tokens periodically
   - Use tokens with minimal permissions

2. **Credential Storage:**
   - Credentials stored in `~/.vercel`
   - Keep this directory secure
   - Don't share credentials

3. **Token Scope:**
   - Use "Team" scope if possible
   - Only use "Full Account" if necessary
   - Revoke unused tokens

---

## Quick Reference

### Authentication Commands

```bash
# Login interactively
npx vercel login

# Check authentication
npx vercel whoami

# Link project
npx vercel link

# Use token
npx vercel --token=$VERCEL_TOKEN projects ls
```

### Common Commands

```bash
# List projects
npx vercel projects ls

# List environment variables
npx vercel env ls

# Add environment variable
npx vercel env add VAR_NAME production preview development

# Deploy
npx vercel --prod
```

---

## Current Status

- ✅ Vercel CLI: Installed (via npx)
- ⚠️ Authentication: Needs setup
- ⚠️ Project Linked: No

---

## Resources

- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Create Token:** https://vercel.com/account/tokens
- **Authentication:** https://vercel.com/docs/cli#authentication

---

**Last Updated:** 2025-01-28  
**Status:** Ready for Authentication

