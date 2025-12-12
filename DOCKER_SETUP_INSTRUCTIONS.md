# Docker PostgreSQL Setup Instructions

## Prerequisites

1. **Docker Desktop must be running**
   - Open Docker Desktop application
   - Wait for it to fully start (whale icon in system tray should be steady)
   - Verify it's running: `docker ps` should work without errors

## Setup Steps

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait until it shows "Docker Desktop is running"

### 2. Start PostgreSQL Container

```bash
docker-compose up -d
```

This will:
- Download PostgreSQL 15 image (first time only)
- Create a container named `pak-exporters-db`
- Start PostgreSQL on port 5432
- Create a persistent volume for data

### 3. Verify Container is Running

```bash
docker ps
```

You should see `pak-exporters-db` container running.

### 4. Check Container Logs (if needed)

```bash
docker logs pak-exporters-db
```

### 5. Update .env File

Add/update this line in your `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pak_exporters?schema=public"
```

### 6. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Useful Docker Commands

### Stop PostgreSQL
```bash
docker-compose down
```

### Stop and Remove Data (⚠️ This deletes all data!)
```bash
docker-compose down -v
```

### View Logs
```bash
docker logs pak-exporters-db
```

### Restart Container
```bash
docker-compose restart
```

### Access PostgreSQL CLI
```bash
docker exec -it pak-exporters-db psql -U postgres -d pak_exporters
```

## Troubleshooting

### Docker Desktop Not Running
**Error**: `The system cannot find the file specified`
**Solution**: Start Docker Desktop application

### Port 5432 Already in Use
**Error**: `port is already allocated`
**Solution**: 
- Check if another PostgreSQL is running: `netstat -ano | findstr :5432`
- Stop the conflicting service, or
- Change port in docker-compose.yml: `"5433:5432"` (then update DATABASE_URL to use port 5433)

### Container Won't Start
```bash
# Check logs
docker logs pak-exporters-db

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

## Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: pak_exporters
- **User**: postgres
- **Password**: postgres
- **Connection String**: `postgresql://postgres:postgres@localhost:5432/pak_exporters?schema=public`

## Security Note

⚠️ **For Production**: Change the default password!
- Update `POSTGRES_PASSWORD` in docker-compose.yml
- Update `DATABASE_URL` in .env accordingly

