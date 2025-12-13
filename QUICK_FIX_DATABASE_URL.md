# Quick Fix: DATABASE_URL Issue on Vercel

## The Problem

`DATABASE_URL` is managed by Vercel and can't be directly edited. It might be pointing to `localhost:5433` instead of Vercel Postgres.

## Quick Solution (3 Steps)

### Step 1: Check Current Values

In Vercel Dashboard → Settings → Environment Variables:

1. **Click the eye icon 👁️ next to `DATABASE_PRISMA_DATABASE_URL`**
   - If it shows `postgres://...@db.prisma.io:5432/...` → ✅ **Good!**
   - If it shows `localhost:5433` → ❌ **Problem!**

2. **Click the eye icon 👁️ next to `DATABASE_URL`**
   - Check what it shows

### Step 2: Use DATABASE_PRISMA_DATABASE_URL

I've updated `prisma/schema.prisma` to use `DATABASE_PRISMA_DATABASE_URL` instead of `DATABASE_URL`.

**This is already done!** ✅

### Step 3: Redeploy

After the schema change:

```bash
# Regenerate Prisma client
npm run db:generate

# Commit and push
git add prisma/schema.prisma
git commit -m "fix: use DATABASE_PRISMA_DATABASE_URL for Vercel Postgres"
git push
```

Vercel will automatically redeploy.

---

## Alternative: If DATABASE_PRISMA_DATABASE_URL is Also Wrong

If both variables are wrong:

1. **Go to Storage tab:**
   - Vercel Dashboard → Your Project → **Storage**
   - Click on your Postgres database

2. **Check Connection Strings:**
   - Look for "Connection String" section
   - Copy the correct one (should end with `@db.prisma.io:5432/...`)

3. **Manually Add/Update:**
   - Go back to Environment Variables
   - If `DATABASE_PRISMA_DATABASE_URL` exists, try to edit it
   - If not, click "Add New" and create it with the correct value

---

## Test After Fix

After redeployment, test:
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products

Should return JSON data, not connection errors!

