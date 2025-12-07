# Backend Setup Instructions

## Quick Fix for 500 Internal Server Error

The error occurs because the database is not initialized. Follow these steps:

### Step 1: Create .env file

Create a `.env` file in the project root with:

```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
JWT_SECRET=your-secret-key-here-min-32-chars-for-production
```

**Note**: `JWT_SECRET` is optional in development for public endpoints (like viewing products), but required for authentication features. Generate a secure secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Generate Prisma Client

```bash
npm run db:generate
```

### Step 3: Create Database and Run Migrations

```bash
npm run db:migrate
```

### Step 4: Seed the Database

```bash
npm run db:seed
```

### Step 5: Verify Database

```bash
npm run db:verify
```

## All-in-One Command

Run all setup steps at once:

```bash
npm run db:generate && npm run db:migrate && npm run db:seed
```

## Check Backend Status

Run the diagnostic script:

```bash
tsx scripts/check-backend.ts
```

## Common Issues

### Issue: "Database file not found"
**Solution:** Run `npm run db:migrate` to create the database file.

### Issue: "Prisma client not generated"
**Solution:** Run `npm run db:generate` to generate the Prisma client.

### Issue: "DATABASE_URL not set"
**Solution:** Create a `.env` file with `DATABASE_URL="file:./prisma/dev.db"`

### Issue: "Database is empty"
**Solution:** Run `npm run db:seed` to populate the database with initial data.

## After Setup

Once the database is set up, the API routes should work correctly:
- `/api/products` - List products
- `/api/categories` - List categories  
- `/api/companies` - List companies

