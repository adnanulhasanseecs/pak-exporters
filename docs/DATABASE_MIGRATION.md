# Database Migration Guide

This guide explains how to manage database migrations for Pak-Exporters.

## Overview

The application uses Prisma as the ORM and supports both SQLite (development) and PostgreSQL (production).

## Migration Workflow

### Development

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration:**
   ```bash
   npm run db:migrate
   ```
   This creates a new migration file and applies it to your development database.

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```
   Or it's automatically done during migration.

### Production

1. **Prepare migrations:**
   - Ensure all migrations are committed to the repository
   - Test migrations on a staging environment first

2. **Run migrations:**
   ```bash
   NODE_ENV=production tsx scripts/migrate-production.ts
   ```
   Or manually:
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify migration:**
   - Check database tables
   - Verify data integrity
   - Test application functionality

## Migration Scripts

### `scripts/migrate-production.ts`
- Validates environment variables
- Generates Prisma Client
- Runs migrations
- Verifies database connection
- Shows database statistics

**Usage:**
```bash
NODE_ENV=production DATABASE_URL="postgresql://..." tsx scripts/migrate-production.ts
```

### `scripts/rollback-migration.ts`
- Shows last migration
- Provides rollback guidance
- Note: Prisma doesn't have automatic rollback

**Usage:**
```bash
tsx scripts/rollback-migration.ts
```

## Database Providers

### SQLite (Development)
- **File:** `dev.db`
- **Connection String:** `file:./dev.db`
- **Pros:** Simple, no setup required
- **Cons:** Not suitable for production

### PostgreSQL (Production)
- **Recommended Providers:**
  - Vercel Postgres
  - Supabase
  - AWS RDS
  - Railway
  - Render
- **Connection String:** `postgresql://user:password@host:5432/database?schema=public`
- **Pros:** Production-ready, scalable, ACID compliant
- **Cons:** Requires setup

## Migration Best Practices

1. **Always test migrations locally first**
2. **Create backups before running production migrations**
3. **Run migrations during low-traffic periods**
4. **Monitor migration progress**
5. **Have a rollback plan ready**

## Troubleshooting

### Migration Fails

1. **Check database connection:**
   ```bash
   npx prisma db pull
   ```

2. **Verify schema:**
   ```bash
   npx prisma validate
   ```

3. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

### Database Out of Sync

1. **Reset database (development only):**
   ```bash
   npx prisma migrate reset
   ```

2. **For production:** Restore from backup and re-run migrations

## CI/CD Integration

Migrations are automatically run in the CI/CD pipeline:

1. Prisma Client is generated
2. Migrations are deployed (if DATABASE_URL is set)
3. Build continues after successful migration

See `.github/workflows/deploy.yml` for details.

## Production Checklist

- [ ] All migrations tested in staging
- [ ] Database backup created
- [ ] Migration script tested
- [ ] Rollback plan prepared
- [ ] Monitoring in place
- [ ] Team notified of migration window

---

**Last Updated:** 2025-01-XX

