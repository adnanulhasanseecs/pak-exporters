# Production Deployment Guide

Complete guide for deploying Pak-Exporters to production.

## Pre-Deployment Checklist

### Code Quality
- [x] All tests passing
- [x] No linting errors
- [x] No TypeScript errors
- [x] Code reviewed
- [x] Security audit completed

### Environment Setup
- [ ] Production database configured
- [ ] All environment variables set
- [ ] Secrets are strong and unique
- [ ] `.env.production` created (not committed)

### Database
- [ ] Production database created
- [ ] Migrations tested
- [ ] Backup strategy implemented
- [ ] Connection pooling configured

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for Next.js applications and provides excellent performance.

#### Setup Steps

1. **Create Vercel Account**
   - Sign up at https://vercel.com
   - Connect GitHub repository

2. **Configure Project**
   - Import repository
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=<strong-random-32-plus-chars>
     NEXT_PUBLIC_APP_URL=https://pak-exporters.com
     NODE_ENV=production
     NEXT_PUBLIC_GA_ID=G-...
     NEXT_PUBLIC_SENTRY_DSN=https://...
     ```

4. **Database Setup**
   - Use Vercel Postgres (recommended)
   - Or connect external PostgreSQL database
   - Set `DATABASE_URL` environment variable

5. **Run Migrations**
   - Use Vercel CLI:
     ```bash
     vercel env pull .env.production
     npx prisma migrate deploy
     ```
   - Or use migration script:
     ```bash
     NODE_ENV=production tsx scripts/migrate-production.ts
     ```

6. **Deploy**
   - Push to `main` branch (auto-deploy)
   - Or use Vercel CLI: `vercel --prod`

#### Vercel Postgres Setup

1. **Add Postgres Database**
   - Go to Project → Storage → Create Database
   - Select Postgres
   - Choose region
   - Create database

2. **Get Connection String**
   - Copy `POSTGRES_PRISMA_URL` or `POSTGRES_URL_NON_POOLING`
   - Set as `DATABASE_URL` environment variable

3. **Update Prisma Schema**
   - Ensure `datasource db` uses `provider = "postgresql"`
   - Run migrations

### Option 2: Self-Hosted (VPS/Server)

#### Server Requirements

- **OS:** Ubuntu 22.04 LTS (recommended)
- **Node.js:** 18.x or higher
- **Database:** PostgreSQL 14+ or SQLite (dev only)
- **Memory:** 2GB minimum (4GB recommended)
- **Storage:** 20GB minimum

#### Setup Steps

1. **Server Provisioning**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL (if not using external DB)
   sudo apt install -y postgresql postgresql-contrib
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/pak-exporters.git
   cd pak-exporters
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.production.example .env.production
   nano .env.production  # Edit with production values
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   sudo -u postgres createdb pak_exporters
   sudo -u postgres createuser pak_exporters_user
   sudo -u postgres psql -c "ALTER USER pak_exporters_user WITH PASSWORD 'strong-password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pak_exporters TO pak_exporters_user;"
   
   # Run migrations
   NODE_ENV=production npm run db:migrate
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "pak-exporters" -- start
   pm2 save
   pm2 startup  # Enable auto-start on reboot
   ```

7. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name pak-exporters.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **SSL Certificate (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d pak-exporters.com
   ```

### Option 3: Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/pak_exporters
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=pak_exporters
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Authentication works
- [ ] Product pages load
- [ ] Company pages load
- [ ] RFQ submission works
- [ ] Search works
- [ ] Forms submit successfully

### Performance Tests
- [ ] Lighthouse score ≥90
- [ ] Page load < 3 seconds
- [ ] API response times acceptable
- [ ] No console errors
- [ ] No network errors

### Security Tests
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CSP headers working
- [ ] Authentication secure
- [ ] Rate limiting works
- [ ] No sensitive data exposed

### Monitoring
- [ ] Error tracking active
- [ ] Analytics tracking active
- [ ] Uptime monitoring active
- [ ] Performance monitoring active

---

## Rollback Procedure

### Quick Rollback (Vercel)

1. Go to Vercel Dashboard
2. Select project
3. Go to Deployments
4. Find previous deployment
5. Click "..." → "Promote to Production"

### Manual Rollback

1. **Stop application:**
   ```bash
   pm2 stop pak-exporters
   ```

2. **Restore from backup:**
   ```bash
   tsx scripts/restore-database.ts <backup-file>
   ```

3. **Revert code:**
   ```bash
   git checkout <previous-commit>
   npm install
   npm run build
   ```

4. **Restart application:**
   ```bash
   pm2 restart pak-exporters
   ```

---

## Maintenance

### Daily
- Check error logs
- Monitor performance
- Review analytics

### Weekly
- Review security alerts
- Check dependency updates
- Review user feedback

### Monthly
- Update dependencies
- Security audit
- Performance review
- Backup verification

---

## Troubleshooting

### Application Won't Start

1. Check environment variables
2. Verify database connection
3. Check logs: `pm2 logs pak-exporters`
4. Verify build succeeded

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check database is running
3. Verify network connectivity
4. Check firewall rules

### Performance Issues

1. Check database query performance
2. Review server resources
3. Check CDN configuration
4. Review caching strategy

---

**Last Updated:** 2025-01-XX

