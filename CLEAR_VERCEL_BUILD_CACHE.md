# Clear Vercel Build Cache - Fix Database Connection Issue

## Problem

The API is still trying to connect to `localhost:5433` even though environment variables are correctly set. This is because:

1. **Prisma Client is generated at build time** with the connection string baked into the binary
2. **Vercel's build cache** might contain an old Prisma client generated with the wrong connection string
3. The Prisma client binary needs to be regenerated with the correct environment variables

## Solution: Clear Build Cache

### Step 1: Clear Vercel Build Cache

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: **pak-exporters**

2. **Navigate to Settings:**
   - Click **Settings** tab
   - Click **General** in the left sidebar
   - Scroll down to find **"Clear Build Cache"** or **"Build Cache"** section

3. **Clear the Cache:**
   - Click **"Clear Build Cache"** or **"Purge Cache"** button
   - Confirm the action

### Step 2: Verify Environment Variables

Before redeploying, verify these are set correctly:

1. Go to **Settings** → **Environment Variables**
2. Check:
   - ✅ `DATABASE_PRISMA_DATABASE_URL` - Should be `prisma+postgres://accelerate.prisma-data.net/...`
   - ✅ `DATABASE_URL` - Should be `postgres://...@db.prisma.io:5432/...`
   - ✅ Both should **NOT** contain `localhost:5433`

### Step 3: Trigger a Fresh Build

After clearing the cache, trigger a new deployment:

**Option A: Push a new commit (Recommended)**
```bash
git commit --allow-empty -m "trigger: fresh build after clearing cache"
git push
```

**Option B: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **Redeploy**
4. Make sure **"Use existing Build Cache"** is **UNCHECKED**

### Step 4: Monitor the Build

During the build, watch for:
1. **Prisma generate step** - Should show it's generating the client
2. **Environment variables** - Should be available during build
3. **No errors** about missing DATABASE_URL

### Step 5: Check Function Logs

After deployment, check the function logs:

1. Go to **Functions** tab in Vercel Dashboard
2. Click on `/api/products` function
3. Look for logs that show:
   - `🔌 Prisma connecting to: accelerate.prisma-data.net` (or `db.prisma.io`)
   - **NOT** `localhost:5433`

## Why This Happens

Prisma Client is a **generated binary** that includes the connection string at build time. If:
- The build cache contains an old Prisma client
- Or the environment variable wasn't available during the previous build
- The Prisma client will still try to use the old connection string

## Alternative: Force Prisma Regeneration

If clearing cache doesn't work, you can also:

1. **Delete `.next` folder locally** (if you have it)
2. **Delete `node_modules/.prisma` folder**
3. **Push a commit** to trigger a fresh build

But clearing Vercel's build cache is the recommended approach.

## After Fixing

Once the cache is cleared and a fresh build completes:

1. ✅ Test API route: https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
2. ✅ Should return JSON data (not connection errors)
3. ✅ Check function logs to confirm it's connecting to the correct database

## Still Having Issues?

If it still tries to connect to `localhost:5433` after clearing cache:

1. **Check build logs** - Look for Prisma generate step
2. **Verify environment variables** are available during build (not just runtime)
3. **Check if there's a `.env` file** in the repository that might be overriding variables
4. **Contact Vercel support** - There might be a deeper caching issue

