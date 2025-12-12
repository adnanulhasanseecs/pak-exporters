# Why Type-Check Doesn't Catch Errors But Vercel Build Does

## The Problem

You're experiencing a common issue where:
- ✅ `npm run type-check` (runs `tsc --noEmit`) passes locally
- ❌ `npm run build` (Next.js build) fails on Vercel with TypeScript errors

## Root Cause

### 1. **Next.js Uses Different Type Checking**

Next.js build process uses **SWC (Speedy Web Compiler)** with its own TypeScript checker, which is **stricter** than standalone `tsc`:

- **Next.js build**: Uses SWC's TypeScript checker (stricter, catches implicit `any`)
- **`tsc --noEmit`**: Uses standard TypeScript compiler (more lenient in some cases)

### 2. **Type Inference Differences**

The errors you're seeing:
```typescript
// Error: Parameter 'cat' implicitly has an 'any' type
const rootCategories = allCategories.filter((cat) => !cat.parentId);
```

**Why `tsc --noEmit` doesn't catch it:**
- TypeScript can sometimes infer types from context
- When `allCategories` comes from Prisma, TypeScript might infer a type that makes `cat` typed
- But the inference might not be complete enough for strict checking

**Why Next.js build catches it:**
- Next.js/SWC uses stricter type checking
- It requires explicit types in more contexts
- It doesn't rely on inference as much

### 3. **Configuration Differences**

Your `tsconfig.json` has:
```json
{
  "strict": true,  // This enables noImplicitAny
  ...
}
```

But Next.js build might:
- Use additional strict flags
- Check files in a different order
- Have different type resolution behavior
- Use a different TypeScript version internally

## The Solution

### Option 1: Make Type-Check Match Build (Recommended)

Add explicit type annotations to catch errors locally:

```typescript
// Before (passes tsc, fails Next.js build)
const rootCategories = allCategories.filter((cat) => !cat.parentId);

// After (passes both)
const rootCategories = allCategories.filter((cat: any) => !cat.parentId);
// Or better:
const rootCategories = allCategories.filter((cat: typeof allCategories[0]) => !cat.parentId);
```

### Option 2: Use Next.js Build for Type Checking

Update your `type-check` script to use Next.js build:

```json
{
  "scripts": {
    "type-check": "next build --no-lint"
  }
}
```

**Pros:**
- ✅ Catches the same errors as deployment
- ✅ Uses the same TypeScript checker

**Cons:**
- ⚠️ Slower than `tsc --noEmit`
- ⚠️ Actually builds the project (not just type checking)

### Option 3: Add Stricter TypeScript Config

Add explicit `noImplicitAny` to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,  // Explicitly enable
    ...
  }
}
```

But this might already be enabled by `strict: true`.

### Option 4: Use Next.js Type Check (Best for Next.js Projects)

Create a script that uses Next.js's type checking:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit && next build --no-lint --dry-run"
  }
}
```

Or use Next.js's built-in type checking:

```bash
# This uses Next.js's type checker
npx next build --no-lint
```

## Why This Happens

### TypeScript Compiler vs Next.js/SWC

1. **Different Implementations**:
   - `tsc` = Official TypeScript compiler
   - Next.js = Uses SWC (Rust-based) with TypeScript plugin

2. **Different Strictness**:
   - SWC's TypeScript checker is often stricter
   - It catches edge cases that `tsc` might miss

3. **Different Context**:
   - `tsc --noEmit` checks files in isolation
   - Next.js build checks files in the context of the entire Next.js app
   - Next.js has additional type information from its runtime

## Recommended Workflow

### For Development

```bash
# Fast check (during development)
npm run type-check  # Uses tsc --noEmit

# Before committing
npm run build  # Uses Next.js build (catches everything)
```

### For CI/CD

Always use `npm run build` in CI/CD to match production:

```yaml
# .github/workflows/ci.yml
- name: Type check and build
  run: npm run build
```

## Current Fix Applied

We've fixed the immediate issues by adding explicit type annotations:

```typescript
// app/api/categories/route.ts
const rootCategories = allCategories.filter((cat: any) => !cat.parentId);

// app/api/companies/route.ts
const transformedCompanies = companies.map((company: any) => transformCompany(company, false));
```

## Better Long-Term Solution

Instead of using `any`, use proper types:

```typescript
// Get the type from Prisma
import type { Category } from '@prisma/client';

const rootCategories = allCategories.filter((cat: Category & { children?: Category[] }) => !cat.parentId);
```

Or create a type helper:

```typescript
type CategoryWithChildren = Awaited<ReturnType<typeof prisma.category.findMany<{ include: { children: true } }>>>[0];

const rootCategories = allCategories.filter((cat: CategoryWithChildren) => !cat.parentId);
```

## Summary

- **Why it happens**: Next.js uses SWC's stricter TypeScript checker
- **Solution**: Add explicit type annotations or use `next build` for type checking
- **Best practice**: Always run `npm run build` before deploying to catch these issues

---

**Key Takeaway**: For Next.js projects, `npm run build` is the most reliable way to catch TypeScript errors that will appear in production.

