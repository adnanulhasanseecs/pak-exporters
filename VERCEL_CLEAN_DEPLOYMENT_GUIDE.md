# Complete Guide: Clean Vercel Deployment & Fix Environment Variables

## Why Vercel Might Be Using Old Values

Even if you set environment variables correctly, Vercel might use old cached values because:
1. **Build Cache**: Vercel caches builds and might use old environment variables
2. **Function Cache**: Serverless functions might be cached with old connection strings
3. **Environment Variable Caching**: Vercel might cache env vars during build
4. **Multiple Environments**: Different values for Production vs Preview vs Development

## Step 1: Clear Vercel Build Cache

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `pak-exporters`

2. **Navigate to Deployments**
   - Click **Deployments** tab (left sidebar)
   - Find your latest deployment

3. **Clear Build Cache**
   - Click on the deployment (three dots menu) → **Redeploy**
   - **IMPORTANT**: Check the box **"Use existing Build Cache"** → **UNCHECK IT**
   - Click **Redeploy**

   OR

   - Go to **Settings** → **General**
   - Scroll down to **Build & Development Settings**
   - Look for **"Clear Build Cache"** or **"Rebuild"** option

### Method 2: Via Vercel CLI

```bash
# Clear build cache and redeploy
vercel --force

# Or for production
vercel --prod --force
```

### Method 3: Delete and Recreate Project (Nuclear Option)

If nothing else works:
1. Go to Vercel Dashboard → Project Settings
2. Scroll to bottom → **Delete Project**
3. Create a new project and import your repository
4. Set environment variables fresh

## Step 2: Fix Environment Variables in Vercel

### Step-by-Step Guide

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `pak-exporters`

2. **Navigate to Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Check ALL Environments**
   - You'll see three columns: **Production**, **Preview**, **Development**
   - Check each one separately

4. **For Each Environment, Verify These Variables:**

   #### DATABASE_URL (Required)
   - **Key**: `DATABASE_URL`
   - **Value**: `postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require`
   - **Environment**: Check ALL (Production, Preview, Development)
   - **Action**: 
     - If it shows `localhost:5433` → Click **Edit** → Update to correct value → **Save**
     - If missing → Click **Add New** → Add the value → **Save**

   #### DATABASE_PRISMA_DATABASE_URL (Recommended)
   - **Key**: `DATABASE_PRISMA_DATABASE_URL`
   - **Value**: `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19DNW51c3VCU05rWWc5dFB5NXlqcjQiLCJhcGlfa2V5IjoiMDFLQzlaNTJZUlZKR1pNVkFYODYwOU1FUFoiLCJ0ZW5hbnRfaWQiOiJjNjBiZTdiNjkzZmE2NGZiYjRmOWVjNjA4MmZlNzFlN2I2Mzg0YjIzZmM5Nzc1Yzk1OTRhMTgxNTg1YWU1OGZjIiwiaW50ZXJuYWxfc2VjcmV0IjoiZDg3NTU5ZjAtOWU2YS00ZGI2LTg4ODQtOTcyNDNhY2U2Y2ZhIn0.L0EiNs9gc5BkQEReB99KLvO7QOsinfqTqU4p_QlmjnU`
   - **Environment**: Check ALL (Production, Preview, Development)
   - **Action**: Add if missing, or update if incorrect

   #### NEXT_PUBLIC_APP_URL (Required)
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: 
     - **Production**: `https://pak-exporters.vercel.app` (or your custom domain)
     - **Preview**: `https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app` (or your preview URL)
     - **Development**: `http://localhost:3001` (for local dev)
   - **Environment**: Check ALL
   - **Action**: Ensure it's NOT `localhost` for Production/Preview

   #### JWT_SECRET (Required)
   - **Key**: `JWT_SECRET`
   - **Value**: Your JWT secret (min 32 characters)
   - **Environment**: Check ALL

5. **Delete Wrong Variables**
   - If you see `DATABASE_URL` with value `localhost:5433`:
     - Click the **trash icon** (delete) next to it
     - Confirm deletion
   - If you see duplicate `DATABASE_URL` variables:
     - Delete the wrong one
     - Keep only the correct one

6. **Verify After Setting**
   - Click the **eye icon** 👁️ next to each variable to view the value
   - Make sure it's correct (not localhost)

## Step 3: Force Fresh Deployment

After fixing environment variables:

1. **Redeploy with Cleared Cache**
   - Go to **Deployments** tab
   - Click on latest deployment → **Redeploy**
   - **UNCHECK** "Use existing Build Cache"
   - Click **Redeploy**

2. **Or Trigger New Deployment**
   - Make a small change to your code (add a comment)
   - Commit and push:
     ```bash
     git commit --allow-empty -m "chore: trigger fresh deployment"
     git push
     ```

## Step 4: Verify After Deployment

1. **Check Build Logs**
   - Go to deployment → **Build Logs**
   - Look for:
     ```
     [Prisma Init] Environment check: {
       DATABASE_PRISMA_DATABASE_URL: ✅ Set
       DATABASE_URL: ✅ Set
     }
     🔌 [Prisma Init] Will connect to: db.prisma.io:5432
     ```
   - Should NOT show `localhost:5433`

2. **Check Function Logs**
   - Go to deployment → **Functions** tab
   - Click on a function (e.g., `api/products`)
   - Look for connection logs

3. **Test API Endpoint**
   - Visit: `https://your-deployment.vercel.app/api/products`
   - Should return data, not error

## Common Issues & Solutions

### Issue 1: "Can't edit environment variables"
- **Solution**: Some variables might be "managed" by Vercel (like `VERCEL_URL`)
- You can't edit managed variables, but you can add your own

### Issue 2: "Environment variable not updating"
- **Solution**: 
  1. Delete the variable
  2. Add it again with correct value
  3. Redeploy with cleared cache

### Issue 3: "Different values for different environments"
- **Solution**: Make sure you set the variable for ALL environments:
  - Production
  - Preview
  - Development

### Issue 4: "Build still uses old values"
- **Solution**:
  1. Clear build cache (uncheck "Use existing Build Cache")
  2. Delete `.vercel` folder locally (if exists)
  3. Redeploy

## Quick Checklist

- [ ] Checked all three environments (Production, Preview, Development)
- [ ] `DATABASE_URL` is correct (not localhost) for ALL environments
- [ ] `DATABASE_PRISMA_DATABASE_URL` is set for ALL environments
- [ ] `NEXT_PUBLIC_APP_URL` is correct (not localhost) for Production/Preview
- [ ] Deleted any `localhost:5433` values
- [ ] Cleared build cache before redeploying
- [ ] Verified logs after deployment show correct connection

## Nuclear Option: Complete Reset

If nothing works:

1. **Delete Project**
   - Vercel Dashboard → Settings → Delete Project

2. **Create New Project**
   - Import your GitHub repository
   - Set all environment variables fresh
   - Deploy

This ensures no cached values interfere.

