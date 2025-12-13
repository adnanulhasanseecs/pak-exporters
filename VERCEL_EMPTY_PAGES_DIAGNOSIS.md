# Vercel Empty Pages Diagnosis Guide

**Created:** 2025-01-XX  
**Issue:** Pages are empty after Vercel deployment despite database having data

---

## Problem Summary

After Vercel redeploys, these pages are empty:
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/products
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/categories
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/blog

**Database Status:** ✅ Has data (28 products, 14 categories, 6 companies - verified locally)

---

## Root Cause Analysis

### Possible Issues:

1. **Server Components making HTTP calls to API routes**
   - Server Components call `fetchProducts()`, `fetchCategories()`, `fetchBlogPosts()`
   - These functions make HTTP requests to `/api/products`, `/api/categories`, `/api/blog`
   - On Vercel, this might fail due to:
     - URL construction issues (`VERCEL_URL` vs `NEXT_PUBLIC_APP_URL`)
     - Password protection blocking internal requests
     - Network/timeout issues

2. **URL Construction Problems**
   - `buildApiUrl()` uses `process.env.VERCEL_URL` or `process.env.NEXT_PUBLIC_APP_URL`
   - If these aren't set correctly, URLs might be malformed
   - Server Components need absolute URLs for `fetch()`

3. **Password Protection**
   - Vercel preview deployments might have password protection enabled
   - This could block Server Component HTTP requests to API routes

4. **Silent Failures**
   - Errors might be caught and logged but not visible
   - Pages show empty state instead of error messages

---

## Diagnostic Steps

### Step 1: Check Vercel Function Logs

1. Go to https://vercel.com/dashboard
2. Select your project: **pak-exporters**
3. Go to the **Functions** tab
4. Check logs for:
   - `/api/products`
   - `/api/categories`
   - `/api/blog`

**Look for:**
- Are API routes being called?
- What errors are occurring?
- Are database queries succeeding?
- Are JSON fallbacks being triggered?

### Step 2: Check Environment Variables

Run locally:
```bash
vercel env ls
```

**Verify these are set:**
- `DATABASE_URL` - ✅ Should be set (Vercel Postgres connection string)
- `NEXT_PUBLIC_APP_URL` - ⚠️ Check if this is set correctly
- `VERCEL_URL` - ✅ Automatically set by Vercel

**Check `NEXT_PUBLIC_APP_URL` value:**
- Should be your production domain (e.g., `https://pak-exporters.vercel.app`)
- Or your custom domain if configured

### Step 3: Test API Routes Directly

Try accessing API routes directly in browser:
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/categories
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/blog?published=true

**Expected:**
- Should return JSON data
- If password-protected, you'll see authentication page
- If database is empty, should return JSON mock data (fallback)

### Step 4: Check Server Component Logs

The updated code now logs:
- Constructed URLs (in development)
- Detailed error information including baseUrl
- Fetch failures with context

**To see logs:**
1. Go to Vercel dashboard → Your project → **Functions** tab
2. Look for logs from Server Components (page.tsx files)
3. Search for `[fetchProducts]`, `[fetchCategories]`, `[fetchBlogPosts]`

---

## Solutions

### Solution 1: Fix URL Construction (Quick Fix)

If `NEXT_PUBLIC_APP_URL` is not set or incorrect:

1. Go to Vercel dashboard → Your project → **Settings** → **Environment Variables**
2. Add/Update `NEXT_PUBLIC_APP_URL`:
   - **Production:** `https://pak-exporters.vercel.app` (or your custom domain)
   - **Preview:** `https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app`
   - **Development:** `http://localhost:3001`

3. Redeploy

### Solution 2: Disable Password Protection (If Enabled)

If password protection is blocking internal requests:

1. Go to Vercel dashboard → Your project → **Settings** → **Deployment Protection**
2. Check if password protection is enabled for preview deployments
3. If yes, either:
   - Disable it (if not needed)
   - Or configure bypass tokens for internal requests

### Solution 3: Use Direct Database Calls (Long-term Fix)

**Best Practice:** Server Components should call the database directly, not make HTTP requests to API routes.

**Refactor needed:**
1. Create shared data access functions (e.g., `lib/data/products.ts`)
2. Extract database query logic from API routes
3. Use these functions in both:
   - Server Components (direct calls)
   - API Routes (for client-side requests)

**Benefits:**
- No HTTP overhead
- No URL construction issues
- No password protection issues
- Better performance
- Simpler architecture

---

## Current Status

✅ **Fixed:**
- Added comprehensive error logging to API service functions
- Improved error messages with context
- JSON fallback logic is working correctly

⚠️ **Needs Investigation:**
- Why Server Component HTTP calls are failing on Vercel
- Whether password protection is blocking requests
- Whether URL construction is correct

📋 **Next Steps:**
1. Check Vercel function logs (see Step 1 above)
2. Verify environment variables (see Step 2 above)
3. Test API routes directly (see Step 3 above)
4. Based on findings, apply appropriate solution

---

## Quick Test Commands

```bash
# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.production

# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

---

## Related Files

- `services/api/products.ts` - Products API service (with logging)
- `services/api/categories.ts` - Categories API service (with logging)
- `services/api/blog.ts` - Blog API service (with logging)
- `lib/api-client.ts` - URL construction logic
- `app/[locale]/products/page.tsx` - Products page (Server Component)
- `app/[locale]/categories/page.tsx` - Categories page (Server Component)
- `app/[locale]/blog/page.tsx` - Blog page (Server Component)

