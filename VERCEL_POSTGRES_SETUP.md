# Vercel Postgres Setup Guide

## Step 1: Create Database on Vercel

1. Go to **Vercel Dashboard** → **pak-exporters** project
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Prisma Postgres** (or **Postgres** if that's the only option)
5. Click **Create**

This will:
- ✅ Create a PostgreSQL database
- ✅ Automatically set `DATABASE_URL` environment variable
- ✅ Configure it for your project

## Step 2: Verify DATABASE_URL is Set

After creating the database, verify the environment variable:

```bash
vercel env ls
```

You should see `DATABASE_URL` listed.

## Step 3: Pull Environment Variables Locally (Optional)

To use the production database URL locally for testing:

```bash
vercel env pull .env.production
```

**Note:** This creates a `.env.production` file. Don't commit this file!

## Step 4: Run Migrations on Vercel

After the database is created, you need to create the tables. You have two options:

### Option A: Run Migrations via Vercel CLI (Recommended)

```bash
# Pull production environment variables
vercel env pull .env.production

# Run migrations against production database
npm run db:migrate:prod
```

### Option B: Run Migrations via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Copy the `DATABASE_URL` value
3. Set it locally temporarily:
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://..."
   ```
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Step 5: Seed the Database

After migrations are complete, seed the database with your JSON data:

```bash
# Make sure DATABASE_URL points to Vercel Postgres
# Then run:
npm run db:seed
```

**Note:** You'll need to set `DATABASE_URL` to the Vercel Postgres URL before running this.

## Step 6: Verify Data is Loaded

Check that data was seeded:

```bash
# Pull Vercel environment
vercel env pull .env.production

# Set DATABASE_URL from .env.production
# Then run:
npx tsx scripts/check-backend.ts
```

## Step 7: Redeploy

After setting up the database and seeding:

```bash
npm run deploy:vercel:prod
```

Or push to your main branch if you have auto-deploy enabled.

## Troubleshooting

### Issue: "Can't reach database server"
**Solution:** 
- Verify `DATABASE_URL` is set in Vercel Dashboard
- Check that the database was created successfully
- Ensure you're using the correct connection string format

### Issue: "Database does not exist"
**Solution:**
- The database should be created automatically when you add it via Vercel Dashboard
- Check Storage tab to see if database exists

### Issue: "Migrations fail"
**Solution:**
- Make sure Prisma Client is generated: `npm run db:generate`
- Check that `DATABASE_URL` is correct
- Verify network connectivity to Vercel Postgres

## Next Steps

After setup:
1. ✅ Database created on Vercel
2. ✅ Migrations run (tables created)
3. ✅ Database seeded (data loaded)
4. ✅ Redeploy application
5. ✅ Test pages on Vercel URL

Your products, categories, and blog pages should now display content!

