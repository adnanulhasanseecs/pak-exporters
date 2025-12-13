# Clear Vercel Build Cache - Fix Database Connection Issue

## Problem

The API is still trying to connect to `localhost:5433` even though environment variables are correctly set. This is because:

1. **Prisma Client is generated at build time** with the connection string baked into the binary
2. **Vercel's build cache** might contain an old Prisma client generated with the wrong connection string
3. The Prisma client binary needs to be regenerated with the correct environment variables

## Solution: Force Fresh Build (Multiple Methods)

### Method 1: Redeploy Without Cache (Recommended)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: **pak-exporters**

2. **Navigate to Deployments:**
   - Click **Deployments** tab (top navigation)
   - Find the latest deployment

3. **Redeploy Without Cache:**
   - Click the **three dots (⋯)** menu on the latest deployment
   - Click **Redeploy**
   - **IMPORTANT:** In the redeploy dialog, look for **"Use existing Build Cache"** checkbox
   - **UNCHECK** this option (or make sure it's disabled)
   - Click **Redeploy**

This will force a completely fresh build without using cached artifacts.

### Method 2: Delete .vercel Cache (If Using Vercel CLI)

If you have the Vercel CLI set up locally:

```bash
# Delete local Vercel cache
rm -rf .vercel

# Or on Windows PowerShell:
Remove-Item -Recurse -Force .vercel

# Then redeploy
vercel --prod
```

### Method 3: Add a Build Cache Buster

Add a temporary change to force cache invalidation:

1. **Modify a file that affects the build:**
   - Edit `package.json` and add a comment (or change a script)
   - Or modify `prisma/schema.prisma` (add a comment)

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "chore: force fresh build - clear Prisma cache"
   git push
   ```

### Method 4: Use Vercel CLI to Clear Cache

If you have Vercel CLI installed:

```bash
# Remove build cache
vercel env rm BUILD_CACHE --yes

# Or redeploy with --force flag
vercel --prod --force
```

### Method 5: Check Build Settings

1. **Go to Settings → Build & Development Settings**
2. Look for **"Build Command"** or **"Install Command"**
3. You can temporarily modify the build command to force regeneration:
   ```
   rm -rf node_modules/.prisma && npm run db:generate && npm run build
   ```

## Verify Environment Variables First

Before redeploying, make sure environment variables are correct:

1. **Settings → Environment Variables**
2. Verify:
   - ✅ `DATABASE_PRISMA_DATABASE_URL` exists and is correct
   - ✅ `DATABASE_URL` exists and is correct
   - ✅ Both point to `db.prisma.io` or `accelerate.prisma-data.net` (NOT `localhost:5433`)

## After Redeploying

1. **Monitor the build logs:**
   - Watch for `prisma generate` step
   - Should see Prisma generating the client
   - No errors about missing DATABASE_URL

2. **Check function logs after deployment:**
   - Go to **Functions** tab
   - Click on `/api/products`
   - Look for: `🔌 Prisma connecting to: accelerate.prisma-data.net` (or `db.prisma.io`)
   - Should **NOT** see `localhost:5433`

3. **Test the API:**
   - https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
   - Should return JSON data, not connection errors

## Why This Happens

Prisma Client is a **generated binary** that includes the connection string at build time. If:
- The build cache contains an old Prisma client
- Or the environment variable wasn't available during the previous build
- The Prisma client will still try to use the old connection string

## Alternative: Check if .env File Exists in Repo

Sometimes a `.env` file in the repository can override environment variables:

1. **Check if `.env` exists in your repo:**
   ```bash
   git ls-files | grep "\.env"
   ```

2. **If it exists and contains `localhost:5433`:**
   - Either delete it (if not needed)
   - Or update it to use the correct connection string
   - Make sure `.env` is in `.gitignore`

## Still Having Issues?

If it still tries to connect to `localhost:5433` after redeploying without cache:

1. **Check build logs** - Look for Prisma generate step and what DATABASE_URL it's using
2. **Verify environment variables** are available during build (not just runtime)
3. **Check Vercel Function logs** - The new logging will show what connection string is being used
4. **Contact Vercel support** - There might be a deeper caching issue

