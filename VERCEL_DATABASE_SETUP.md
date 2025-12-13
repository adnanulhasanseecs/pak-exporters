# Vercel Database Setup Guide

## Problem
Pages are empty because `DATABASE_URL` is not set in Vercel. The project uses PostgreSQL and needs a database connection.

## Solution: Set Up Vercel Postgres

### Option 1: Vercel Postgres (Recommended - Easiest)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Select your project: `pak-exporters`

2. **Add Postgres Database**:
   - Click on **Storage** tab (in left sidebar)
   - Click **Create Database**
   - Select **Postgres**
   - Choose a region (e.g., `Washington, D.C. (iad1)`)
   - Click **Create**

3. **Get Connection String**:
   - After creation, you'll see connection strings
   - Copy the `POSTGRES_PRISMA_URL` (recommended for Prisma)
   - Or use `POSTGRES_URL_NON_POOLING` if Prisma URL doesn't work

4. **Set DATABASE_URL Environment Variable**:
   ```bash
   # Via CLI (replace with your actual connection string)
   echo "your-postgres-prisma-url-here" | vercel env add DATABASE_URL production
   echo "your-postgres-prisma-url-here" | vercel env add DATABASE_URL preview
   echo "your-postgres-prisma-url-here" | vercel env add DATABASE_URL development
   ```
   
   Or via Dashboard:
   - Go to **Settings** → **Environment Variables**
   - Click **Add New**
   - Key: `DATABASE_URL`
   - Value: Paste the `POSTGRES_PRISMA_URL` from step 3
   - Environment: Select `Production`, `Preview`, and `Development`
   - Click **Save**

5. **Run Database Migrations**:
   ```bash
   # Pull environment variables locally
   vercel env pull .env.production
   
   # Run migrations
   npm run db:migrate:prod
   ```
   
   Or migrations can run automatically on Vercel if you add a build script.

6. **Seed Database** (if needed):
   ```bash
   # After migrations, seed the database
   npm run db:seed
   ```

7. **Redeploy**:
   ```bash
   npm run deploy:vercel:prod
   ```

### Option 2: Supabase (Free Tier Available)

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Sign up/login
   - Click **New Project**
   - Fill in details and create

2. **Get Connection String**:
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Copy the **URI** (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

3. **Set DATABASE_URL in Vercel**:
   ```bash
   echo "your-supabase-connection-string" | vercel env add DATABASE_URL production
   echo "your-supabase-connection-string" | vercel env add DATABASE_URL preview
   ```

4. **Run Migrations**:
   ```bash
   vercel env pull .env.production
   npm run db:migrate:prod
   ```

### Option 3: Railway (Simple PostgreSQL)

1. **Create Railway Account**: https://railway.app
2. **Create PostgreSQL Service**:
   - Click **New Project** → **Add PostgreSQL**
3. **Get Connection String**:
   - Click on PostgreSQL service → **Variables** tab
   - Copy `DATABASE_URL`
4. **Set in Vercel**: Same as Option 2, step 3

## After Setting Up Database

1. **Verify DATABASE_URL is set**:
   ```bash
   vercel env ls
   ```
   Should show `DATABASE_URL` for all environments

2. **Redeploy**:
   ```bash
   npm run deploy:vercel:prod
   ```

3. **Verify Pages Have Content**:
   - Visit `/products` - should show products
   - Visit `/categories` - should show categories  
   - Visit `/blog` - should show blog posts

## Note About Mock Data Fallbacks

The API routes now have JSON mock data fallbacks as a safety net. This means:
- ✅ Site works even if database is temporarily unavailable
- ✅ Good for preview deployments
- ⚠️ But you should set up the real database for production

Once `DATABASE_URL` is set, the API routes will automatically use the database instead of mock data.

## Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is set correctly in Vercel
- Check connection string format (should start with `postgresql://`)
- Ensure database is accessible from Vercel's IP ranges
- For Vercel Postgres, this should work automatically

### "Migrations not running"
- Add migration script to `package.json`:
  ```json
  "vercel-build": "prisma generate && prisma migrate deploy && next build"
  ```
- Or run migrations manually after deployment

### "No data in database"
- Run seed script: `npm run db:seed`
- Or manually import data from your local database

