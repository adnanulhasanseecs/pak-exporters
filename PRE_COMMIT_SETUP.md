# Pre-Commit Setup Guide

## Problem

Local builds (`npm run build`) weren't catching TypeScript errors that Vercel's build process catches, causing failed deployments.

## Solution

We've set up a comprehensive pre-commit check system that ensures your local build matches Vercel's build process.

## What Was Added

### 1. Stricter TypeScript Configuration

**Updated `tsconfig.json`:**
- Added explicit `noImplicitAny: true` (catches implicit any types)
- Added `strictNullChecks: true` (catches null/undefined issues)
- Added `strictFunctionTypes: true` (stricter function type checking)

### 2. New Build Check Script

**Created `scripts/vercel-build-check.ts`:**
- Clears `.next` cache (ensures fresh build)
- Runs strict TypeScript check
- Runs Next.js build (same as Vercel)
- Uses production environment variables

### 3. New npm Scripts

**Added to `package.json`:**
```json
{
  "type-check:strict": "tsc --noEmit --strict",
  "build:check": "tsx scripts/vercel-build-check.ts",
  "prebuild": "npm run type-check:strict"
}
```

### 4. Pre-Commit Hook

**Created `.husky/pre-commit`:**
- Runs strict type check before commit
- Runs build check (matches Vercel) before commit
- Prevents committing code that will fail on Vercel

## Setup Instructions

### Step 1: Install Husky (if not already installed)

```bash
npm install --save-dev husky
npx husky install
```

### Step 2: Make Pre-Commit Hook Executable

```bash
# On Windows (PowerShell)
icacls .husky\pre-commit /grant Everyone:RX

# On Mac/Linux
chmod +x .husky/pre-commit
```

### Step 3: Test the Setup

```bash
# Test strict type check
npm run type-check:strict

# Test build check (matches Vercel)
npm run build:check
```

## Usage

### Before Committing

**Option 1: Automatic (Recommended)**
- Just commit normally: `git commit -m "your message"`
- Pre-commit hook will run automatically
- If checks fail, commit is blocked

**Option 2: Manual Check**
```bash
# Run the same checks that Vercel runs
npm run build:check
```

### Before Pushing to GitHub

Always run:
```bash
npm run build:check
```

This ensures your code will pass Vercel's build process.

## What Each Check Does

### `npm run type-check:strict`
- Runs TypeScript compiler with `--strict` flag
- Catches implicit `any` types
- Catches null/undefined issues
- **Fast** (~10-15 seconds)

### `npm run build:check`
- Clears `.next` cache
- Runs strict TypeScript check
- Runs full Next.js build (same as Vercel)
- **Slower** (~1-2 minutes) but catches everything

### `npm run build`
- Now includes `prebuild` hook
- Automatically runs `type-check:strict` before building
- Ensures type errors are caught early

## Workflow

### During Development
```bash
# Fast check (during coding)
npm run type-check

# Quick check (before saving)
npm run quick-check
```

### Before Committing
```bash
# Automatic via pre-commit hook
git commit -m "your message"
# OR manually:
npm run build:check
```

### Before Pushing
```bash
# Always run this before pushing
npm run build:check
```

## Troubleshooting

### Pre-Commit Hook Not Running

**Check if Husky is installed:**
```bash
npm list husky
```

**Reinstall Husky:**
```bash
npm install --save-dev husky
npx husky install
```

### Build Check Fails Locally But Works on Vercel

**Clear all caches:**
```bash
rm -rf .next node_modules/.cache
npm run build:check
```

### Type Check Passes But Build Fails

This means Next.js is catching errors that `tsc` doesn't. Use:
```bash
npm run build:check  # This catches everything
```

## Benefits

✅ **Catch errors before committing** - No more failed Vercel deployments
✅ **Match Vercel's build process** - Local build = Vercel build
✅ **Faster feedback** - Know about errors immediately
✅ **Consistent checks** - Same checks locally and on Vercel

## Summary

- **Before**: Local build passed, Vercel build failed
- **After**: Local build check matches Vercel exactly
- **Result**: No more surprises on Vercel!

---

**Key Command**: Always run `npm run build:check` before pushing to ensure your code will pass Vercel's build.

