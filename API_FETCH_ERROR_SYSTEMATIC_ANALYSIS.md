# API Fetch Error - Systematic Analysis & Implementation Plan

**Created:** 2025-12-06  
**Following:** SYSTEMATIC_DEVELOPMENT_PROTOCOL.md

---

## Phase 0: Planning (MANDATORY)

### Step 1: Context Gathering (REQUIRED)

#### Current Error
```
TypeError: fetch failed
at fetchProducts (products.ts:60:20)
```

#### What We Know
1. **Error Location:** `services/api/products.ts:60` - `fetch(getApiUrl(url), ...)`
2. **Context:** Server component (`app/[locale]/products/page.tsx` is async function)
3. **Dev Server:** Running on port 3001
4. **API Routes:** Exist at `app/api/products/route.ts`, `app/api/categories/route.ts`, etc.
5. **Database:** Uses Prisma with SQLite (requires `DATABASE_URL`)

#### Framework Requirements (Next.js 15 App Router)
- **Server Components:** Can use `fetch()` directly
- **Node.js fetch():** Requires **absolute URLs** (cannot use relative URLs)
- **Same-Origin API Routes:** Server components can call API routes on same server
- **Port Configuration:** Dev server runs on port 3001 (configured in `package.json`)

#### Current Implementation State
- ✅ `buildApiUrl()` uses `APP_CONFIG.url` as fallback (port 3001)
- ✅ `getApiUrl()` now always uses `buildApiUrl()` (fixed relative URL issue)
- ❌ Still getting "fetch failed" error

#### Affected Files Audit
**API Service Files (5 files):**
1. `services/api/products.ts` - fetchProducts, fetchProduct
2. `services/api/categories.ts` - fetchCategories, fetchCategoryTree, fetchCategoryBySlug
3. `services/api/companies.ts` - fetchCompanies, fetchCompany
4. `services/api/rfq.ts` - fetchRFQs, fetchRFQ
5. `services/api/blog.ts` - fetchBlogPosts, fetchBlogPostBySlug

**API Route Files (5 files):**
1. `app/api/products/route.ts` - Uses Prisma, requires DATABASE_URL
2. `app/api/categories/route.ts` - Uses Prisma, requires DATABASE_URL
3. `app/api/companies/route.ts` - Uses Prisma, requires DATABASE_URL
4. `app/api/rfq/route.ts` - Uses Prisma, requires DATABASE_URL
5. `app/api/blog/route.ts` - Uses Prisma, requires DATABASE_URL

**Page Files (16 files - no changes needed):**
- All server components that call API services

#### Dependencies
1. **Next.js 15 App Router:** Server components, API routes
2. **Prisma:** Database ORM, requires DATABASE_URL environment variable
3. **SQLite:** Database provider (from schema.prisma)
4. **Node.js fetch():** Requires absolute URLs

---

### Step 2: Root Cause Analysis

#### Possible Root Causes (in order of probability):

**1. Database Connection Issue (MOST LIKELY - 80%)**
- **Evidence:** API routes use Prisma, which requires `DATABASE_URL`
- **Evidence:** API route code checks for Prisma connection and returns 503 if not available
- **Evidence:** "fetch failed" could be API route returning error, not URL issue
- **Test:** Check if `DATABASE_URL` is set, if database file exists, if Prisma client is generated

**2. API Route Not Accessible (60%)**
- **Evidence:** Server component calling API route on same server
- **Evidence:** Next.js might not have API routes compiled/available
- **Test:** Direct browser access to `http://localhost:3001/api/products`

**3. URL Construction Still Wrong (40%)**
- **Evidence:** We fixed `getApiUrl()` but might have other issues
- **Evidence:** `APP_CONFIG.url` might not be correct at runtime
- **Test:** Add logging to see what URL is actually being constructed

**4. Network/Connection Issue (20%)**
- **Evidence:** Server component trying to fetch from same server
- **Evidence:** Could be Next.js internal routing issue
- **Test:** Check if API route responds to direct HTTP request

**5. Prisma Client Not Generated (30%)**
- **Evidence:** API routes import `@/lib/prisma` which uses `@prisma/client`
- **Evidence:** If Prisma client not generated, import will fail
- **Test:** Check if `node_modules/.prisma/client` exists

---

### Step 3: Architecture Design

#### Next.js 15 App Router Server Component Fetch Requirements

**Key Facts:**
1. Server components run on **Node.js server** (not browser)
2. Node.js `fetch()` requires **absolute URLs** (cannot use relative URLs like `/api/products`)
3. Server components can call API routes on **same origin** (localhost:3001)
4. API routes are Next.js route handlers at `app/api/*/route.ts`
5. API routes execute on **same Node.js process** as server components

#### Current Architecture Flow:
```
Server Component (page.tsx)
  ↓
  calls fetchProducts()
  ↓
  uses getApiUrl() → buildApiUrl()
  ↓
  constructs: http://localhost:3001/api/products
  ↓
  Node.js fetch() → HTTP request
  ↓
  API Route Handler (route.ts)
  ↓
  uses Prisma → Database
```

#### Problem Areas:
1. **URL Construction:** Must be absolute, must use correct port
2. **API Route Availability:** Must be compiled and accessible
3. **Database Connection:** Prisma must be initialized and connected
4. **Environment Variables:** DATABASE_URL must be set

---

### Step 4: Investigation Plan (BEFORE Implementation)

#### Investigation Tasks (MUST DO FIRST):

**Task 1: Verify Database Setup**
- [ ] Check if `DATABASE_URL` environment variable is set
- [ ] Check if database file exists (SQLite file)
- [ ] Check if Prisma client is generated (`npm run db:generate`)
- [ ] Check if database is migrated (`npm run db:migrate`)

**Task 2: Verify API Routes Are Accessible**
- [ ] Test direct HTTP request: `http://localhost:3001/api/products`
- [ ] Test direct HTTP request: `http://localhost:3001/api/categories`
- [ ] Check server logs for API route compilation errors
- [ ] Verify API routes are in `.next/server/app/api/` after build

**Task 3: Verify URL Construction**
- [ ] Add logging to `buildApiUrl()` to see constructed URLs
- [ ] Verify `APP_CONFIG.url` is `http://localhost:3001` at runtime
- [ ] Check if `NEXT_PUBLIC_APP_URL` is set (overrides APP_CONFIG.url)

**Task 4: Check Prisma Client**
- [ ] Verify `@prisma/client` is installed
- [ ] Verify `node_modules/.prisma/client` exists
- [ ] Check if `lib/prisma.ts` exports valid PrismaClient instance

**Task 5: Check Server Logs**
- [ ] Review terminal output for compilation errors
- [ ] Check for Prisma connection errors
- [ ] Look for API route handler errors

---

### Step 5: Solution Options (After Investigation)

#### Option A: Database Not Set Up (Most Likely)
**If DATABASE_URL not set or database not migrated:**
- Set `DATABASE_URL` in `.env.local`
- Run `npm run db:generate`
- Run `npm run db:migrate`
- Run `npm run db:seed` (if needed)

#### Option B: API Routes Not Accessible
**If API routes not responding:**
- Check Next.js compilation
- Verify route handlers are correct
- Check for middleware blocking requests

#### Option C: URL Construction Issue
**If URL is wrong:**
- Verify `APP_CONFIG.url` is correct
- Set `NEXT_PUBLIC_APP_URL=http://localhost:3001` in `.env.local`
- Add better error handling and logging

#### Option D: Prisma Client Issue
**If Prisma client not generated:**
- Run `npm run db:generate`
- Verify imports are correct
- Check for TypeScript errors

---

## Implementation Plan (AFTER Investigation)

### Phase 1: Investigation (MANDATORY - DO FIRST)
1. Check database setup
2. Test API routes directly
3. Verify URL construction
4. Check Prisma client
5. Review server logs

### Phase 2: Fix Root Cause (Based on Investigation)
- Implement fix based on actual root cause found
- No ad-hoc changes
- Systematic solution only

### Phase 3: Testing
- Test all affected pages
- Verify API calls work
- Check for errors

---

## Questions to Answer Before Implementation

1. **Is DATABASE_URL set?** → Check `.env.local` or `.env`
2. **Is database file created?** → Check if SQLite file exists
3. **Is Prisma client generated?** → Check `node_modules/.prisma/client`
4. **Are API routes accessible?** → Test `http://localhost:3001/api/products` in browser
5. **What URL is being constructed?** → Add logging to see actual URL
6. **What error is API route returning?** → Check API route response

---

## Next Steps

**DO NOT IMPLEMENT ANYTHING YET**

1. **First:** Run investigation tasks above
2. **Second:** Document findings
3. **Third:** Identify actual root cause
4. **Fourth:** Create specific fix plan
5. **Fifth:** Get approval
6. **Sixth:** Implement fix

---

## Risk Assessment

**High Risk:**
- Making changes without understanding root cause
- Assuming URL issue when it's database issue
- Breaking working code with ad-hoc fixes

**Low Risk:**
- Systematic investigation
- Understanding before fixing
- Testing each step

---

## Success Criteria

- [ ] All API calls succeed
- [ ] No "fetch failed" errors
- [ ] All pages load data correctly
- [ ] No console errors
- [ ] Database connection works
- [ ] API routes respond correctly

