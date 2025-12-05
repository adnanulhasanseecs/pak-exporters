@echo off
REM =============================================================================
REM Pak-Exporters Server Management Script (Batch)
REM =============================================================================

setlocal enabledelayedexpansion

set "PROJECT_NAME=pak-exporters"
set "FRONTEND_PORT=3001"
set "BACKEND_PORT=8001"

if "%1"=="" goto :help
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="status" goto :status
if "%1"=="help" goto :help
goto :help

:start
echo.
echo === Starting %PROJECT_NAME% Servers ===
echo.
echo Starting Frontend on port %FRONTEND_PORT%...
start "Pak-Exporters Frontend" cmd /k "cd /d %~dp0.. && npm run dev -- -p %FRONTEND_PORT%"
timeout /t 2 /nobreak >nul
echo.
echo Starting Backend on port %BACKEND_PORT%...
if exist "%~dp0..\backend\package.json" (
    start "Pak-Exporters Backend" cmd /k "cd /d %~dp0..\backend && npm start"
) else (
    echo Backend directory not found. Skipping backend startup.
)
echo.
echo Servers started!
echo Frontend: http://localhost:%FRONTEND_PORT%
echo Backend:  http://localhost:%BACKEND_PORT%
goto :end

:stop
echo.
echo === Stopping %PROJECT_NAME% Servers ===
echo.
echo Stopping processes on port %FRONTEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%FRONTEND_PORT%"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo Stopping processes on port %BACKEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%BACKEND_PORT%"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo.
echo All servers stopped!
goto :end

:restart
echo.
echo === Restarting %PROJECT_NAME% Servers ===
call :stop
timeout /t 2 /nobreak >nul
call :start
goto :end

:status
echo.
echo === %PROJECT_NAME% Server Status ===
echo.
echo Checking Frontend (Port %FRONTEND_PORT%)...
netstat -aon | findstr ":%FRONTEND_PORT%" >nul
if %errorlevel%==0 (
    echo   Status: Running
    echo   URL: http://localhost:%FRONTEND_PORT%
) else (
    echo   Status: Stopped
)
echo.
echo Checking Backend (Port %BACKEND_PORT%)...
netstat -aon | findstr ":%BACKEND_PORT%" >nul
if %errorlevel%==0 (
    echo   Status: Running
    echo   URL: http://localhost:%BACKEND_PORT%
) else (
    echo   Status: Stopped
)
echo.
goto :end

:help
echo.
echo === %PROJECT_NAME% Server Management ===
echo.
echo Usage: manage-pak-exporters.bat [action]
echo.
echo Actions:
echo   start     Start frontend and backend servers
echo   stop      Stop all servers
echo   restart   Restart all servers
echo   status    Show server status
echo   help      Show this help message
echo.
echo Ports:
echo   Frontend: %FRONTEND_PORT%
echo   Backend:  %BACKEND_PORT%
echo.
goto :end

:end
endlocal

