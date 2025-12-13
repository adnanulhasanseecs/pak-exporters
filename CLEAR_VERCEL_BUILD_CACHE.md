# How to Clear Vercel Build Cache

## Method 1: Via Vercel Dashboard (Easiest)

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Click **Redeploy** (three dots menu)
4. **IMPORTANT**: **UNCHECK** "Use existing Build Cache"
5. Click **Redeploy**

This forces a completely fresh build without any cache.

## Method 2: Via Vercel CLI

```bash
# Force rebuild without cache
vercel --force

# For production
vercel --prod --force
```

## Method 3: Delete .vercel Folder (Local)

If you have a `.vercel` folder locally:
```bash
rm -rf .vercel
# Then redeploy
vercel --prod
```

## Why Clear Cache?

Vercel caches:
- Build artifacts
- Environment variables used during build
- Prisma Client generation
- Node modules

If environment variables changed, the cache might still have old values.

