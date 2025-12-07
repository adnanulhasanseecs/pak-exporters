# API Fetch Error - Root Cause Analysis

## Error Summary
**Error Type:** `TypeError: fetch failed`  
**Location:** `services/api/products.ts:50`  
**Affected Pages:** All pages using API calls in server components

## Root Cause

### Primary Issue: Port Mismatch in Server-Side API Calls

The `buildApiUrl()` function in `lib/api-client.ts` has a **critical port mismatch**:

1. **Server Context Detection:**
   - When called from server components (async functions), `buildApiUrl()` uses `getBaseUrl()`
   - `getBaseUrl()` checks `process.env.NEXT_PUBLIC_APP_URL` first
   - If not set, it falls back to: `http://localhost:${process.env.PORT || "3000"}`

2. **Actual Dev Server Port:**
   - Dev server is configured to run on port **3001** (`package.json`: `"dev": "next dev -p 3001"`)
   - `APP_CONFIG.url` defaults to `http://localhost:3001` in `lib/constants.ts`

3. **The Mismatch:**
   - `buildApiUrl()` defaults to `http://localhost:3000` in server context
   - But the actual server is on `http://localhost:3001`
   - Result: Fetch calls fail because they're trying to reach a non-existent server on port 3000

### Secondary Issue: Environment Variable Not Set

- `NEXT_PUBLIC_APP_URL` is likely not set in `.env.local` or `.env`
- This causes `buildApiUrl()` to use the fallback port 3000 instead of 3001

## Affected Pages

All pages that make API calls in server components are affected:

1. **Products Pages:**
   - `app/[locale]/products/page.tsx` - ✅ Confirmed (fetchProducts)
   - `app/[locale]/products/[id]/page.tsx` - ✅ Likely (fetchProduct)

2. **Categories Pages:**
   - `app/[locale]/categories/page.tsx` - ✅ Likely (fetchCategories)
   - `app/[locale]/category/[slug]/page.tsx` - ✅ Likely (fetchCategory)

3. **Companies Pages:**
   - `app/[locale]/companies/page.tsx` - ✅ Likely (fetchCompanies)
   - `app/[locale]/company/[id]/page.tsx` - ✅ Likely (fetchCompany)

4. **RFQ Pages:**
   - `app/[locale]/rfq/page.tsx` - ✅ Likely (fetchRfq)
   - `app/[locale]/dashboard/rfq/page.tsx` - ✅ Likely (fetchRfq)

5. **Blog Pages:**
   - `app/[locale]/blog/page.tsx` - ✅ Likely (fetchBlogPosts)
   - `app/[locale]/blog/[slug]/page.tsx` - ✅ Likely (fetchBlogPost)

6. **Search Page:**
   - `app/[locale]/search/page.tsx` - ✅ Likely (searchProducts)

7. **Dashboard Pages:**
   - All dashboard pages that fetch data - ✅ Likely affected

## Technical Details

### Current Implementation (`lib/api-client.ts`)

```typescript
function getBaseUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: Node.js fetch requires absolute URLs
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    // For Vercel deployments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // For local development, default to localhost:3000
    // Next.js dev server typically runs on port 3000
    const port = process.env.PORT || "3000";  // ❌ WRONG: Should be 3001
    return `http://localhost:${port}`;
  }
  
  // Client-side: use current origin
  return window.location.origin;
}
```

### The Problem

1. **Server Components:** When `fetchProducts()` is called from a server component, it's executed on the server
2. **Port Detection:** `getBaseUrl()` doesn't know the actual dev server port
3. **Fallback:** Uses `process.env.PORT || "3000"` which doesn't match the actual port 3001
4. **Result:** Fetch fails because `http://localhost:3000/api/products` doesn't exist

## Impact Assessment

### Severity: **CRITICAL**
- All data-fetching pages are broken
- Users cannot view products, categories, companies, etc.
- Dashboard functionality is broken
- Search functionality is broken

### Scope: **WIDE**
- Affects all pages with server-side data fetching
- Affects both public and authenticated pages
- Affects all API service functions

## Solution Options

### Option 1: Set Environment Variable (Quick Fix)
**Pros:**
- Quick to implement
- Works immediately
- No code changes needed

**Cons:**
- Requires manual configuration
- Easy to forget in new environments
- Doesn't solve the root cause

**Implementation:**
- Add `NEXT_PUBLIC_APP_URL=http://localhost:3001` to `.env.local`

### Option 2: Fix buildApiUrl to Use APP_CONFIG (Recommended)
**Pros:**
- Uses existing configuration
- Consistent with rest of app
- No environment variable needed
- Works in all environments

**Cons:**
- Requires code change
- Need to ensure APP_CONFIG is always correct

**Implementation:**
- Modify `getBaseUrl()` to use `APP_CONFIG.url` as fallback
- This ensures consistency with the app's configured URL

### Option 3: Use Relative URLs in Server Components (Best Practice)
**Pros:**
- Next.js handles URL resolution automatically
- Works in all environments (dev, staging, production)
- No port configuration needed
- Follows Next.js best practices

**Cons:**
- Requires refactoring API service layer
- Need to handle server vs client contexts differently

**Implementation:**
- For server components: Use relative URLs (`/api/products`)
- Next.js will automatically resolve to the correct origin
- For client components: Keep using `buildApiUrl()` or relative URLs

### Option 4: Use Next.js Internal API Calls (Advanced)
**Pros:**
- Most efficient (no HTTP overhead)
- Works automatically in all environments
- Type-safe with proper typing

**Cons:**
- Requires significant refactoring
- Need to import API route handlers directly
- May not work for all use cases

**Implementation:**
- Import API route handlers directly
- Call them as functions instead of HTTP requests
- Requires restructuring API routes

## Recommendation

**Option 2 + Option 3 (Hybrid Approach):**

1. **Immediate Fix:** Update `buildApiUrl()` to use `APP_CONFIG.url` as fallback
2. **Long-term:** Refactor server components to use relative URLs where possible

This provides:
- ✅ Immediate fix without breaking changes
- ✅ Better long-term maintainability
- ✅ Follows Next.js best practices
- ✅ Works in all environments

## Testing Checklist

After implementing the fix, verify:

- [ ] Products page loads correctly
- [ ] Product detail page loads correctly
- [ ] Categories page loads correctly
- [ ] Category detail page loads correctly
- [ ] Companies page loads correctly
- [ ] Company detail page loads correctly
- [ ] RFQ pages load correctly
- [ ] Blog pages load correctly
- [ ] Search page works correctly
- [ ] Dashboard pages load correctly
- [ ] Works in development (localhost:3001)
- [ ] Works in production (if deployed)
- [ ] No console errors
- [ ] Network tab shows correct API calls

