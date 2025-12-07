# Refactoring Plan: Option 2 + Option 3 Hybrid

## Effort Estimate

### Total Estimated Time: **4-6 hours**

**Breakdown:**
- **Option 2 (Immediate Fix):** 30 minutes
- **Option 3 (Server Component Refactoring):** 3-5 hours
- **Testing & Verification:** 1 hour

## Phase 1: Option 2 - Immediate Fix (30 min)

### Files to Modify: 1 file

1. **`lib/api-client.ts`**
   - Update `getBaseUrl()` to use `APP_CONFIG.url` as fallback
   - This provides immediate fix for all server-side API calls

### Code Changes:

```typescript
// lib/api-client.ts
import { APP_CONFIG } from "@/lib/constants";

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
    // ✅ NEW: Use APP_CONFIG.url as fallback (includes correct port)
    return APP_CONFIG.url;
  }
  
  // Client-side: use current origin
  return window.location.origin;
}
```

**Impact:** Fixes all server-side API calls immediately

---

## Phase 2: Option 3 - Server Component Refactoring (3-5 hours)

### Strategy

For **server components** (async functions), use relative URLs directly.
For **client components** and **API service functions called from client**, keep using `buildApiUrl()`.

### Files to Refactor: 5 API Service Files

#### 1. **`services/api/products.ts`** (8 fetch calls)
- `fetchProducts()` - Used in server components
- `fetchProduct()` - Used in server components
- `createProduct()` - Used in client components (forms)
- `updateProduct()` - Used in client components (forms)
- `deleteProduct()` - Used in client components (forms)
- `duplicateProduct()` - Used in client components (forms)

**Refactoring:**
- Create separate functions for server vs client contexts
- OR: Detect context and use appropriate URL strategy

#### 2. **`services/api/categories.ts`** (3 fetch calls)
- `fetchCategories()` - Used in server components
- `fetchCategoryTree()` - Used in server components
- `fetchCategoryBySlug()` - Used in server components

**Refactoring:**
- Use relative URLs for server component calls

#### 3. **`services/api/companies.ts`** (3 fetch calls)
- `fetchCompanies()` - Used in server components
- `fetchCompany()` - Used in server components
- `createCompany()` - Used in client components (forms)

**Refactoring:**
- Use relative URLs for server component calls

#### 4. **`services/api/rfq.ts`** (6 fetch calls)
- `fetchRfqs()` - Used in server components
- `fetchRfq()` - Used in server components
- `createRfq()` - Used in client components (forms)
- `submitRfqResponse()` - Used in client components (forms)
- `updateRfq()` - Used in client components (forms)
- `deleteRfq()` - Used in client components (forms)

**Refactoring:**
- Use relative URLs for server component calls

#### 5. **`services/api/blog.ts`** (2 fetch calls)
- `fetchBlogPosts()` - Used in server components
- `fetchBlogPost()` - Used in server components

**Refactoring:**
- Use relative URLs for server component calls

### Implementation Approach

**Option A: Context-Aware Functions (Recommended)**
- Detect if running in server context
- Use relative URLs in server context
- Use `buildApiUrl()` in client context

**Option B: Separate Server/Client Functions**
- Create `fetchProductsServer()` and `fetchProductsClient()`
- More explicit but requires updating all call sites

**Option C: Unified Function with Smart Detection**
- Single function that detects context automatically
- Cleanest API, but more complex implementation

### Recommended: Option A (Context-Aware)

```typescript
// services/api/products.ts
import { buildApiUrl } from "@/lib/api-client";

/**
 * Get the API URL - uses relative URLs in server context, absolute in client
 */
function getApiUrl(endpoint: string): string {
  // In server context, use relative URL (Next.js handles resolution)
  if (typeof window === "undefined") {
    return endpoint;
  }
  // In client context, use buildApiUrl for absolute URL
  return buildApiUrl(endpoint);
}

export async function fetchProducts(...) {
  const url = `${API_ENDPOINTS.products}${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(getApiUrl(url), {
    // ...
  });
}
```

---

## Affected Pages (16 files)

### Server Components (Use Relative URLs)

1. **`app/[locale]/products/page.tsx`**
   - Calls: `fetchProducts()`, `fetchCategories()`
   - **Change:** No change needed (service layer handles it)

2. **`app/[locale]/products/[id]/page.tsx`**
   - Calls: `fetchProduct()`, `fetchCategories()`
   - **Change:** No change needed

3. **`app/[locale]/categories/page.tsx`**
   - Calls: `fetchCategories()`
   - **Change:** No change needed

4. **`app/[locale]/category/[slug]/page.tsx`**
   - Calls: `fetchCategoryBySlug()`, `fetchProducts()`
   - **Change:** No change needed

5. **`app/[locale]/companies/page.tsx`**
   - Calls: `fetchCompanies()`
   - **Change:** No change needed

6. **`app/[locale]/company/[id]/page.tsx`**
   - Calls: `fetchCompany()`, `fetchProducts()`
   - **Change:** No change needed

7. **`app/[locale]/rfq/page.tsx`**
   - Calls: `fetchRfqs()` (if server component)
   - **Change:** No change needed

8. **`app/[locale]/blog/page.tsx`**
   - Calls: `fetchBlogPosts()`
   - **Change:** No change needed

9. **`app/[locale]/blog/[slug]/page.tsx`**
   - Calls: `fetchBlogPost()`
   - **Change:** No change needed

10. **`app/[locale]/search/page.tsx`**
    - Calls: `fetchProducts()`, `fetchCategories()`
    - **Change:** No change needed

11. **`app/[locale]/dashboard/products/page.tsx`**
    - Calls: `fetchProducts()` (if server component)
    - **Change:** No change needed

12. **`app/[locale]/dashboard/companies/page.tsx`**
    - Calls: `fetchCompanies()` (if server component)
    - **Change:** No change needed

13. **`app/[locale]/dashboard/products/[id]/edit/page.tsx`**
    - Calls: `fetchProduct()` (if server component)
    - **Change:** No change needed

14. **`app/[locale]/admin/page.tsx`**
    - Calls: Various API functions
    - **Change:** No change needed

### Client Components (Keep Using buildApiUrl)

15. **`app/[locale]/dashboard/products/new/page.tsx`**
    - Calls: `createProduct()` from client component
    - **Change:** No change needed (already uses buildApiUrl)

16. **`app/[locale]/dashboard/companies/new/page.tsx`**
    - Calls: `createCompany()` from client component
    - **Change:** No change needed (already uses buildApiUrl)

---

## Detailed Refactoring Steps

### Step 1: Fix buildApiUrl (Option 2) - 30 min

1. Update `lib/api-client.ts`
   - Import `APP_CONFIG`
   - Change fallback to use `APP_CONFIG.url`
   - Test with products page

### Step 2: Refactor API Services (Option 3) - 2-3 hours

1. **Create helper function** in each API service file:
   ```typescript
   function getApiUrl(endpoint: string): string {
     if (typeof window === "undefined") {
       return endpoint; // Server: relative URL
     }
     return buildApiUrl(endpoint); // Client: absolute URL
   }
   ```

2. **Update all fetch calls** in:
   - `services/api/products.ts` (8 calls)
   - `services/api/categories.ts` (3 calls)
   - `services/api/companies.ts` (3 calls)
   - `services/api/rfq.ts` (6 calls)
   - `services/api/blog.ts` (2 calls)

3. **Replace `buildApiUrl(url)` with `getApiUrl(url)`**

### Step 3: Testing - 1 hour

1. Test all affected pages:
   - Products listing and detail
   - Categories listing and detail
   - Companies listing and detail
   - RFQ pages
   - Blog pages
   - Search page
   - Dashboard pages

2. Verify:
   - No console errors
   - Data loads correctly
   - Works in dev (port 3001)
   - Works in production (if applicable)

---

## Risk Assessment

### Low Risk
- **Option 2:** Simple change, low risk of breaking anything
- **Option 3:** Changes are isolated to service layer, pages don't need modification

### Mitigation
- Test each API service file after refactoring
- Keep `buildApiUrl()` for client-side calls (backward compatible)
- Relative URLs work automatically in Next.js server components

---

## Benefits

1. **Immediate Fix:** Option 2 provides instant solution
2. **Long-term Solution:** Option 3 follows Next.js best practices
3. **No Breaking Changes:** Pages don't need modification
4. **Environment Agnostic:** Works in dev, staging, production
5. **Maintainable:** Clear separation of server vs client API calls

---

## Summary

- **Total Files to Modify:** 6 files (1 for Option 2, 5 for Option 3)
- **Total Pages Affected:** 16 pages (but no changes needed - service layer handles it)
- **Estimated Time:** 4-6 hours
- **Risk Level:** Low
- **Breaking Changes:** None

