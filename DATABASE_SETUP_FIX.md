# Database Setup - PostgreSQL Migration

## ⚠️ IMPORTANT: Project Uses PostgreSQL, Not SQLite

This project is configured to use **PostgreSQL** for:
- ✅ Vector database compatibility (pgvector extension)
- ✅ Production-ready deployment
- ✅ Case-insensitive search
- ✅ Better scalability

## Current Status

✅ **Prisma Schema**: Updated to use `provider = "postgresql"`
✅ **API Routes**: Restored case-insensitive search (PostgreSQL supports it)
✅ **Port Configuration**: Fixed default port to 3000

## Required Configuration

### 1. Install PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run --name pak-exporters-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pak_exporters \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local Installation**
- Windows: Download from https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql@15`
- Linux: `sudo apt install postgresql postgresql-contrib`

### 2. Create Database

```bash
psql -U postgres
CREATE DATABASE pak_exporters;
\q
```

### 3. Update `.env` File

```env
# PostgreSQL connection string (NOT SQLite!)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pak_exporters?schema=public"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# JWT Secret
JWT_SECRET=0246b594d2a8abd72a2be46446998a8b029c53c57329beb26863c21ab9ebf79e
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Why PostgreSQL?

1. **Vector DB Support**: Can add `pgvector` extension for AI features
2. **Production Ready**: Better for deployment (Vercel, Supabase, Railway)
3. **Case-Insensitive Search**: Native support for `mode: "insensitive"`
4. **Scalability**: Better performance and concurrent connections
5. **Advanced Features**: Full-text search, JSON support, etc.

## See Also

- `POSTGRESQL_MIGRATION_GUIDE.md` - Complete migration guide with detailed instructions
- `VECTOR_DATABASE_ANALYSIS.md` - Vector DB planning and options
