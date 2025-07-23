# Hệ Thống Quản Lý Hóa Đơn Bi-A 

Hệ thống web quản lý hóa đơn bàn bi-a đầy đủ tính năng với giao diện responsive cho điện thoại và máy tính.

## 🚀 Triển Khai Nhanh

### Development (Local):
```bash
# Chạy development
./start.bat        # Windows
./start.sh         # Linux/Mac
```

### Production (Server):
```bash
# Triển khai production
./deploy.bat       # Windows
./deploy.sh        # Linux/Mac
```

## 🛠️ Công nghệ sử dụng

- **Backend**: Golang (Gin framework)
- **Frontend**: Next.js 15 (React)
- **Database**: MariaDB 10.11
- **Container**: Docker & Docker Compose
- **Proxy**: Nginx (optional)
- **SSL**: Let's Encrypt support

## ✨ Đặc điểm chính

- 🎯 **Đầy đủ tính năng**: Quản lý sessions, orders, invoices
- ⚡ **Hiệu suất cao**: Optimized queries và caching
- 📱 **Responsive**: Hoạt động tốt trên mobile và desktop
- 🔐 **Bảo mật**: JWT authentication với phân quyền
- 💰 **Chính xác**: Tính toán thời gian và dịch vụ chính xác
- 🐳 **Containerized**: Ready for production deployment

## Cấu trúc dự án

```
web_tuananh_bi_a/
├── backend/                 # Go API server
│   ├── main.go
│   ├── go.mod
│   ├── .env.example
│   └── internal/
│       ├── config/
│       ├── database/
│       ├── middleware/
│       └── routes/
├── frontend/               # Next.js app
│   ├── package.json
│   ├── next.config.js
│   ├── .env.example
│   └── src/
├── TODO.md                # Danh sách công việc
└── # BI-A Management System

Hệ thống quản lý quán bi-a chuyên nghiệp với Go Backend và Next.js Frontend.

## 🚀 Quick Start

### Yêu cầu hệ thống
- **MariaDB/MySQL** (Local installation)
- **Go** 1.20+
- **Node.js** 16+
- **Windows** (script được tối ưu cho Windows)

### Cài đặt và chạy

1. **Setup Database**
   ```bash
   # Import database
   .\import-local-db.bat
   ```

2. **Setup Firewall** (Chỉ cần 1 lần)
   ```bash
   # Run as Administrator
   .\setup-firewall.bat
   ```

3. **Deploy Project**
   ```bash
   # Start all services
   .\start-local.bat
   ```

4. **Stop Services**
   ```bash
   # Stop all services
   .\stop-local.bat
   ```

## 📊 Access Points

- **🌐 Website**: http://192.168.1.69:3000 (Public)
- **🏠 Local**: http://localhost:3000
- **🔧 API**: http://192.168.1.69:8080 (Public)
- **💾 Database**: localhost:3306

## 📁 Project Structure

```
project_bia/
├── backend/               # Go API Server
│   ├── internal/         # Business logic
│   ├── main.go           # Entry point
│   └── .env              # Environment config
├── front-end/            # Next.js Frontend
│   ├── src/              # Source code
│   ├── package.json      # Dependencies
│   └── .env.local        # Frontend config
├── start-local.bat       # 🚀 Deploy script
├── stop-local.bat        # 🛑 Stop script
├── import-local-db.bat   # 💾 Database setup
├── setup-firewall.bat    # 🛡️ Firewall config
└── full_database.sql     # Database dump
```

## 🛠️ Development

### Backend (Go)
```bash
cd backend
go run main.go
```

### Frontend (Next.js)
```bash
cd front-end
npm run dev
```

## 📋 Features

- ✅ Local MariaDB Database
- ✅ Go REST API Backend
- ✅ Next.js React Frontend
- ✅ Public Network Access
- ✅ Automatic IP Configuration
- ✅ Windows Firewall Setup
- ✅ One-click Deployment

## 🔧 Troubleshooting

Xem chi tiết trong `LOCAL_SETUP_GUIDE.md`

---

**Phát triển bởi**: BI-A Team  
**Phiên bản**: 2.0 (Local Deployment)  
**Ngày**: July 2025
```

## Cài đặt và chạy

### 1. Database Setup

Tạo database MySQL:

```sql
CREATE DATABASE bi_a_tuananh;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với thông tin database của bạn
go mod tidy
go run main.go
```

Backend sẽ chạy tại: http://localhost:8080

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## API Endpoints

### Health Check

- `GET /api/health` - Kiểm tra trạng thái API

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Tables Management

- `GET /api/tables` - Lấy danh sách bàn
- `POST /api/tables/:id/start` - Bắt đầu phiên chơi
- `POST /api/tables/:id/end` - Kết thúc phiên chơi

### Services

- `GET /api/services` - Lấy danh sách dịch vụ
- `POST /api/sessions/:id/add-service` - Thêm dịch vụ vào phiên

### Invoices

- `POST /api/invoices` - Tạo hóa đơn

### Reports

- `GET /api/reports/daily` - Báo cáo hàng ngày
- `GET /api/reports/monthly` - Báo cáo hàng tháng

## Tính năng chính

- ✅ **Đăng nhập & phân quyền** (Admin/Staff)
- ✅ **Tạo hóa đơn** với thông tin bàn, thời gian chơi
- ✅ **Timer frontend** - tính thời gian chơi chính xác
- ✅ **Thêm dịch vụ** - nước ngọt, thuốc lá, mỳ tôm, etc.
- ✅ **Tính tổng hóa đơn** - tiền giờ + dịch vụ + giảm giá
- ✅ **In hóa đơn** - layout thân thiện với máy in
- ✅ **Báo cáo doanh thu** - hàng ngày, hàng tháng
- ✅ **Giao diện responsive** - mobile & desktop

## Flow hoạt động

1. **Đăng nhập** → Dashboard chính
2. **Tạo hóa đơn** → Nhập tên bàn, bắt đầu timer
3. **Thêm dịch vụ** → Chọn từ menu có sẵn
4. **Hoàn thành** → Dừng timer, tính tổng, in hóa đơn
5. **Xem báo cáo** → Doanh thu theo ngày/tháng

## User mặc định

- **Admin**: username: `admin`, password: `password`
- **Staff**: username: `staff`, password: `password`

## Development Status

Hiện tại đã hoàn thành **Phase 1**:

- ✅ Project structure setup
- ✅ Database schema & migrations
- ✅ Basic API routes
- ✅ Frontend boilerplate

Tiếp theo: **Phase 2** - Implement API handlers

## Ghi chú

- Database sẽ tự động tạo tables và insert data mẫu khi khởi động
- JWT secret nên được thay đổi trong production
- Các endpoints hiện tại trả về placeholder response, sẽ được implement trong phase tiếp theo
