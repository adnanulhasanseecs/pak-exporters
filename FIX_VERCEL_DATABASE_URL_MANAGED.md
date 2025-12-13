# Fix Vercel DATABASE_URL - Managed Connection Guide

**Issue:** `DATABASE_URL` is managed by Vercel and doesn't have a direct "Edit" option.

**Solution:** Use "Manage Connection" or check which database variables Vercel created.

---

## Understanding Vercel Postgres Variables

When you create a Vercel Postgres database, Vercel automatically creates **three** environment variables:

1. **`DATABASE_POSTGRES_URL`** - Direct PostgreSQL connection string
2. **`DATABASE_PRISMA_DATABASE_URL`** - Prisma-optimized connection string (with connection pooling)
3. **`DATABASE_URL`** - Usually points to the Prisma URL (managed by Vercel)

---

## Solution Options

### Option 1: Use "Manage Connection" (Recommended)

1. **Click the three dots (⋯) next to `DATABASE_URL`**
2. **Select "Manage Connection"** from the dropdown
3. This should open a dialog to:
   - Update the connection
   - Reconnect to the database
   - Or select which database to use

4. **If it shows multiple databases:**
   - Select the correct Vercel Postgres database
   - Make sure it's the one you created (not a local one)

5. **Save the changes**

### Option 2: Use DATABASE_PRISMA_DATABASE_URL Instead

If `DATABASE_URL` is managed and can't be changed, you can:

1. **Check if `DATABASE_PRISMA_DATABASE_URL` exists** (it should, based on your screenshot)
2. **Verify its value:**
   - Click the eye icon 👁️ next to `DATABASE_PRISMA_DATABASE_URL`
   - It should show a connection string like: `postgres://...@db.prisma.io:5432/...`
   - **NOT** `localhost:5433`

3. **If `DATABASE_PRISMA_DATABASE_URL` is correct:**
   - Your code should use this variable instead
   - Update `prisma/schema.prisma` to use `DATABASE_PRISMA_DATABASE_URL`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_PRISMA_DATABASE_URL")
     }
     ```

### Option 3: Remove and Re-add DATABASE_URL

If "Manage Connection" doesn't work:

1. **Click the three dots (⋯) next to `DATABASE_URL`**
2. **Select "Remove"** (if available)
3. **Go to Storage tab:**
   - Vercel Dashboard → Your Project → **Storage**
   - Find your Postgres database
   - Click on it
   - Look for "Connection String" or "Environment Variables"
   - Copy the connection string

4. **Manually add DATABASE_URL:**
   - Go back to **Settings** → **Environment Variables**
   - Click **Add New**
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the connection string from Storage
   - **Environments:** Select all (Production, Preview, Development)
   - Click **Save**

### Option 4: Check Storage Tab for Correct Connection

1. **Go to Storage tab:**
   - Vercel Dashboard → Your Project → **Storage**
   - Click on your Postgres database

2. **Check Connection Strings:**
   - Look for "Connection String" or "Environment Variables" section
   - You should see:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`

3. **Verify the connection string:**
   - It should end with `@db.prisma.io:5432/postgres` (NOT `localhost:5433`)
   - Copy the correct one

4. **If the connection string is wrong in Storage:**
   - You may need to recreate the database
   - Or contact Vercel support

---

## Quick Check: Which Variable to Use

**Check your current `DATABASE_URL` value:**

1. Click the **eye icon 👁️** next to `DATABASE_URL` to reveal the value
2. **If it shows:**
   - ✅ `postgres://...@db.prisma.io:5432/...` → **Correct!** (but still getting errors?)
   - ❌ `postgres://...@localhost:5433/...` → **Wrong!** Need to fix

3. **Also check `DATABASE_PRISMA_DATABASE_URL`:**
   - Click the eye icon next to it
   - If this one is correct, use Option 2 above

---

## If DATABASE_URL is Correct but Still Failing

If `DATABASE_URL` already points to `db.prisma.io` but you're still getting errors:

1. **Check if the database is accessible:**
   - The connection string might be correct but the database might not be accessible
   - Check Vercel Storage → Your database → Status

2. **Verify migrations ran:**
   - The database might exist but tables might not be created
   - Run migrations again (see `VERCEL_POSTGRES_SETUP.md`)

3. **Check for connection pooling issues:**
   - Try using `DATABASE_PRISMA_DATABASE_URL` instead (has connection pooling)
   - Or use `POSTGRES_URL_NON_POOLING` for direct connections

---

## Recommended Action Plan

1. ✅ **First:** Click "Manage Connection" on `DATABASE_URL` and see what options appear
2. ✅ **Second:** Check the value of `DATABASE_PRISMA_DATABASE_URL` (click eye icon)
3. ✅ **Third:** If `DATABASE_PRISMA_DATABASE_URL` is correct, update Prisma schema to use it
4. ✅ **Fourth:** Redeploy after making changes

---

## After Fixing

Once the connection string is correct:

1. **Redeploy:**
   ```bash
   git commit --allow-empty -m "trigger: redeploy after database URL fix"
   git push
   ```

2. **Test API routes:**
   - https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
   - Should return JSON data, not connection errors

3. **Check pages:**
   - Products, categories, and blog pages should display content

---

## Still Having Issues?

If none of these options work:

1. **Check Vercel Support:**
   - The database connection might need to be recreated
   - Or there might be a Vercel-specific issue

2. **Verify Database Status:**
   - Go to Storage → Your database
   - Check if it's active and accessible

3. **Check Function Logs:**
   - Vercel Dashboard → Functions tab
   - Look for database connection errors
   - The logs will show the exact connection string being used

