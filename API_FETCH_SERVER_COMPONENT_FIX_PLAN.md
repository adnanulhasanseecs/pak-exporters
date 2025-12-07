# API Fetch Server Component Fix Plan

**Created:** 2025-12-06  
**Status:** ✅ Fix Applied - Environment Variable Configured

---

## Investigation Results

### ✅ What Works
1. **API Routes:** `http://localhost:3001/api/products` returns valid JSON in browser
2. **Database:** Prisma is connected and working
3. **API Route Handlers:** All route handlers are functioning correctly

### ❌ What Doesn't Work
1. **Server Component Fetch:** Server components calling `fetchProducts()` get "fetch failed" error
2. **Context:** Server components run on Node.js, making HTTP requests to same server

---

## Root Cause Analysis

### The Problem
When a **server component** (running on Node.js) calls `fetch()` to make an HTTP request to `http://localhost:3001/api/products`, Node.js fetch() may fail due to:

1. **Network Loopback Issue:** Node.js fetch() trying to connect to localhost from within the same process
2. **URL Construction:** `APP_CONFIG.url` or `NEXT_PUBLIC_APP_URL` may not be set correctly in server context
3. **Timing Issue:** Server component may be executing before API routes are fully initialized

### Most Likely Cause
**Missing `NEXT_PUBLIC_APP_URL` environment variable** - In server context, `getBaseUrl()` falls back to `APP_CONFIG.url`, but if `NEXT_PUBLIC_APP_URL` is not set, it may not resolve correctly at runtime.

---

## Solution Options

### Option 1: Set Environment Variable (RECOMMENDED - Simplest)
**Action:** Create/update `.env.local` with:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**Pros:**
- Simple, one-line fix
- Follows Next.js best practices
- Works for both dev and production

**Cons:**
- Requires environment variable setup

**Implementation:**
1. Check if `.env.local` exists
2. Add `NEXT_PUBLIC_APP_URL=http://localhost:3001`
3. Restart dev server

---

### Option 2: Verify APP_CONFIG.url is Correct
**Action:** Ensure `lib/constants.ts` has correct fallback:
```typescript
export const APP_CONFIG = {
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  // ...
};
```

**Pros:**
- Already implemented
- Provides fallback

**Cons:**
- May not be read correctly in server context
- Need to verify it's actually being used

---

### Option 3: Add Diagnostic Logging (Temporary)
**Action:** Add temporary logging to see what URL is actually being constructed:
```typescript
// In buildApiUrl()
if (process.env.NODE_ENV === "development") {
  console.log(`[buildApiUrl] Server context - baseUrl: "${baseUrl}", endpoint: "${normalizedEndpoint}", fullUrl: "${fullUrl}"`);
}
```

**Pros:**
- Helps diagnose the issue
- Shows actual URL being used

**Cons:**
- Temporary solution
- Doesn't fix the problem

---

### Option 4: Use Direct Server-Side Calls (Architectural Change)
**Action:** Refactor to have server components call Prisma directly instead of API routes.

**Pros:**
- More efficient (no HTTP overhead)
- Follows Next.js App Router best practices
- Eliminates fetch issues

**Cons:**
- Major refactoring (16+ files)
- Changes architecture
- Requires more time

---

## Recommended Solution: Option 1 + Option 2 Verification

### Implementation Steps

**Step 1: Check Environment Variables**
- [ ] Check if `.env.local` exists
- [ ] Check if `NEXT_PUBLIC_APP_URL` is set
- [ ] If not set, add it

**Step 2: Verify APP_CONFIG.url**
- [ ] Check `lib/constants.ts` has correct fallback
- [ ] Verify it's `http://localhost:3001` (not 3000)

**Step 3: Test**
- [ ] Restart dev server
- [ ] Test products page
- [ ] Check if error is resolved

**Step 4: If Still Failing**
- [ ] Add diagnostic logging (Option 3)
- [ ] Check server terminal for actual URL being constructed
- [ ] Verify network connectivity from server context

---

## Implementation Plan

### Phase 1: Environment Setup (5 minutes)
1. Check for `.env.local` file
2. Add `NEXT_PUBLIC_APP_URL=http://localhost:3001` if missing
3. Verify `APP_CONFIG.url` in `lib/constants.ts`

### Phase 2: Testing (5 minutes)
1. Restart dev server
2. Test products page
3. Check for errors

### Phase 3: Diagnostics (if needed)
1. Add temporary logging
2. Check server terminal output
3. Identify actual issue

### Phase 4: Final Fix
1. Implement solution based on diagnostics
2. Remove temporary logging
3. Verify all pages work

---

## Files to Check/Modify

1. **`.env.local`** (create if doesn't exist)
   - Add: `NEXT_PUBLIC_APP_URL=http://localhost:3001`

2. **`lib/constants.ts`** (verify)
   - Check: `APP_CONFIG.url` is `http://localhost:3001`

3. **`lib/api-client.ts`** (no changes needed - already correct)

---

## Success Criteria

- [ ] Products page loads without "fetch failed" error
- [ ] All API calls from server components succeed
- [ ] No console errors
- [ ] Data displays correctly on all pages

---

## Implementation Status

### ✅ Completed Steps

1. **✅ .env.local Created:** File exists with `NEXT_PUBLIC_APP_URL=http://localhost:3001`
2. **✅ APP_CONFIG.url Verified:** Confirmed to be `http://localhost:3001` in `lib/constants.ts`
3. **✅ Dev Server Restarted:** Server is running on port 3001 with new environment variable loaded

### 🔄 Next Steps (Testing)

1. **Test Products Page:** Navigate to `http://localhost:3001/en/products` and verify:
   - Page loads without "fetch failed" error
   - Products data displays correctly
   - No console errors

2. **Test Other Pages:** Verify all server component pages work:
   - Categories page
   - Companies page
   - RFQ page
   - Blog pages

3. **Monitor Server Logs:** Check terminal for any errors or warnings

---

## Expected Result

With `NEXT_PUBLIC_APP_URL=http://localhost:3001` set in `.env.local`:
- `getBaseUrl()` in server context will return `http://localhost:3001`
- `buildApiUrl()` will construct absolute URLs like `http://localhost:3001/api/products`
- Node.js `fetch()` will successfully connect to API routes
- Server components will be able to fetch data without errors

