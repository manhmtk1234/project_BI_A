@echo off
echo ===============================================
echo      BI-A Management System - DEV START
echo ===============================================
echo.

:: Check if Go is installed
where go >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Go is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Starting Backend (Go) on port 8080...
cd backend
start "BI-A Backend" cmd /k "go run main.go"

echo [INFO] Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend (Next.js) on port 3000...
cd ..\front-end
start "BI-A Frontend" cmd /k "npm run dev"

echo.
echo ===============================================
echo   🚀 BI-A System Started Successfully!
echo ===============================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8080/api
echo   
echo   Default Login:
echo   - admin / password
echo   - staff / password
echo ===============================================
echo.
echo Press any key to exit this window...
pause >nul
