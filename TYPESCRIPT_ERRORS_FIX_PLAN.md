# TypeScript Errors Fix Plan
## 88 Errors Remaining (148 Fixed!) - Systematic Resolution Strategy

**Generated:** 2025-12-08  
**Last Updated:** 2025-12-08  
**Total Errors:** 88 (down from 236)  
**Total Files:** ~35  
**Progress:** 62.7% complete (148 errors fixed)

---

## 🔍 Remaining Type Mismatch Errors (23 errors)

### Critical Type Mismatches Requiring Immediate Attention:

1. **RFQ Price/Budget Type Mismatches (2 errors)**
   - `services/api/rfq.test.ts` - `budget` should be object `{amount, currency}`, not string
   - `app/dashboard/rfq/[id]/respond/page.tsx` - `price` parameter expects string but receives object

2. **CompanyListResponse Type Mismatches (2 errors)**
   - `__tests__/integration/product-search.test.tsx` - Mock data uses `shortDescription` but type expects `CompanyListItem[]` with proper structure
   - Missing `createdAt`/`updatedAt` in company mocks

3. **Category Type Mismatches (1 error)**
   - `__tests__/integration/rfq-submission.test.tsx` - Category mocks missing required fields (`productCount`, `level`, `order`)

4. **RFQ Type Mismatches (1 error)**
   - `__tests__/integration/rfq-submission.test.tsx` - RFQ mock doesn't match `RFQ` interface structure

5. **Prisma Type Mismatches (2 errors)**
   - `app/api/membership/route.ts` - `MembershipApplicationWhereUniqueInput` and `MembershipApplicationCreateInput` type mismatches

6. **Redirect Page Type Mismatches (15 errors)**
   - Multiple test files importing redirect pages that return `void` instead of JSX:
     - `app/categories/__tests__/page.test.tsx` (5 errors)
     - `app/category/[slug]/__tests__/page.test.tsx` (5 errors)
     - `app/products/[id]/__tests__/page.test.tsx` (5 errors)

**Fix Priority:** 🔴 HIGH - These cause runtime errors and test failures

---

## 📊 Error Categories Breakdown

### Category 1: Component Return Type Errors (50+ errors)
**Priority:** 🔴 CRITICAL - Blocks tests and build  
**Files Affected:** ~9 test files

**Issue:** Test files import redirect pages that return `void` instead of JSX components.

**Affected Files:**
- `app/register/__tests__/page.test.tsx` (9 errors)
- `app/rfq/__tests__/page.test.tsx` (8 errors)
- `app/search/__tests__/page.test.tsx` (14 errors)
- `app/login/__tests__/page.test.tsx` (8 errors)
- `app/forgot-password/__tests__/page.test.tsx` (7 errors)
- `app/page/__tests__/page.test.tsx` (7 errors)
- `app/companies/__tests__/page.test.tsx` (11 errors)
- `app/company/[id]/__tests__/page.test.tsx` (9 errors)
- `app/contact/__tests__/page.test.tsx` (11 errors)

**Root Cause:**
- Redirect pages (`app/register/page.tsx`, `app/rfq/page.tsx`, etc.) only call `redirect()` and return `void`
- Tests import these redirect pages instead of the actual locale-aware pages
- TypeScript correctly identifies these as invalid JSX components

**Fix Strategy:**
1. Update test imports to use locale-aware pages: `app/[locale]/register/page.tsx`
2. OR: Create test wrappers that mock the redirect behavior
3. OR: Move tests to test the locale-aware pages directly

**Estimated Time:** 2-3 hours

---

### Category 2: Mock Data Type Mismatches (20+ errors)
**Priority:** 🟠 HIGH - Causes test failures

**Issue:** Mock data in tests missing required properties or using wrong types.

**Affected Files:**
- `app/rfq/__tests__/page.test.tsx` - Missing `productCount`, `level`, `order` in Category mocks
- `app/search/__tests__/page.test.tsx` - Missing `createdAt`, `updatedAt` in Company mocks
- `components/cards/CompanyCard.test.tsx` - Missing `createdAt`, `updatedAt`
- `services/api/companies.test.tsx` - Using `shortDescription` instead of `description`

**Fix Strategy:**
1. Update mock data to match actual type definitions
2. Add missing required properties (`createdAt`, `updatedAt`, `productCount`, `level`, `order`)
3. Fix property name mismatches (`shortDescription` → `description`)

**Estimated Time:** 1-2 hours

---

### Category 3: Unused Variables/Imports (30+ errors)
**Priority:** 🟡 MEDIUM - Code quality issue

**Issue:** Variables and imports declared but never used.

**Affected Files:**
- `components/about/AboutPageClient.tsx` - Unused `Zap` import
- `components/dashboard/DashboardContent.tsx` - Unused `tCommon`
- `components/dashboard/DashboardSidebar.tsx` - Unused `isBuyer`
- `components/forms/__tests__/ProductTagsInput.test.tsx` - Unused `user`
- `components/placeholders/__tests__/AIProductGenerator.test.tsx` - Unused `user`
- `e2e/company-profile.spec.ts` - Multiple unused variables (7 errors)
- `lib/account-lockout.ts` - Unused imports and parameters (4 errors)
- `scripts/audit-i18n.ts` - Unused imports (6 errors)
- `scripts/detect-all-errors.ts` - Unused variables (2 errors)
- `scripts/fix-common-errors.ts` - Unused variable
- `scripts/migrate-data.ts` - Unused import
- `scripts/test-route-structure.ts` - Unused imports (2 errors)
- `services/api/auth.ts` - Unused `token` parameter
- `services/api/upload.ts` - Unused `token` variables (2 errors)
- `services/api/user.ts` - Unused parameters (3 errors)
- `services/api/membership.ts` - Unused parameters (6 errors)

**Fix Strategy:**
1. Remove unused imports
2. Prefix unused variables with `_` (e.g., `_user`) if they're required by interface
3. Remove unused variables entirely if not needed

**Estimated Time:** 1 hour

---

### Category 4: API/Service Type Mismatches (19 errors)
**Priority:** 🟠 HIGH - Runtime errors possible

**Issue:** API function signatures don't match usage or type definitions.

**Affected Files:**
- `services/api/rfq.test.ts` - `budget` should be object `{amount, currency}` not string (1 error)
- `app/dashboard/rfq/[id]/respond/page.tsx` - `price` should be string not object (1 error)
- `__tests__/integration/product-search.test.tsx` - `CompanyListResponse` type mismatch: using `shortDescription` instead of `description` (2 errors)
- `__tests__/integration/rfq-submission.test.tsx` - `Category[]` type mismatch: missing required fields (1 error)
- `__tests__/integration/rfq-submission.test.tsx` - `RFQ` type mismatch: mock data doesn't match interface (1 error)
- `app/api/membership/route.ts` - Prisma type mismatches for `MembershipApplication` (2 errors)
- `services/api/search.ts` - `limit` property doesn't exist on `ProductFilters`/`CompanyFilters` (4 errors)
- `services/api/search.ts` - Type mismatches in return types (2 errors)
- `lib/api-client.test.ts` - Importing non-existent exports (3 errors)
- `app/categories/__tests__/page.test.tsx` - `void` not assignable to `ReactNode` (5 errors - redirect pages)
- `app/category/[slug]/__tests__/page.test.tsx` - `void` not assignable to `ReactNode` (5 errors - redirect pages)
- `app/products/[id]/__tests__/page.test.tsx` - `void` not assignable to `ReactNode` (5 errors - redirect pages)

**Key Type Mismatches:**
1. **RFQ Price/Budget:** `price` should be `{amount: number, currency: string}` object, not string
2. **Company Description:** `CompanyListResponse` uses `CompanyListItem[]` which has `shortDescription?`, but mocks may use wrong property
3. **Category Type:** Category mocks missing required fields like `productCount`, `level`, `order`
4. **Redirect Pages:** Test files importing redirect pages that return `void` instead of JSX

**Fix Strategy:**
1. Fix API function signatures to match actual usage
2. Update mock calls to use correct parameter types (`price` as object, not string)
3. Fix `CompanyListResponse` mocks to use `shortDescription` or convert to `description`
4. Add missing Category fields to mocks
5. Update test imports to use locale-aware pages instead of redirect pages
6. Remove invalid properties from filter objects
7. Fix return type mappings

**Estimated Time:** 2-3 hours

---

### Category 5: Test Configuration Errors (10+ errors)
**Priority:** 🟡 MEDIUM - Test infrastructure issues

**Issue:** Test setup and mocking issues.

**Affected Files:**
- `components/layout/__tests__/Footer.test.tsx` - Missing `vi` import
- `components/layout/__tests__/Header.test.tsx` - Cannot assign to read-only `useAuthStore` (2 errors)
- `components/dashboard/__tests__/RecentProducts.test.tsx` - Cannot assign to read-only `useAuthStore`
- `app/search/__tests__/page.test.tsx` - `disabled` property doesn't exist on `HTMLElement` (4 errors)
- `e2e/product-journey.spec.ts` - `getByPlaceholderText` should be `getByPlaceholder`

**Fix Strategy:**
1. Add missing imports (`vi` from vitest)
2. Fix store mocking approach (use proper mock functions)
3. Use proper type assertions for DOM elements
4. Fix Playwright API method names

**Estimated Time:** 1-2 hours

---

### Category 6: Configuration File Errors ✅ COMPLETED
**Priority:** 🟡 MEDIUM - Build/tooling issues  
**Status:** ✅ **FIXED** - 10 errors resolved

**Issue:** Config files using deprecated or incorrect properties.

**Fixed Files:**
- ✅ `playwright-visual.config.ts` - Removed `reducedMotion` property (4 errors fixed)
- ✅ `vitest.config.ts` - Moved `coverage` to `test.coverage` (1 error fixed)
- ✅ `components/ui/sonner.tsx` - Removed `role` from `ToastOptions` (1 error fixed)
- ✅ `middleware.ts` - Removed `request.ip` usage (1 error fixed)
- ✅ `lib/validations/auth.ts` - Removed invalid `errorMap` from `z.enum()` (1 error fixed)
- ✅ `lib/security-enhanced.ts` - Removed unused `blockDurationMs` property (2 errors fixed)

**Result:** All configuration file errors resolved. Build/tooling issues fixed.

---

### Category 7: Integration Test Errors (15+ errors)
**Priority:** 🟡 MEDIUM - Test coverage issues

**Issue:** Integration tests have type errors.

**Affected Files:**
- `__tests__/integration/authentication.test.tsx` (2 errors)
- `__tests__/integration/form-submission.test.tsx` (4 errors)
- `__tests__/integration/product-search.test.tsx` (3 errors)
- `__tests__/integration/rfq-submission.test.tsx` (4 errors)

**Fix Strategy:**
1. Review and fix type issues in integration tests
2. Ensure proper mocking of dependencies
3. Fix async/await patterns

**Estimated Time:** 1 hour

---

### Category 8: Dashboard/API Route Errors (20+ errors)
**Priority:** 🟠 HIGH - Feature functionality issues

**Issue:** Dashboard pages and API routes have type errors.

**Affected Files:**
- `app/dashboard/notifications/page.tsx` (27 errors) - Major issues
- `app/api/membership/route.ts` (6 errors)
- `app/api/membership/[id]/route.ts` (5 errors)
- `app/api/products/route.ts` (1 error)
- `app/api/rfq/[id]/route.ts` (1 error)
- `app/dashboard/rfq/[id]/respond/page.tsx` (1 error)
- `app/dashboard/settings/page.tsx` (1 error)
- `app/dashboard/companies/new/page.tsx` (1 error)

**Fix Strategy:**
1. Fix notifications page (highest priority - 27 errors)
2. Fix API route type issues
3. Ensure proper error handling types

**Estimated Time:** 3-4 hours

---

### Category 9: Page Test Errors (30+ errors)
**Priority:** 🟡 MEDIUM - Test coverage

**Issue:** Various page test files have type errors.

**Affected Files:**
- `app/about/__tests__/page.test.tsx` (5 errors)
- `app/categories/__tests__/page.test.tsx` (5 errors)
- `app/category/[slug]/__tests__/page.test.tsx` (5 errors)
- `app/products/[id]/__tests__/page.test.tsx` (6 errors)
- `app/pricing/__tests__/page.test.tsx` (1 error)

**Fix Strategy:**
1. Fix mock data types
2. Update test assertions
3. Fix import paths

**Estimated Time:** 2 hours

---

## 🎯 Execution Plan

### ✅ Phase 1: Critical Fixes - IN PROGRESS
**Goal:** Fix errors that block builds and tests

1. **Category 6: Configuration Files** ✅ **COMPLETED**
   - Fixed all 10 config file errors
   - Build/tooling issues resolved

2. **Category 1: Component Return Types** (2-3 hours) - **IN PROGRESS**
   - Update test imports to use locale-aware pages
   - Fix redirect page import errors (15+ errors in page tests)

3. **Category 2: Mock Data Types** (1-2 hours)
   - Fix all mock data to match type definitions
   - Add missing required properties (`createdAt`, `updatedAt`, `productCount`, etc.)

**Expected Result:** ~70 errors fixed, tests can run

---

### Phase 2: High Priority Fixes
**Goal:** Fix errors that cause runtime issues

4. **Category 4: API/Service Types** (2-3 hours) - **HIGH PRIORITY**
   - Fix `price`/`budget` type mismatches (object vs string)
   - Fix `CompanyListResponse` type mismatches
   - Fix Category type mismatches
   - Remove invalid properties from filter objects
   - Fix return type mappings

5. **Category 8: Dashboard/API Routes** (3-4 hours)
   - Fix notifications page (3 errors remaining)
   - Fix API route types (membership routes - 6 errors)

**Expected Result:** ~30 errors fixed, runtime issues resolved

---

### Phase 3: Medium Priority Fixes
**Goal:** Improve code quality and test coverage

6. **Category 3: Unused Variables** (1 hour)
   - Clean up unused imports/variables (39 errors)

7. **Category 5: Test Configuration** (1-2 hours)
   - Fix test setup issues (read-only store, missing imports)

8. **Category 7: Integration Tests** (1 hour)
   - Fix integration test types (13 errors)

9. **Category 9: Page Tests** (2 hours)
   - Fix remaining page test errors (redirect page imports)

**Expected Result:** All remaining errors fixed

---

## 📋 Quick Reference: Error Count by File

### Files with 5+ Errors (Priority Fixes)
- `e2e/company-profile.spec.ts` - **7 errors** 🟠 (unused variables)
- `app/api/membership/route.ts` - **6 errors** 🟠 (Prisma type mismatches)
- `scripts/audit-i18n.ts` - **6 errors** 🟡 (unused imports)
- `app/products/[id]/__tests__/page.test.tsx` - **6 errors** 🟠 (redirect page imports)
- `app/category/[slug]/__tests__/page.test.tsx` - **5 errors** 🟠 (redirect page imports)
- `app/categories/__tests__/page.test.tsx` - **5 errors** 🟠 (redirect page imports)
- `app/about/__tests__/page.test.tsx` - **5 errors** 🟠 (redirect page imports)
- `app/api/membership/[id]/route.ts` - **5 errors** 🟠 (Prisma type mismatches)

### Files with 3-4 Errors
- `__tests__/integration/product-search.test.tsx` - 4 errors (type mismatches)
- `__tests__/integration/form-submission.test.tsx` - 4 errors (unused variables)
- `app/dashboard/notifications/page.tsx` - 3 errors (down from 27! ✅)
- `__tests__/integration/rfq-submission.test.tsx` - 3 errors (type mismatches)
- `lib/api-client.test.ts` - 3 errors (import issues)

---

## 🛠️ Tools & Commands

### Check Progress
```bash
# Run type check to see remaining errors
npm run type-check

# Quick check (type + encoding)
npm run quick-check

# Full build check
npm run build
```

### Auto-fix Some Issues
```bash
# Fix common errors automatically
npm run fix-errors

# Format code
npm run format

# Lint with auto-fix
npm run lint -- --fix
```

---

## ✅ Success Criteria

- [x] Category 6: Configuration Files - **COMPLETED** (10 errors fixed)
- [ ] All 88 remaining TypeScript errors resolved
- [ ] `npm run type-check` passes with 0 errors
- [ ] `npm run build` completes successfully
- [ ] All tests pass (`npm test`)
- [ ] No new errors introduced

## 📊 Progress Tracking

**Overall Progress:** 62.7% (148/236 errors fixed)

### Completed Categories
- ✅ **Category 6: Configuration Files** - 10 errors fixed

### In Progress
- 🔄 **Category 1: Component Return Types** - ~15 errors (redirect page imports)
- 🔄 **Category 4: API/Service Type Mismatches** - 19 errors

### Remaining Categories
- ⏳ **Category 2: Mock Data Types** - ~20 errors
- ⏳ **Category 3: Unused Variables** - 39 errors
- ⏳ **Category 5: Test Configuration** - ~10 errors
- ⏳ **Category 7: Integration Tests** - ~13 errors
- ⏳ **Category 8: Dashboard/API Routes** - ~9 errors
- ⏳ **Category 9: Page Tests** - ~15 errors

---

## 📝 Notes

1. **Test Strategy:** Most test errors are due to importing redirect pages. Consider:
   - Moving tests to `app/[locale]/**/__tests__/` directories
   - Creating test utilities that wrap locale-aware pages
   - Updating test imports to use correct paths

2. **Mock Data:** Ensure all mock data matches actual type definitions. Use TypeScript's type checking to validate.

3. **Incremental Approach:** Fix one category at a time, verify with `npm run type-check` after each category.

4. **Documentation:** Update this plan as errors are fixed to track progress.

---

**Last Updated:** 2025-12-08  
**Status:** 🔄 In Progress - 62.7% Complete (148/236 errors fixed)

### Recent Fixes (2025-12-08)
- ✅ Fixed all 10 configuration file errors
- ✅ Removed deprecated Playwright `reducedMotion` property
- ✅ Fixed Vitest coverage configuration
- ✅ Fixed Sonner toast options
- ✅ Fixed Next.js middleware IP detection
- ✅ Fixed Zod enum validation
- ✅ Fixed security-enhanced rate limiter

