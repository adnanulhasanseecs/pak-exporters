# =============================================================================
# Pak-Exporters Server Management Script
# =============================================================================
# Manages frontend and backend servers with proper error handling and logging
# =============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "help")]
    [string]$Action = "help"
)

# =============================================================================
# CONFIGURATION
# =============================================================================
$PROJECT_NAME = "pak-exporters"
$PROJECT_DIR = $PSScriptRoot | Split-Path -Parent
$LOG_DIR = Join-Path $PROJECT_DIR "logs"
$PID_DIR = Join-Path $PROJECT_DIR "pids"

# Port Configuration
$FRONTEND_PORT = 3001
$BACKEND_PORT = 8001

# Service Names
$FRONTEND_SERVICE = "pak-exporters-frontend"
$BACKEND_SERVICE = "pak-exporters-backend"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

function Ensure-Directories {
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
    }
    if (-not (Test-Path $PID_DIR)) {
        New-Item -ItemType Directory -Path $PID_DIR -Force | Out-Null
    }
}

function Get-PortProcess {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processId = $connections[0].OwningProcess
        return Get-Process -Id $processId -ErrorAction SilentlyContinue
    }
    return $null
}

function Stop-PortProcess {
    param([int]$Port, [string]$ServiceName)
    $process = Get-PortProcess -Port $Port
    if ($process) {
        Write-ColorOutput "Stopping $ServiceName on port $Port (PID: $process.Id)..." "Yellow"
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction Stop
            Start-Sleep -Seconds 2
            Write-ColorOutput "[OK] $ServiceName stopped successfully" "Green"
            return $true
        }
        catch {
            Write-ColorOutput "[ERROR] Failed to stop $ServiceName : $_" "Red"
            return $false
        }
    }
    return $true
}

function Start-Frontend {
    Write-ColorOutput "Starting Frontend (Next.js) on port $FRONTEND_PORT..." "Blue"
    
    # Stop if already running
    Stop-PortProcess -Port $FRONTEND_PORT -ServiceName $FRONTEND_SERVICE | Out-Null
    
    $pidFile = Join-Path $PID_DIR "frontend.pid"
    $logFile = Join-Path $LOG_DIR "frontend.log"
    $errorLogFile = Join-Path $LOG_DIR "frontend-error.log"
    
    try {
        Push-Location $PROJECT_DIR
        
        # Use npm.cmd on Windows for proper execution
        $npmCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npm.cmd" } else { "npm" }
        
        $process = Start-Process -FilePath $npmCmd -ArgumentList "run", "dev", "--", "-p", $FRONTEND_PORT `
            -PassThru -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $errorLogFile
        
        Start-Sleep -Seconds 2  # Give process time to start
        
        $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
        Write-ColorOutput "[OK] Frontend started (PID: $($process.Id))" "Green"
        Write-ColorOutput "  Frontend URL: http://localhost:$FRONTEND_PORT" "Cyan"
        Write-ColorOutput "  Logs: $logFile" "Gray"
        Pop-Location
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to start Frontend: $_" "Red"
        if ((Get-Location).Path -ne $PROJECT_DIR) {
            Pop-Location
        }
        return $false
    }
}

function Start-Backend {
    Write-ColorOutput "Starting Backend API on port $BACKEND_PORT..." "Blue"
    
    # Stop if already running
    Stop-PortProcess -Port $BACKEND_PORT -ServiceName $BACKEND_SERVICE | Out-Null
    
    $pidFile = Join-Path $PID_DIR "backend.pid"
    $logFile = Join-Path $LOG_DIR "backend.log"
    $errorLogFile = Join-Path $LOG_DIR "backend-error.log"
    
    # Check if backend directory exists
    $backendDir = Join-Path $PROJECT_DIR "backend"
    if (-not (Test-Path $backendDir)) {
        Write-ColorOutput "[WARN] Backend directory not found. Skipping backend startup." "Yellow"
        Write-ColorOutput "  Create a backend directory to enable backend server." "Gray"
        return $true
    }
    
    try {
        Push-Location $backendDir
        if (Test-Path "package.json") {
            # Use npm.cmd on Windows for proper execution
            $npmCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npm.cmd" } else { "npm" }
            
            $process = Start-Process -FilePath $npmCmd -ArgumentList "start" `
                -PassThru -NoNewWindow -RedirectStandardOutput $logFile -RedirectStandardError $errorLogFile
            
            Start-Sleep -Seconds 2  # Give process time to start
            
            $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
            Write-ColorOutput "[OK] Backend started (PID: $($process.Id))" "Green"
            Write-ColorOutput "  Backend URL: http://localhost:$BACKEND_PORT" "Cyan"
            Write-ColorOutput "  Logs: $logFile" "Gray"
        }
        else {
            Write-ColorOutput "[WARN] Backend package.json not found. Skipping backend startup." "Yellow"
        }
        Pop-Location
        return $true
    }
    catch {
        Write-ColorOutput "[ERROR] Failed to start Backend: $_" "Red"
        if ((Get-Location).Path -ne $backendDir) {
            Pop-Location
        }
        return $false
    }
}

function Stop-Frontend {
    Write-ColorOutput "Stopping Frontend..." "Yellow"
    $pidFile = Join-Path $PID_DIR "frontend.pid"
    
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Remove-Item $pidFile -Force
            Write-ColorOutput "[OK] Frontend stopped" "Green"
        }
        catch {
            Write-ColorOutput "[WARN] Frontend process not found or already stopped" "Yellow"
        }
    }
    
    Stop-PortProcess -Port $FRONTEND_PORT -ServiceName $FRONTEND_SERVICE | Out-Null
}

function Stop-Backend {
    Write-ColorOutput "Stopping Backend..." "Yellow"
    $pidFile = Join-Path $PID_DIR "backend.pid"
    
    if (Test-Path $pidFile) {
        $pid = Get-Content $pidFile
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Remove-Item $pidFile -Force
            Write-ColorOutput "[OK] Backend stopped" "Green"
        }
        catch {
            Write-ColorOutput "[WARN] Backend process not found or already stopped" "Yellow"
        }
    }
    
    Stop-PortProcess -Port $BACKEND_PORT -ServiceName $BACKEND_SERVICE | Out-Null
}

function Show-Status {
    Write-ColorOutput "`n=== $PROJECT_NAME Server Status ===" "Cyan"
    
    $frontendProcess = Get-PortProcess -Port $FRONTEND_PORT
    $backendProcess = Get-PortProcess -Port $BACKEND_PORT
    
    Write-ColorOutput "`nFrontend (Port $FRONTEND_PORT):" "Yellow"
    if ($frontendProcess) {
        Write-ColorOutput "  Status: Running (PID: $($frontendProcess.Id))" "Green"
        Write-ColorOutput "  URL: http://localhost:$FRONTEND_PORT" "Cyan"
    }
    else {
        Write-ColorOutput "  Status: Stopped" "Red"
    }
    
    Write-ColorOutput "`nBackend (Port $BACKEND_PORT):" "Yellow"
    if ($backendProcess) {
        Write-ColorOutput "  Status: Running (PID: $($backendProcess.Id))" "Green"
        Write-ColorOutput "  URL: http://localhost:$BACKEND_PORT" "Cyan"
    }
    else {
        Write-ColorOutput "  Status: Stopped" "Red"
    }
    Write-Host ""
}

function Show-Logs {
    param([string]$Service = "frontend")
    
    $logFile = Join-Path $LOG_DIR "$Service.log"
    if (Test-Path $logFile) {
        Write-ColorOutput "`n=== $Service Logs (Last 50 lines) ===" "Cyan"
        Get-Content $logFile -Tail 50
    }
    else {
        Write-ColorOutput "No logs found for $Service" "Yellow"
    }
}

function Show-Help {
    Write-ColorOutput "`n=== $PROJECT_NAME Server Management ===" "Cyan"
    Write-Host ""
    Write-Host "Usage: .\manage-pak-exporters.ps1 [action]"
    Write-Host ""
    Write-Host "Actions:"
    Write-ColorOutput "  start     " "Green" -NoNewline
    Write-Host "Start frontend and backend servers"
    Write-ColorOutput "  stop      " "Green" -NoNewline
    Write-Host "Stop all servers"
    Write-ColorOutput "  restart   " "Green" -NoNewline
    Write-Host "Restart all servers"
    Write-ColorOutput "  status    " "Green" -NoNewline
    Write-Host "Show server status"
    Write-ColorOutput "  logs      " "Green" -NoNewline
    Write-Host "Show logs (frontend or backend)"
    Write-ColorOutput "  help      " "Green" -NoNewline
    Write-Host "Show this help message"
    Write-Host ""
    Write-Host "Ports:"
    Write-Host "  Frontend: $FRONTEND_PORT"
    Write-Host "  Backend:  $BACKEND_PORT"
    Write-Host ""
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

Ensure-Directories

switch ($Action.ToLower()) {
    "start" {
        Write-ColorOutput "`n=== Starting $PROJECT_NAME Servers ===" "Cyan"
        Start-Frontend
        Start-Sleep -Seconds 2
        Start-Backend
        Start-Sleep -Seconds 1
        Show-Status
    }
    "stop" {
        Write-ColorOutput "`n=== Stopping $PROJECT_NAME Servers ===" "Cyan"
        Stop-Frontend
        Stop-Backend
        Write-ColorOutput "`n[OK] All servers stopped" "Green"
    }
    "restart" {
        Write-ColorOutput "`n=== Restarting $PROJECT_NAME Servers ===" "Cyan"
        Stop-Frontend
        Stop-Backend
        Start-Sleep -Seconds 2
        Start-Frontend
        Start-Sleep -Seconds 2
        Start-Backend
        Start-Sleep -Seconds 1
        Show-Status
    }
    "status" {
        Show-Status
    }
    "logs" {
        if ($args.Count -gt 0) {
            Show-Logs -Service $args[0]
        }
        else {
            Show-Logs -Service "frontend"
        }
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}
