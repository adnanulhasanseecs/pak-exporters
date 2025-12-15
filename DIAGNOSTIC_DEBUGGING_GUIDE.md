# Diagnostic Debugging Guide - Vercel Production Data Issue

## Overview
This document explains the diagnostic logging added to identify why products/categories/blogs appear on localhost but NOT on Vercel production.

## Diagnostic Steps Implemented

### STEP 1: Prove Database Access on Vercel
**Location:** `services/db/products.ts`, `services/db/categories.ts`, `services/db/blog.ts`

**What it logs:**
- Function execution confirmation
- `NODE_ENV` value
- Database hostname (never credentials)
- Database connection test result

**What to look for in Vercel logs:**
```
[getProductsFromDb] Function called
[getProductsFromDb] NODE_ENV: production
[getProductsFromDb] DB host: db.prisma.io
[getProductsFromDb] Database connection test: SUCCESS
```

**If logs don't appear:**
- Page is being statically rendered (check `dynamic = "force-dynamic"`)
- Function is not being called at request-time

---

### STEP 2: Bypass All Filters Temporarily
**Location:** `services/db/products.ts` (lines ~90-100)

**What it does:**
- Runs `prisma.product.findMany({ take: 5 })` with NO filters
- Logs count, IDs, and names of products found

**What to look for in Vercel logs:**
```
[getProductsFromDb] Diagnostic query result: {
  count: 5,
  ids: [...],
  names: [...]
}
```

**Outcomes:**
- **If count = 0:** Database is empty OR schema mismatch
- **If count > 0:** Filters are excluding production data

**Note:** This is TEMPORARY diagnostic code. Remove after diagnosis.

---

### STEP 3: Verify Schema Alignment
**Location:** `services/db/products.ts` (lines ~75-95)

**What it checks:**
- If Product table exists (checks: `Product`, `product`, `products`, `Products`)
- Table columns and data types
- Case sensitivity issues

**What to look for in Vercel logs:**
```
[getProductsFromDb] Schema check - Found tables: [{ table_name: 'Product' }]
[getProductsFromDb] Schema check - Actual table name: Product
[getProductsFromDb] Schema check - Product table columns: [...]
```

**If table not found:**
- Migrations haven't been applied
- Wrong database connection
- Schema mismatch

---

### STEP 4: Verify Migrations
**Location:** `services/db/products.ts` (lines ~96-115)

**What it checks:**
- `_prisma_migrations` table exists
- List of applied migrations
- Pending migrations

**What to look for in Vercel logs:**
```
[getProductsFromDb] Migration check - Applied migrations: [
  { migration_name: '20251208114344_init', finished_at: '2025-12-08...' }
]
[getProductsFromDb] Migration check - All migrations appear to be applied
```

**If no migrations found:**
- Migrations haven't been run on production database
- Need to run: `npx prisma migrate deploy` on Vercel

**If pending migrations:**
- Some migrations failed or are incomplete

---

## How to View Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on the latest deployment
4. Click **Functions** tab (or **Runtime Logs**)
5. Click on a function (e.g., `/api/products` or the page route)
6. View **Logs** section

**Alternative (Vercel CLI):**
```bash
vercel logs <deployment-url> --follow
```

---

## Expected Diagnostic Flow

### Scenario A: Database Empty
```
[getProductsFromDb] Function called
[getProductsFromDb] Database connection test: SUCCESS
[getProductsFromDb] Diagnostic query result: { count: 0 }
[getProductsFromDb] DIAGNOSIS: Database has ZERO products.
```
**Solution:** Seed the database with `npm run db:seed`

---

### Scenario B: Migrations Not Applied
```
[getProductsFromDb] Schema check - Found tables: []
[getProductsFromDb] CRITICAL: Product table does NOT exist!
[getProductsFromDb] Migration check failed: relation "_prisma_migrations" does not exist
```
**Solution:** Run migrations: `npx prisma migrate deploy` (or configure in Vercel build)

---

### Scenario C: Filters Too Restrictive
```
[getProductsFromDb] Diagnostic query result: { count: 5 }
[getProductsFromDb] Filtered query result: { productsFound: 0, totalCount: 0 }
```
**Solution:** Review filter logic, check if `status: "active"` is excluding all products

---

### Scenario D: Schema Case Mismatch
```
[getProductsFromDb] Schema check - Found tables: [{ table_name: 'product' }]
[getProductsFromDb] Error: Table "Product" does not exist
```
**Solution:** Prisma is looking for `Product` but table is `product`. Check Prisma schema vs actual DB.

---

## Next Steps After Diagnosis

1. **Review Vercel logs** after deployment completes
2. **Identify the root cause** from diagnostic logs
3. **Fix the issue** based on the diagnosis
4. **Remove temporary diagnostic code** (the bypass filter query)
5. **Verify fix** on next deployment

---

## Files Modified

- `services/db/products.ts` - Full diagnostic logging
- `services/db/categories.ts` - Diagnostic logging added
- `services/db/blog.ts` - Diagnostic logging added

---

## Important Notes

- **All diagnostic logs are temporary** and should be removed after diagnosis
- **Never log credentials** - only hostnames and connection status
- **Diagnostic queries bypass filters** - this is intentional to prove data exists
- **Migration verification** helps identify if schema is out of sync

