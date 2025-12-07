# Environment Variables Guide

This document describes all environment variables used in the Pak-Exporters application.

## Quick Start

1. Copy `.env.example` to `.env.local`
2. Fill in the required variables
3. Never commit `.env.local` to version control

## Required Variables

### Application Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | `http://localhost:3001` | Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |

### API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8001` | No (mock data used if not set) |

## Optional Variables

### Authentication

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Random string (min 32 chars) | No |
| `NEXTAUTH_URL` | Public URL for auth callbacks | `http://localhost:3001` | No |

### AI Features

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` | No (AI features disabled without it) |

### Email Service

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` | No |
| `SMTP_PORT` | SMTP server port | `587` | No |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` | No |
| `SMTP_PASSWORD` | SMTP password | `your-password` | No |
| `SMTP_FROM` | Default sender email | `noreply@pak-exporters.com` | No |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string (SQLite for dev, PostgreSQL for prod) | `file:./dev.db` (dev) or `postgresql://user:pass@host:5432/db` (prod) | **Yes** |

### File Upload

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `UPLOAD_MAX_SIZE` | Maximum file size in bytes | `10485760` (10MB) | No |
| `ALLOWED_FILE_TYPES` | Comma-separated MIME types | `image/jpeg,image/png` | No |

### Analytics & Monitoring

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | `https://...@sentry.io/...` | No |

### Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SESSION_SECRET` | Secret for session encryption | Random string (min 32 chars) | No |
| `JWT_SECRET` | Secret for JWT tokens | Random string (min 32 chars) | **Yes** (Required in production) |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` (7 days) | No (defaults to 7d) |

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong, random secrets** for production
3. **Rotate secrets regularly** in production
4. **Use different values** for development and production
5. **Limit access** to production environment variables
6. **Use secret management** services (AWS Secrets Manager, Vercel Environment Variables, etc.)

## Generating Secrets

### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Using OpenSSL

```bash
openssl rand -hex 32
```

## Environment-Specific Files

Next.js supports multiple environment files:

- `.env` - Default (committed to repo)
- `.env.local` - Local overrides (gitignored)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

## Variable Naming

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- All other variables are server-side only
- Use uppercase with underscores for consistency

## Production Checklist

- [ ] All required variables are set
- [ ] Secrets are strong and unique
- [ ] API keys are valid and have proper permissions
- [ ] Database connection strings are correct
- [ ] Email service is configured and tested
- [ ] Error tracking is set up
- [ ] Analytics is configured
- [ ] Environment variables are stored securely
- [ ] Backup/restore process is documented

