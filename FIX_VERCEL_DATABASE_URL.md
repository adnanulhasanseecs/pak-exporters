# Fix Vercel DATABASE_URL Issue

**Problem:** API routes are trying to connect to `localhost:5433` instead of Vercel Postgres.

**Error:**
```
Can't reach database server at `localhost:5433`
```

**Root Cause:** The `DATABASE_URL` environment variable on Vercel is set to your local database URL instead of the Vercel Postgres connection string.

---

## Solution: Update DATABASE_URL in Vercel

### Step 1: Get the Correct Connection String

Your correct Vercel Postgres connection string is:
```
postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require
```

This is stored in your `.env.production` file.

### Step 2: Update DATABASE_URL in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project: **pak-exporters**

2. **Navigate to Environment Variables:**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Find and Update DATABASE_URL:**
   - Look for `DATABASE_URL` in the list
   - Click the **Edit** button (pencil icon)
   - **Delete the old value** (which is probably `postgresql://...@localhost:5433/...`)
   - **Paste the correct Vercel Postgres connection string:**
     ```
     postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require
     ```
   - **Select environments:** Make sure `Production`, `Preview`, and `Development` are all selected
   - Click **Save**

### Step 3: Verify the Update

After updating, verify it's correct:

```bash
vercel env ls
```

You should see `DATABASE_URL` with the correct value (ending with `@db.prisma.io:5432/postgres`).

### Step 4: Redeploy

After updating the environment variable, you need to redeploy:

**Option A: Automatic Redeploy (Recommended)**
- Just push a new commit to trigger redeploy:
  ```bash
  git commit --allow-empty -m "trigger: redeploy after DATABASE_URL fix"
  git push
  ```

**Option B: Manual Redeploy**
- Go to Vercel Dashboard → Your Project → **Deployments**
- Click the **three dots** (⋯) on the latest deployment
- Click **Redeploy**

### Step 5: Test

After redeployment, test the API routes:
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/categories
- https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/blog?published=true

**Expected Result:** Should return JSON data (not an error about localhost).

---

## Alternative: Update via CLI

If you prefer using the CLI:

```bash
# Remove the old DATABASE_URL
vercel env rm DATABASE_URL production
vercel env rm DATABASE_URL preview
vercel env rm DATABASE_URL development

# Add the correct DATABASE_URL
echo "postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require" | vercel env add DATABASE_URL production
echo "postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require" | vercel env add DATABASE_URL preview
echo "postgres://c60be7b693fa64fbb4fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require" | vercel env add DATABASE_URL development
```

Then redeploy.

---

## Why This Happened

When you set up Vercel Postgres, Vercel should have automatically set the `DATABASE_URL` environment variable. However, it seems like:
1. The variable was set to your local database URL instead
2. Or it was manually set incorrectly
3. Or it wasn't updated after creating Vercel Postgres

---

## Verification Checklist

After fixing:
- ✅ `DATABASE_URL` points to `db.prisma.io:5432` (not `localhost:5433`)
- ✅ Environment variable is set for Production, Preview, and Development
- ✅ Redeployment completed successfully
- ✅ API routes return data (not connection errors)
- ✅ Pages display content (not empty)

---

## Next Steps

Once `DATABASE_URL` is fixed:
1. ✅ API routes will connect to Vercel Postgres
2. ✅ Pages will display products, categories, and blog posts
3. ✅ No more "Can't reach database server" errors

If you still see empty pages after fixing `DATABASE_URL`, check the Server Component HTTP call issue (see `VERCEL_EMPTY_PAGES_DIAGNOSIS.md`).

