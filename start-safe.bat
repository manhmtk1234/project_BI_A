@echo off
echo 🚀 BI-A Deployment Quick Start
echo ═══════════════════════════════════════════════════════════════
echo.

echo ⚠️  BEFORE FIRST RUN:
echo 1. Copy backend\.env.example to backend\.env
echo 2. Copy front-end\.env.example to front-end\.env.local  
echo 3. Update database credentials in backend\.env
echo 4. Update API URL in front-end\.env.local
echo.

echo 📋 CHECKING CONFIGURATION...

if not exist "backend\.env" (
    echo ❌ backend\.env not found!
    echo    Run: copy backend\.env.example backend\.env
    echo    Then edit with your database credentials
    pause
    exit
)

if not exist "front-end\.env.local" (
    echo ❌ front-end\.env.local not found!
    echo    Run: copy front-end\.env.example front-end\.env.local
    echo    Then edit with your API URL
    pause
    exit
)

echo ✅ Configuration files found
echo.

echo 🗄️  CHECKING DATABASE...
mysql -u root -p -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cannot connect to database!
    echo    Make sure MariaDB/MySQL is running
    echo    Check credentials in backend\.env
    pause
    exit
)

echo ✅ Database connection OK
echo.

echo 🚀 STARTING SERVICES...
echo.

echo 🔧 Starting Go Backend...
start "BI-A Backend" cmd /k "cd backend && go run main.go"
timeout /t 5 >nul

echo 🌐 Starting Next.js Frontend...
start "BI-A Frontend" cmd /k "cd front-end && npm run dev -- -H 0.0.0.0"

echo.
echo ✅ DEPLOYMENT STARTED!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 📱 ACCESS POINTS:
echo • Local:   http://localhost:3000
echo • Network: http://YOUR_LOCAL_IP:3000
echo • Public:  http://YOUR_PUBLIC_IP:3000
echo.
echo 💡 TIPS:
echo • Check the opened terminal windows for logs
echo • Use Ctrl+C in each window to stop services
echo • For public access, setup router DMZ/port forwarding
echo.
echo 🔐 DEFAULT LOGIN:
echo • Admin: admin / password
echo • Staff: staff / password
echo.
pause
