# Pak-Exporters Server Management Scripts

## Overview

Server management scripts for starting, stopping, and managing the Pak-Exporters frontend and backend servers.

## Port Configuration

- **Frontend**: Port `3001` (Next.js)
- **Backend**: Port `8001` (when implemented)

## Usage

### PowerShell Script (Recommended for Windows)

```powershell
# Start servers
.\scripts\manage-pak-exporters.ps1 start

# Stop servers
.\scripts\manage-pak-exporters.ps1 stop

# Restart servers
.\scripts\manage-pak-exporters.ps1 restart

# Check status
.\scripts\manage-pak-exporters.ps1 status

# View logs
.\scripts\manage-pak-exporters.ps1 logs frontend
.\scripts\manage-pak-exporters.ps1 logs backend

# Show help
.\scripts\manage-pak-exporters.ps1 help
```

### Batch Script (Alternative for Windows)

```batch
# Start servers
scripts\manage-pak-exporters.bat start

# Stop servers
scripts\manage-pak-exporters.bat stop

# Restart servers
scripts\manage-pak-exporters.bat restart

# Check status
scripts\manage-pak-exporters.bat status
```

### NPM Scripts

```bash
# Start servers
npm run server:start

# Stop servers
npm run server:stop

# Restart servers
npm run server:restart

# Check status
npm run server:status
```

## Features

- Automatic port conflict detection and resolution
- Process ID tracking for clean shutdown
- Logging to `logs/` directory
- Status checking for both services
- Color-coded output for better readability

## Directory Structure

```
pak-exporters/
├── scripts/
│   ├── manage-pak-exporters.ps1  # PowerShell script
│   └── manage-pak-exporters.bat  # Batch script
├── logs/                         # Server logs
│   ├── frontend.log
│   ├── frontend-error.log
│   ├── backend.log
│   └── backend-error.log
└── pids/                         # Process ID files
    ├── frontend.pid
    └── backend.pid
```

## Notes

- The scripts automatically create `logs/` and `pids/` directories if they don't exist
- If a port is already in use, the script will attempt to stop the conflicting process
- Backend startup is skipped if the `backend/` directory doesn't exist
- All logs are stored in the `logs/` directory for easy debugging

