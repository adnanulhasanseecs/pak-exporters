# Fix Empty Products, Categories, and Blog Pages - Step-by-Step Guide

## Current Status

### Data Sources Found:
- ✅ **JSON Mock Data Files:**
  - `services/mocks/products.json` - **28 products**
  - `services/mocks/categories.json` - **14 categories**
  - `services/mocks/blog.json` - **13 blog posts**

- ✅ **Database Configuration:**
  - Prisma schema is configured for **PostgreSQL** (`provider = "postgresql"`)
  - Project has migrated from SQLite to PostgreSQL

## Step-by-Step Solution

### Step 1: Check Current Database Status

Run the diagnostic script to see what's in your database:

```bash
tsx scripts/check-backend.ts
```

This will show you:
- If the database connection works
- How many products, categories, and companies are in the database
- If the database is empty

**Expected Output:**
- If database is empty: `📊 Products in database: 0`
- If database has data: `📊 Products in database: 28`

---

### Step 2: Check Your Database Configuration

Check your `.env.local` or `.env` file:

```bash
# Windows PowerShell
Get-Content .env.local
```

**What to look for:**
- `DATABASE_URL` should point to PostgreSQL: `DATABASE_URL="postgresql://..."`

**Expected Format:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pak_exporters?schema=public"
```

---

### Step 3: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL:**
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt install postgresql postgresql-contrib`

2. **Create Database:**
   ```bash
   psql -U postgres
   CREATE DATABASE pak_exporters;
   \q
   ```

3. **Update .env.local:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pak_exporters?schema=public"
   ```

#### Option B: Docker PostgreSQL (Recommended for Development)

1. **Run PostgreSQL in Docker:**
   ```bash
   docker run --name pak-exporters-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pak_exporters -p 5432:5432 -d postgres:15
   ```

2. **Update .env.local:**
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pak_exporters?schema=public"
   ```

3. **Verify Docker Container is Running:**
   ```bash
   docker ps
   ```

#### Step 4: Initialize Database

1. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

2. **Run Migrations:**
   ```bash
   npm run db:migrate
   ```

3. **Seed Database from JSON Files:**
   ```bash
   npm run db:seed
   ```

---

### Step 5: Clean Up SQLite Files (Optional)

Since you've migrated to PostgreSQL, you can safely delete the old SQLite database files:

```bash
# Windows PowerShell
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item prisma/dev.db -ErrorAction SilentlyContinue

# Or manually delete:
# - dev.db (in project root)
# - prisma/dev.db
```

**Note:** These files are no longer needed since you're using PostgreSQL.

---

### Step 6: Verify Database Has Data

After seeding, verify the data:

```bash
tsx scripts/check-backend.ts
```

**Expected Output:**
```
✅ Database connection successful
📊 Products in database: 28
📊 Categories in database: 14
📊 Companies in database: 6
```

---

### Step 7: Test API Routes Locally

Start your development server:

```bash
npm run dev
```

Then test the API routes in your browser or using curl:

1. **Test Products API:**
   ```
   http://localhost:3001/api/products
   ```

2. **Test Categories API:**
   ```
   http://localhost:3001/api/categories
   ```

3. **Test Blog API:**
   ```
   http://localhost:3001/api/blog?published=true
   ```

**Expected Response:**
- Should return JSON with products/categories/blog posts
- If database fails, should fallback to JSON mock data automatically

---

### Step 8: Verify Frontend Pages

Visit these pages in your browser:

1. **Products Page:**
   ```
   http://localhost:3001/products
   ```

2. **Categories Page:**
   ```
   http://localhost:3001/categories
   ```

3. **Blog Page:**
   ```
   http://localhost:3001/blog
   ```

**Expected Result:**
- Pages should display products, categories, and blog posts
- If empty, check browser console for errors

---

### Step 9: For Vercel Deployment

If pages are empty on Vercel:

1. **Check Vercel Environment Variables:**
   ```bash
   vercel env ls
   ```

2. **Ensure DATABASE_URL is set:**
   - For Vercel Postgres: Use the connection string from Vercel dashboard
   - For external PostgreSQL: Use your production database URL

3. **Run Migrations on Vercel:**
   ```bash
   npm run db:migrate:prod
   ```

4. **Seed Production Database:**
   - You may need to run the seed script manually on production
   - Or ensure your production database has data

---

## Quick Fix Commands (If Database is Empty)

If your PostgreSQL database is empty, run these commands in order:

```bash
# 1. Ensure PostgreSQL is running
# Check Docker: docker ps
# Or check local PostgreSQL service

# 2. Verify DATABASE_URL in .env.local points to PostgreSQL
# Should be: DATABASE_URL="postgresql://..."

# 3. Generate Prisma Client
npm run db:generate

# 4. Run migrations (creates database tables)
npm run db:migrate

# 5. Seed database from JSON files
npm run db:seed

# 6. Verify data was loaded
tsx scripts/check-backend.ts

# 7. Start dev server
npm run dev
```

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution:** 
- Check `DATABASE_URL` in `.env.local`
- Ensure database file exists (for SQLite) or PostgreSQL is running (for PostgreSQL)
- Run `npm run db:generate` to regenerate Prisma client

### Issue: "Database is empty"
**Solution:**
- Run `npm run db:seed` to load data from JSON files
- Verify with `tsx scripts/check-backend.ts`

### Issue: "Pages still empty after seeding"
**Solution:**
- Check browser console for errors
- Test API routes directly: `http://localhost:3001/api/products`
- Verify API routes are using fallback to JSON if database fails
- Check that `services/mocks/*.json` files exist and have data

### Issue: "Can't reach database server" or "Connection refused"
**Solution:**
- Ensure PostgreSQL is running:
  - Docker: `docker ps` (check if container is running)
  - Local: Check PostgreSQL service status
- Verify `DATABASE_URL` in `.env.local` has correct host, port, username, password
- Test connection: `psql -U postgres -h localhost -d pak_exporters`

### Issue: "Database does not exist"
**Solution:**
- Create the database: `psql -U postgres -c "CREATE DATABASE pak_exporters;"`
- Or use Docker with `POSTGRES_DB=pak_exporters` environment variable

---

## Summary

**The root cause** of empty pages is likely:
1. PostgreSQL database is empty (no data seeded)
2. PostgreSQL connection is failing (server not running, wrong credentials)
3. `DATABASE_URL` not set or incorrect in `.env.local`

**The solution:**
1. Ensure PostgreSQL is running (Docker or local installation)
2. Set correct `DATABASE_URL` in `.env.local` pointing to PostgreSQL
3. Run migrations to create database tables
4. Seed the database from JSON files
5. Verify data is loaded
6. Test API routes and frontend pages

