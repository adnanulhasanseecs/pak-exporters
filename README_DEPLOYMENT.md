# Deployment Quick Reference

## Pre-Deployment

1. **Environment Variables**
   ```bash
   # Copy example file
   cp .env.production.example .env.production
   # Edit with production values
   nano .env.production
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate:prod
   ```

3. **Backup**
   ```bash
   # Create backup before deployment
   npm run db:backup
   ```

## Deployment

### Vercel
```bash
vercel --prod
```

### Self-Hosted
```bash
npm run build
pm2 start npm --name "pak-exporters" -- start
```

## Post-Deployment

1. **Verify**
   - Check application loads
   - Test authentication
   - Verify API endpoints

2. **Monitor**
   - Check error logs
   - Monitor performance
   - Review analytics

## Rollback

```bash
# Restore from backup
npm run db:restore backups/backup-YYYY-MM-DD.db

# Or rollback code
git checkout <previous-commit>
npm run build
pm2 restart pak-exporters
```

---

For detailed instructions, see `docs/DEPLOYMENT_PRODUCTION.md`

