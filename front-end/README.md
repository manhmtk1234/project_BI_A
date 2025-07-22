# Hệ Thống Quản Lý Hóa Đơn Bi-A (Phiên bản đơn giản)

Hệ thống web quản lý hóa đơn bàn bi-a đơn giản với giao diện responsive cho điện thoại và máy tính.

## Công nghệ sử dụng

- **Backend**: Golang (Gin framework)
- **Frontend**: Next.js (React)
- **Database**: MySQL
- **Timer**: Frontend-based (JavaScript)

## Đặc điểm chính

- 🎯 **Đơn giản**: Chỉ tập trung vào tính hóa đơn
- ⚡ **Nhanh chóng**: Không có real-time complexity
- 📱 **Responsive**: Hoạt động tốt trên mobile và desktop
- 🔐 **Bảo mật**: JWT authentication với phân quyền
- 💰 **Chính xác**: Tính toán thời gian và dịch vụ chính xác

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
└── README.md
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
