# Database Backup & Restore Guide

This guide explains how to backup and restore the Pak-Exporters database.

## Overview

Regular database backups are essential for data protection and disaster recovery. This guide covers both SQLite (development) and PostgreSQL (production) backup procedures.

## Backup Scripts

### Automated Backup

**Script:** `scripts/backup-database.ts`

**Usage:**
```bash
tsx scripts/backup-database.ts
```

**Features:**
- Automatically detects database type (SQLite or PostgreSQL)
- Creates timestamped backup files
- Stores backups in `backups/` directory
- Automatically cleans up backups older than 30 days
- Shows backup file size and location

**Output:**
- SQLite: `backups/backup-YYYY-MM-DDTHH-MM-SS.db`
- PostgreSQL: `backups/backup-YYYY-MM-DDTHH-MM-SS.sql`

### Manual Backup

#### SQLite
```bash
# Simple file copy
cp dev.db backups/backup-$(date +%Y%m%d-%H%M%S).db
```

#### PostgreSQL
```bash
# Using pg_dump
pg_dump "postgresql://user:password@host:5432/database" > backup.sql

# With compression
pg_dump "postgresql://user:password@host:5432/database" | gzip > backup.sql.gz
```

## Restore Scripts

### Automated Restore

**Script:** `scripts/restore-database.ts`

**Usage:**
```bash
tsx scripts/restore-database.ts <backup-file>
```

**Example:**
```bash
tsx scripts/restore-database.ts backups/backup-2025-01-15T10-30-00.db
```

**⚠️ WARNING:** This will overwrite the current database!

### Manual Restore

#### SQLite
```bash
# Stop the application first
cp backups/backup-YYYY-MM-DD.db dev.db
```

#### PostgreSQL
```bash
# Drop and recreate (destructive)
psql "postgresql://user:password@host:5432/database" < backup.sql

# Or restore specific tables
pg_restore -d database backup.dump
```

## Backup Strategy

### Development
- **Frequency:** Before major changes
- **Retention:** 7 days
- **Location:** Local `backups/` directory
- **Automation:** Manual or before migrations

### Production
- **Frequency:** Daily (automated)
- **Retention:** 30 days minimum
- **Location:** Encrypted cloud storage (S3, etc.)
- **Automation:** Cron job or cloud scheduler

## Automated Backup Setup

### Using Cron (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/pak-exporters && tsx scripts/backup-database.ts >> /var/log/pak-exporters-backup.log 2>&1
```

### Using Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 2 AM)
4. Action: Start a program
5. Program: `node`
6. Arguments: `tsx scripts/backup-database.ts`
7. Start in: `C:\path\to\pak-exporters`

### Using Cloud Scheduler (Recommended for Production)

**Vercel/Serverless:**
- Use Vercel Cron Jobs
- Or external service (GitHub Actions, etc.)

**Example GitHub Actions:**
```yaml
name: Daily Backup
on:
  schedule:
    - cron: '0 2 * * *' # 2 AM daily
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: tsx scripts/backup-database.ts
      - uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/
```

## Backup Storage

### Local Storage (Development)
- **Location:** `backups/` directory
- **Pros:** Fast, simple
- **Cons:** Not safe if server fails

### Cloud Storage (Production)
- **Options:**
  - AWS S3 (with encryption)
  - Google Cloud Storage
  - Azure Blob Storage
  - Dropbox/Google Drive (for small databases)

**Best Practices:**
- Encrypt backups at rest
- Use versioning
- Store in different region
- Test restore regularly

## Backup Verification

### Verify Backup File

**SQLite:**
```bash
sqlite3 backup.db "SELECT COUNT(*) FROM User;"
```

**PostgreSQL:**
```bash
# Check backup file contains data
head -n 20 backup.sql
```

### Test Restore

1. Create test database
2. Restore backup to test database
3. Verify data integrity
4. Test application functionality

## Disaster Recovery

### Recovery Time Objective (RTO)
- **Target:** < 1 hour
- **Plan:** Automated restore from latest backup

### Recovery Point Objective (RPO)
- **Target:** < 24 hours (daily backups)
- **Plan:** Point-in-time recovery if needed

### Recovery Procedure

1. **Assess damage:**
   - Identify data loss scope
   - Determine backup to use

2. **Prepare environment:**
   - Set up clean database
   - Verify backup file integrity

3. **Restore backup:**
   ```bash
   tsx scripts/restore-database.ts <backup-file>
   ```

4. **Verify restore:**
   - Check data integrity
   - Test application
   - Verify all features work

5. **Post-restore:**
   - Run migrations if needed
   - Update application
   - Monitor for issues

## Backup Retention Policy

### Recommended Retention

- **Daily backups:** 30 days
- **Weekly backups:** 12 weeks (3 months)
- **Monthly backups:** 12 months (1 year)

### Cleanup Script

The backup script automatically deletes backups older than 30 days. To customize:

Edit `scripts/backup-database.ts`:
```typescript
const RETENTION_DAYS = 30; // Change as needed
```

## Monitoring

### Backup Monitoring

- **Success/Failure:** Log backup results
- **File Size:** Monitor backup file sizes
- **Storage:** Monitor backup storage usage
- **Alerts:** Set up alerts for backup failures

### Restore Testing

- **Frequency:** Monthly
- **Procedure:** Restore to test environment
- **Verification:** Verify data integrity and functionality

## Security

### Backup Encryption

**For sensitive data:**
```bash
# Encrypt backup
gpg --encrypt --recipient your@email.com backup.sql

# Decrypt backup
gpg --decrypt backup.sql.gpg > backup.sql
```

### Access Control

- Limit access to backup files
- Use secure storage
- Encrypt backups in transit and at rest
- Rotate backup storage credentials

## Troubleshooting

### Backup Fails

1. **Check disk space:**
   ```bash
   df -h
   ```

2. **Check database connection:**
   ```bash
   npx prisma db pull
   ```

3. **Check permissions:**
   - Verify write permissions to `backups/` directory
   - Verify database read permissions

### Restore Fails

1. **Verify backup file:**
   - Check file exists and is not corrupted
   - Verify file format matches database type

2. **Check database connection:**
   - Verify DATABASE_URL is correct
   - Check database permissions

3. **Check disk space:**
   - Ensure enough space for restore

## Best Practices

1. ✅ **Automate backups** - Don't rely on manual backups
2. ✅ **Test restores regularly** - Verify backups work
3. ✅ **Store backups off-site** - Protect against server failure
4. ✅ **Encrypt backups** - Protect sensitive data
5. ✅ **Monitor backup success** - Get alerts on failures
6. ✅ **Document procedures** - Know how to restore
7. ✅ **Version backups** - Keep multiple versions
8. ✅ **Regular testing** - Test disaster recovery

---

**Last Updated:** 2025-01-XX

