# Deployment Settings Configuration

This document outlines the deployment settings and configuration for the Pak-Exporters application.

## CI/CD Pipeline

The project includes a GitHub Actions CI/CD pipeline located at `.github/workflows/ci-cd.yml`.

### Pipeline Stages

1. **Lint and Test**
   - Runs ESLint
   - Checks code formatting
   - Type checks with TypeScript
   - Runs unit tests
   - Runs E2E tests (optional)

2. **Build**
   - Builds the Next.js application
   - Uploads build artifacts

3. **Deploy Preview** (for PRs)
   - Creates preview deployments for pull requests
   - Comments on PR with build status

4. **Deploy Production** (for main branch)
   - Deploys to production environment
   - Supports Vercel deployment (optional)

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Required
- `NEXT_PUBLIC_APP_URL` - Application URL (e.g., `https://pak-exporters.com`)

### Optional (for Vercel deployment)
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `DEPLOYMENT_URL` - Production deployment URL

## Environment Variables

### Development
Create `.env.local`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Production
Create `.env.production` or configure in deployment platform:
```env
NEXT_PUBLIC_APP_URL=https://pak-exporters.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main

### Other Platforms
The application can be deployed to:
- **Netlify** - Similar to Vercel
- **Railway** - Full-stack deployment
- **Render** - Simple deployment
- **Self-hosted** - Using Docker or Node.js directly

## Build Configuration

The build process is configured in:
- `next.config.ts` - Next.js configuration
- `package.json` - Build scripts
- `.github/workflows/ci-cd.yml` - CI/CD pipeline

## Deployment Checklist

- [ ] Configure GitHub secrets
- [ ] Set up environment variables
- [ ] Configure deployment platform
- [ ] Test build locally (`npm run build`)
- [ ] Verify CI/CD pipeline runs successfully
- [ ] Test production deployment
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate
- [ ] Configure CDN (if applicable)
- [ ] Set up monitoring and alerts

## Monitoring

After deployment, monitor:
- Application performance
- Error rates (via Sentry)
- Analytics (via Google Analytics)
- Build status (via GitHub Actions)

## Rollback Procedure

If deployment fails:
1. Check GitHub Actions logs
2. Review error messages
3. Fix issues in code
4. Re-run deployment
5. If needed, revert to previous commit

---

**Note:** The CI/CD pipeline is configured but requires GitHub repository setup and secret configuration to function fully.

