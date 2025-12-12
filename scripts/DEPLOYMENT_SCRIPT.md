# Vercel Deployment Script

## Overview

The `deploy-vercel.ts` script combines all deployment layers from `FINAL_SOLUTION_SUMMARY.md` into a single, automated deployment process. This script ensures your code passes all checks before deploying to Vercel.

## Features

### ✅ Pre-Deployment Checks (Layer 1)
- **Git Status Check**: Ensures no uncommitted changes
- **Node.js Version Check**: Verifies Node.js 18+ is installed
- **Build Cache Cleanup**: Clears `.next` directory (matches Vercel's clean build)
- **File Encoding Validation**: Validates all files have correct encoding
- **TypeScript Strict Check**: Runs `type-check:strict` (catches Vercel build errors)
- **Vercel Build Check**: Runs full build check (matches Vercel's build process exactly)

### ✅ Authentication & Setup (Layer 2)
- **Vercel CLI Check**: Verifies Vercel CLI is installed
- **Authentication Check**: Ensures you're logged into Vercel

### ✅ Environment Variables (Layer 3)
- **Required Variables Check**: Verifies `JWT_SECRET` and `NEXT_PUBLIC_APP_URL` are set
- **Optional Variables Check**: Warns about missing optional variables

### ✅ Deployment (Layer 4)
- **Preview Deployment**: Default mode for testing
- **Production Deployment**: Use `--prod` flag for production

### ✅ Post-Deployment Verification (Layer 5)
- **Deployment Status Check**: Verifies deployment succeeded
- **URL Extraction**: Saves deployment URL to `.vercel-deployment-url.txt`

## Usage

### Preview Deployment (Recommended for Testing)

```bash
npm run deploy:vercel
```

### Production Deployment

```bash
npm run deploy:vercel:prod
```

Or:

```bash
npm run deploy:vercel -- --prod
```

### Skip Pre-Deployment Checks (Not Recommended)

```bash
npm run deploy:vercel -- --skip-checks
```

⚠️ **Warning**: Only use `--skip-checks` if you're absolutely sure your code is ready. This bypasses all safety checks.

## What the Script Does

1. **Pre-Deployment Checks** (from `FINAL_SOLUTION_SUMMARY.md`):
   - Checks Git status (no uncommitted changes)
   - Validates Node.js version (18+)
   - Cleans build cache
   - Validates file encoding
   - Runs TypeScript strict check
   - Runs full build check (same as Vercel)

2. **Authentication**:
   - Verifies Vercel CLI is installed
   - Checks if you're logged in

3. **Environment Variables**:
   - Checks required variables are set
   - Warns about missing optional variables

4. **Deployment**:
   - Deploys to Vercel (preview or production)
   - Extracts and saves deployment URL

5. **Post-Deployment**:
   - Verifies deployment status
   - Provides next steps

## Exit Codes

- `0`: Success - Deployment completed
- `1`: Failure - Check failed or deployment failed

## Error Handling

The script will exit early if:
- ❌ Uncommitted Git changes detected
- ❌ Node.js version < 18
- ❌ File encoding validation fails
- ❌ TypeScript strict check fails
- ❌ Build check fails
- ❌ Vercel CLI not installed
- ❌ Not authenticated with Vercel
- ❌ Missing required environment variables (production only)
- ❌ Deployment fails

## Output Files

After successful deployment, the script creates:
- `.vercel-deployment-url.txt`: Contains the deployment URL

## Integration with FINAL_SOLUTION_SUMMARY.md

This script implements all the checks mentioned in `FINAL_SOLUTION_SUMMARY.md`:

✅ **TypeScript Strict Check**: `npm run type-check:strict`
✅ **Build Check**: `npm run build:check` (matches Vercel exactly)
✅ **Encoding Validation**: `npm run validate:encoding`

## Best Practices

1. **Always run before pushing to GitHub**:
   ```bash
   npm run deploy:vercel
   ```

2. **Test preview deployment first**:
   ```bash
   npm run deploy:vercel
   # Test the preview URL
   # If everything works, deploy to production
   npm run deploy:vercel:prod
   ```

3. **Fix errors before deploying**:
   - If pre-deployment checks fail, fix the errors
   - Don't use `--skip-checks` to bypass errors
   - The checks exist to prevent Vercel deployment failures

4. **Monitor after deployment**:
   - Check the deployment URL
   - Test key pages
   - Monitor Vercel Dashboard for errors

## Troubleshooting

### "Vercel CLI not found"
```bash
npm i -g vercel
```

### "Not authenticated with Vercel"
```bash
vercel login
```

### "TypeScript strict check failed"
- Fix TypeScript errors in your code
- Run `npm run type-check:strict` to see specific errors
- Follow patterns from `FINAL_SOLUTION_SUMMARY.md`

### "Build check failed"
- This is the same check Vercel runs
- Fix the errors shown
- Run `npm run build:check` to see detailed errors

### "Missing required environment variables"
```bash
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

## Related Documentation

- `FINAL_SOLUTION_SUMMARY.md`: Pre-deployment check patterns
- `VERCEL_DEPLOYMENT_FIX.md`: Security vulnerability fixes
- `VERCEL_SETUP_GUIDE.md`: Initial Vercel setup
- `DEPLOYMENT_CHECKLIST.md`: Complete deployment checklist

## Example Output

```
============================================================
🚀 Vercel Deployment Script
============================================================

ℹ️  Preview deployment mode (use --prod for production)

1️⃣  Pre-Deployment Checks
   ℹ️  Checking Git status...
   ✅ No uncommitted changes
   ℹ️  Checking Node.js version...
   ✅ Node.js v20.10.0 (required: 18+)
   ℹ️  Cleaning build cache...
   ✅ Cleared .next directory
   ℹ️  Validating file encoding...
   ✅ File encoding validation passed
   ℹ️  Running strict TypeScript check...
   ✅ TypeScript strict check passed
   ℹ️  Running Vercel-compatible build check...
   ✅ Build check passed - ready for Vercel!

2️⃣  Vercel Authentication
   ℹ️  Checking Vercel CLI...
   ✅ Vercel CLI installed
   ℹ️  Checking Vercel authentication...
   ✅ Authenticated as: adnanulhassan-9470

3️⃣  Environment Variables Check
   ℹ️  Checking required environment variables in Vercel...
   ✅ All required environment variables are set

4️⃣  Deploying to Vercel
   ℹ️  Deployment mode: PREVIEW
   ℹ️  Starting deployment...
   ✅ Deployment successful!
   🌐 URL: https://pak-exporters-abc123.vercel.app

5️⃣  Post-Deployment Verification
   ℹ️  Checking deployment status...
   ✅ Latest deployment is ready

============================================================
✅ Deployment Process Complete!
============================================================

ℹ️  Next steps:
ℹ️  1. Visit your deployment URL to verify it's working
ℹ️  2. Test key pages (homepage, products, categories)
ℹ️  3. Check Vercel Dashboard for detailed logs
ℹ️  4. Monitor for any runtime errors

🎉 All done!
```

---

**Key Takeaway**: This script ensures your code will pass Vercel's build process by running the exact same checks locally first.

