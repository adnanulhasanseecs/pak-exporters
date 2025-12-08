# Fast Error Detection Guide

## The Problem
Running `npm run build` is slow and finds errors one-by-one, wasting time.

## The Solution: Use Faster Commands

### ⚡ Quick Error Detection (30 seconds vs 2+ minutes)

Instead of `npm run build`, use these commands in order:

#### 1. TypeScript Type Check (Fastest - ~10 seconds)
```bash
npx tsc --noEmit
```
**What it finds:**
- Type errors
- Missing imports
- Unused variables (if configured)
- Type mismatches

#### 2. ESLint Check (Fast - ~15 seconds)
```bash
npx eslint . --ext .ts,.tsx --max-warnings 0
```
**What it finds:**
- Unused imports/variables
- Code quality issues
- Import order problems

#### 3. Encoding Validation (Very Fast - ~1 second)
```bash
npm run validate:encoding
```
**What it finds:**
- UTF-16 files
- BOM issues
- Invalid encodings

### 🚀 Combined Quick Check

I've added a new script to `package.json`:

```bash
npm run quick-check
```

This runs TypeScript + Encoding validation (fastest combination).

### 📋 Recommended Workflow

**Before committing:**
```bash
# Step 1: Quick check (30 seconds)
npm run quick-check

# Step 2: If quick-check passes, run full build
npm run build
```

**During development:**
```bash
# Run in separate terminal, watches for changes
npx tsc --noEmit --watch
```

### 🎯 What Each Command Catches

| Command | Speed | Catches | When to Use |
|---------|-------|---------|-------------|
| `tsc --noEmit` | ⚡⚡⚡ Fast | Type errors, unused vars | During dev, before commit |
| `eslint .` | ⚡⚡ Fast | Code quality, unused imports | Before commit |
| `npm run quick-check` | ⚡⚡ Fast | Types + Encoding | Before commit |
| `npm run build` | ⚡ Slow | Everything + Next.js build | Final check, CI/CD |

### 💡 Pro Tips

1. **Use TypeScript Watch Mode:**
   ```bash
   npx tsc --noEmit --watch
   ```
   Keep this running - it shows errors as you type!

2. **VS Code Integration:**
   - Install "Error Lens" extension
   - Shows errors inline as you code
   - No need to run commands manually

3. **Pre-commit Hook:**
   Add to `.husky/pre-commit`:
   ```bash
   npm run quick-check
   ```
   Prevents bad commits automatically.

### 🔧 Current Package.json Scripts

```json
{
  "scripts": {
    "quick-check": "npm run type-check && npm run validate:encoding",
    "type-check": "tsc --noEmit",
    "detect-errors": "tsc --noEmit && eslint . --ext .ts,.tsx --max-warnings 0",
    "validate:encoding": "tsx scripts/validate-encoding.ts",
    "prebuild": "npm run validate:encoding"
  }
}
```

### ✅ Summary

**Use this instead of `npm run build` for quick checks:**
```bash
npm run quick-check  # Fast: Types + Encoding (~10-15 seconds)
```

**Only run full build when:**
- Quick-check passes
- Before pushing to main
- In CI/CD pipeline

---

**Time Saved:** ~90% faster error detection! 🎉

