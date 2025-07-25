🚀 DEPLOYMENT GUIDE - BI-A Management System
═══════════════════════════════════════════════════════════════

## 📋 OVERVIEW
Hướng dẫn deployment hệ thống BI-A từ GitHub repository về máy local và expose ra Internet.

⚠️ **LƯU Ý**: Các file setup chi tiết và scripts tự động nằm trong thư mục `system-files/` (chỉ có trên máy local, không push lên GitHub vì lý do bảo mật).

## 🎯 SYSTEM REQUIREMENTS
- Windows 10/11
- MariaDB/MySQL
- Node.js 18+
- Go 1.21+
- Router có DMZ support

## 📦 INSTALLATION STEPS

### 1️⃣ CLONE REPOSITORY
```bash
git clone https://github.com/manhmtk1234/project_BI_A.git
cd project_BI_A
```

### 2️⃣ DATABASE SETUP
```bash
# Install MariaDB
# Create database: bia_management
# Import schema: full_database.sql
mysql -u root -p bia_management < full_database.sql
```

### 3️⃣ BACKEND CONFIGURATION
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=bia_management
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=8080
```

### 4️⃣ FRONTEND CONFIGURATION
```bash
cd front-end
cp .env.example .env.local
```

Edit `front-end/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 5️⃣ INSTALL DEPENDENCIES
```bash
# Backend
cd backend
go mod download

# Frontend
cd ../front-end
npm install
```

### 6️⃣ LOCAL TESTING
```bash
# Terminal 1 - Backend
cd backend
go run main.go

# Terminal 2 - Frontend  
cd front-end
npm run dev

# Access: http://localhost:3000
```

## 🌐 PUBLIC ACCESS SETUP

### 1️⃣ GET LOCAL IP
```bash
ipconfig
# Note your 192.168.x.x IP
```

### 2️⃣ UPDATE FRONTEND CONFIG
Edit `front-end/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8080/api
```

### 3️⃣ UPDATE BACKEND BINDING
Ensure `backend/main.go` contains:
```go
router.Run("0.0.0.0:" + port)  // Not ":" + port
```

### 4️⃣ WINDOWS FIREWALL
```bash
# Allow port 3000
netsh advfirewall firewall add rule name="BI-A Frontend" dir=in action=allow protocol=TCP localport=3000

# Allow port 8080  
netsh advfirewall firewall add rule name="BI-A Backend" dir=in action=allow protocol=TCP localport=8080
```

### 5️⃣ ROUTER CONFIGURATION
1. Access router admin (usually 192.168.1.1)
2. Enable DMZ for your local IP
3. Or setup port forwarding: 3000, 8080 → YOUR_LOCAL_IP
4. Restart router

### 6️⃣ GET PUBLIC IP
```bash
# Check your public IP
curl ifconfig.me
# Or visit: whatismyip.com
```

### 7️⃣ START SERVICES
```bash
# Backend
cd backend
go run main.go

# Frontend (new terminal)
cd front-end  
npm run dev -- -H 0.0.0.0

# Access: http://YOUR_PUBLIC_IP:3000
```

## 📱 TESTING

### Local Testing:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

### Network Testing:
- Frontend: `http://YOUR_LOCAL_IP:3000`
- Backend: `http://YOUR_LOCAL_IP:8080`

### Public Testing:
- Frontend: `http://YOUR_PUBLIC_IP:3000`
- Test from phone (4G): Turn off WiFi, use mobile data

## 🔐 DEFAULT CREDENTIALS
```
Admin: admin / password
Staff: staff / password  
```
⚠️ **Change these in production!**

## 🛠️ TROUBLESHOOTING

### Backend Not Accessible Externally:
- Check `router.Run("0.0.0.0:" + port)` in main.go
- Verify Windows Firewall rules
- Check router DMZ/port forwarding

### Frontend Network Error:
- Verify API URL in `.env.local`
- Check backend is running on correct IP
- Test backend API directly

### Database Connection Error:
- Check MariaDB is running
- Verify credentials in `.env`
- Test database connection

## 📚 PRODUCTION CONSIDERATIONS

### Security:
- Change default passwords
- Use strong JWT secret
- Enable HTTPS
- Setup proper database users
- Use environment variables

### Performance:
- Build frontend for production: `npm run build`
- Use process manager for Go backend
- Setup database indices
- Enable gzip compression

### Monitoring:
- Setup logging
- Monitor resource usage
- Setup backup procedures
- Health check endpoints

## 🆘 SUPPORT
- GitHub Issues: https://github.com/manhmtk1234/project_BI_A/issues
- Check logs in terminal windows
- Verify network connectivity

═══════════════════════════════════════════════════════════════
✅ Follow this guide step by step for successful deployment!
