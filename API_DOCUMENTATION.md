# Bi-A Management API Documentation

## Server Information

- **Base URL**: `http://localhost:8080/api`
- **Server Status**: ✅ Running on port 8080
- **Database**: bi_a_tuananh (MySQL/MariaDB)

## Authentication

Sử dụng JWT Token trong header: `Authorization: Bearer <token>`

## Default Accounts

- **Admin**:
  - Username: `admin`
  - Password: `password`
- **Staff**:
  - Username: `staff`
  - Password: `password`

---

## 1. Health Check

**Method**: `GET`  
**URL**: `http://localhost:8080/api/health`  
**Headers**: None required

**Expected Response**:

```json
{
  "message": "Bi-A Management API is running",
  "status": "ok"
}
```

---

## 2. Authentication APIs

### 2.1 Login (Admin)

**Method**: `POST`  
**URL**: `http://localhost:8080/api/auth/login`  
**Headers**:

```
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 2.2 Login (Staff)

**Method**: `POST`  
**URL**: `http://localhost:8080/api/auth/login`  
**Headers**:

```
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "username": "staff",
  "password": "staff123"
}
```

### 2.3 Logout

**Method**: `POST`  
**URL**: `http://localhost:8080/api/auth/logout`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 3. Tables Management APIs 🎱

### 3.1 Get All Tables

**Method**: `GET`  
**URL**: `http://localhost:8080/api/tables/`  
**Headers**:

```
Authorization: Bearer <token>
```

**Expected Response**:

```json
[
  {
    "id": 1,
    "name": "Bàn 1",
    "status": "available",
    "hourly_rate": 50000,
    "created_at": "2025-07-18T...",
    "updated_at": "2025-07-18T..."
  },
  {
    "id": 2,
    "name": "Bàn 2",
    "status": "occupied",
    "hourly_rate": 50000,
    "created_at": "2025-07-18T...",
    "updated_at": "2025-07-18T..."
  }
]
```

### 3.2 Get Active Sessions

**Method**: `GET`  
**URL**: `http://localhost:8080/api/tables/sessions`  
**Headers**:

```
Authorization: Bearer <token>
```

**Expected Response**:

```json
[
  {
    "id": 1,
    "table_id": 1,
    "table_name": "Bàn 1",
    "customer_name": "Nguyễn Văn A",
    "start_time": "2025-07-18T10:00:00Z",
    "preset_duration_minutes": 60,
    "remaining_minutes": 45,
    "hourly_rate": 50000,
    "prepaid_amount": 50000,
    "status": "active",
    "created_by": 1
  }
]
```

### 3.3 Start New Session

**Method**: `POST`  
**URL**: `http://localhost:8080/api/tables/sessions`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "table_id": 1,
  "customer_name": "Nguyễn Văn A",
  "preset_duration_minutes": 60,
  "prepaid_amount": 50000
}
```

**Expected Response**:

```json
{
  "message": "Session started successfully",
  "session": {
    "id": 1,
    "table_id": 1,
    "customer_name": "Nguyễn Văn A",
    "start_time": "2025-07-18T10:00:00Z",
    "preset_duration_minutes": 60,
    "remaining_minutes": 60,
    "hourly_rate": 50000,
    "prepaid_amount": 50000,
    "status": "active"
  }
}
```

### 3.4 Get Session by ID

**Method**: `GET`  
**URL**: `http://localhost:8080/api/tables/sessions/1`  
**Headers**:

```
Authorization: Bearer <token>
```

### 3.5 Update Remaining Time

**Method**: `PUT`  
**URL**: `http://localhost:8080/api/tables/sessions/1/time`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "remaining_minutes": 30
}
```

### 3.6 End Session

**Method**: `POST`  
**URL**: `http://localhost:8080/api/tables/sessions/1/end`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "final_amount": 75000,
  "discount": 5000
}
```

**Expected Response**:

```json
{
  "message": "Session ended successfully",
  "invoice_id": 15,
  "total_amount": 70000
}
```

### 3.7 Auto Expire Sessions

**Method**: `POST`  
**URL**: `http://localhost:8080/api/tables/sessions/expire`  
**Headers**:

```
Authorization: Bearer <token>
```

---

## 4. Products Management APIs 🛒

### 4.1 Get All Products

**Method**: `GET`  
**URL**: `http://localhost:8080/api/products/`  
**Headers**:

```
Authorization: Bearer <token>
```

**Expected Response**:

```json
[
  {
    "id": 1,
    "name": "Coca Cola",
    "category": "drink",
    "price": 15000,
    "description": "Nước ngọt Coca Cola 330ml",
    "is_active": true,
    "created_at": "2025-07-18T...",
    "updated_at": "2025-07-18T..."
  },
  {
    "id": 2,
    "name": "Đậu phộng rang",
    "category": "food",
    "price": 20000,
    "description": "Đậu phộng rang muối",
    "is_active": true,
    "created_at": "2025-07-18T...",
    "updated_at": "2025-07-18T..."
  }
]
```

### 4.2 Create New Product

**Method**: `POST`  
**URL**: `http://localhost:8080/api/products/`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "name": "Bia Larue",
  "category": "drink",
  "price": 30000,
  "description": "Bia Larue lon 330ml"
}
```

### 4.3 Update Product

**Method**: `PUT`  
**URL**: `http://localhost:8080/api/products/1`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "name": "Coca Cola",
  "category": "drink",
  "price": 16000,
  "description": "Nước ngọt Coca Cola 330ml - Giá mới",
  "is_active": true
}
```

### 4.4 Delete Product

**Method**: `DELETE`  
**URL**: `http://localhost:8080/api/products/1`  
**Headers**:

```
Authorization: Bearer <token>
```

---

## 5. Session Orders APIs 🍺

### 5.1 Add Order to Session

**Method**: `POST`  
**URL**: `http://localhost:8080/api/tables/sessions/orders`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**⚠️ Prerequisites**: Session phải ở trạng thái "active"

**Body (JSON)**:

```json
{
  "session_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 3,
      "quantity": 1
    }
  ]
}
```

**Common Errors**:

```json
{
  "error": "session is not active"
}
```

**Solution**: Tạo session mới trước khi add order:

1. **Step 1**: Start new session

   ```
   POST /api/tables/sessions
   {
     "table_id": 1,
     "customer_name": "Nguyễn Văn A",
     "preset_duration_minutes": 60,
     "prepaid_amount": 50000
   }
   ```

2. **Step 2**: Copy session_id từ response

3. **Step 3**: Use session_id trong order request

**Expected Response**:

```json
{
  "message": "Orders added successfully",
  "orders": [
    {
      "id": 1,
      "session_id": 1,
      "product_id": 1,
      "quantity": 2,
      "unit_price": 15000,
      "total_price": 30000,
      "status": "pending"
    },
    {
      "id": 2,
      "session_id": 1,
      "product_id": 3,
      "quantity": 1,
      "unit_price": 25000,
      "total_price": 25000,
      "status": "pending"
    }
  ]
}
```

---

## 6. Enhanced Invoice APIs 📄

### 6.1 Create Invoice

**Method**: `POST`  
**URL**: `http://localhost:8080/api/invoices/`  
**Headers**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON)**:

```json
{
  "amount": 120000,
  "table_name": "Bàn 1",
  "start_time": "2025-07-18T10:00:00Z",
  "end_time": "2025-07-18T12:00:00Z",
  "play_duration_minutes": 120,
  "hourly_rate": 50000,
  "time_total": 100000,
  "services_detail": "2x Coca Cola (30,000), 1x Đậu phộng rang (20,000)",
  "service_total": 50000,
  "discount": 30000,
  "session_id": 1,
  "customer_name": "Nguyễn Văn A",
  "payment_status": "paid"
}
```

### 6.2 Get All Invoices

**Method**: `GET`  
**URL**: `http://localhost:8080/api/invoices/?limit=20&offset=0`  
**Headers**:

```
Authorization: Bearer <token>
```

### 6.3 Get Invoice by ID

**Method**: `GET`  
**URL**: `http://localhost:8080/api/invoices/1`  
**Headers**:

```
Authorization: Bearer <token>
```

---

## 7. Reports APIs 📊

### 7.1 Daily Report

**Method**: `GET`  
**URL**: `http://localhost:8080/api/reports/daily?date=2025-07-18`  
**Headers**:

```
Authorization: Bearer <token>
```

**Expected Response**:

```json
{
  "date": "2025-07-18",
  "total_revenue": 500000,
  "total_invoices": 5,
  "avg_invoice_amount": 100000,
  "total_play_time_minutes": 300,
  "table_utilization": 62.5
}
```

### 7.2 Monthly Report

**Method**: `GET`  
**URL**: `http://localhost:8080/api/reports/monthly?year=2025&month=7`  
**Headers**:

```
Authorization: Bearer <token>
```

---

## 8. Testing Workflow 🔄

### Step 1: Authentication

1. Test Health Check
2. Login với admin account
3. Copy JWT token từ response

### Step 2: Table Management

1. Get all tables
2. Start new session cho 1 bàn
3. Get active sessions
4. Update remaining time
5. End session

### Step 3: Products

1. Get all products
2. Create new product
3. Update existing product
4. Add orders to active session

### Step 4: Reports

1. Get daily report
2. Get monthly report
3. Verify invoice creation

---

## 9. Sample Data Available 📋

### Tables (8 bàn):

- Bàn 1-2: 50,000 VNĐ/giờ
- Bàn 3-4: 60,000 VNĐ/giờ
- Bàn 5-6: 70,000 VNĐ/giờ
- Bàn 7-8: 80,000 VNĐ/giờ

### Products:

**Drinks**: Coca Cola, Pepsi, Bia Saigon, Bia Tiger, Nước suối, Cà phê đen/sữa, Trà đá
**Food**: Mì tôm, Bánh mì, Xúc xích nướng, Nem nướng, Chả cá, Đậu phộng rang, Khô bò
**Accessories**: Phấn bi-a, Găng tay, Cơ bi-a
**Services**: Làm sạch bàn, Thay nỉ bàn

---

## 10. Error Codes 🚨

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

---

## 11. Tips for Testing 💡

1. **Always authenticate first** - Tất cả API (trừ health check và login) đều cần JWT token
2. **Copy token correctly** - Dùng Bearer token format
3. **Check response format** - Verify JSON structure
4. **Test edge cases** - Invalid IDs, expired sessions, etc.
5. **Verify database** - Check data persistence in MySQL Workbench
6. **Test workflows** - Complete session lifecycle from start to invoice

---

## 12. Troubleshooting 🔧

### Common Issues & Solutions

#### 1. "session is not active" Error

**Problem**: Trying to add order to session that's not active
**Solutions**:

- Check session status: `GET /api/tables/sessions/:id`
- Create new session: `POST /api/tables/sessions`
- Verify session_id exists in your request

#### 2. "Authorization header required" Error

**Problem**: Missing or invalid JWT token
**Solutions**:

- Login first: `POST /api/auth/login`
- Copy token from login response
- Add header: `Authorization: Bearer <token>`

#### 3. "table already occupied" Error

**Problem**: Trying to start session on busy table  
**Solutions**:

- Check table status: `GET /api/tables/`
- Choose available table
- End existing session first

#### 4. "product not found" Error

**Problem**: Invalid product_id in order
**Solutions**:

- Get products list: `GET /api/products/`
- Use valid product_id from response
- Ensure product is_active = true

### Debug Workflow 🐛

1. **Check server status**: `GET /api/health`
2. **Login & get token**: `POST /api/auth/login`
3. **Check tables**: `GET /api/tables/`
4. **Check active sessions**: `GET /api/tables/sessions`
5. **Start new session if needed**: `POST /api/tables/sessions`
6. **Get products**: `GET /api/products/`
7. **Add orders**: `POST /api/tables/sessions/orders`

---

## 13. Recent Updates ✅

### ✅ **Loại bỏ Stock Management**

- **Lý do**: Hệ thống bán hàng có thể nhập hàng tùy thích, không cần quản lý tồn kho
- **Thay đổi**: Xóa field `stock` khỏi Products API và database
- **Ảnh hưởng**: Products API đơn giản hơn, không cần tracking số lượng

### ✅ **Sửa lỗi Session Orders API**

- **Vấn đề**: Backend expect `items` array nhưng API guide dùng format sai
- **Giải pháp**: Cập nhật body format đúng với backend:

```json
{
  "session_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

### ✅ **Backend Status**

- ✅ Server running on port 8080
- ✅ Database updated (stock column removed)
- ✅ All APIs functional
- ✅ Ready for testing

---

**Last Updated**: July 18, 2025 - 10:20 AM  
**Backend Version**: Enhanced v2 - No Stock Management + Troubleshooting  
**Database Schema**: v4 - Stock-free products
Authorization: Bearer <your_token_here>

```

---

## 3. Invoice Management APIs

### 3.1 Create Invoice

**Method**: `POST`
**URL**: `http://localhost:8080/api/invoices/`
**Headers**:

```

Content-Type: application/json
Authorization: Bearer <your_token_here>

````

**Body (JSON)**:

```json
{
  "table_name": "Bàn 1",
  "start_time": "2025-07-18T08:00:00Z",
  "end_time": "2025-07-18T10:30:00Z",
  "play_duration_minutes": 150,
  "hourly_rate": 50000,
  "services_detail": "Nước ngọt: 2 chai",
  "service_total": 20000,
  "discount": 0
}
````

### 3.2 Create Invoice (Table 2)

**Method**: `POST`  
**URL**: `http://localhost:8080/api/invoices/`  
**Headers**:

```
Content-Type: application/json
Authorization: Bearer <your_token_here>
```

**Body (JSON)**:

```json
{
  "table_name": "Bàn 2",
  "start_time": "2025-07-18T09:00:00Z",
  "end_time": "2025-07-18T11:00:00Z",
  "play_duration_minutes": 120,
  "hourly_rate": 60000,
  "services_detail": "Bia: 3 lon, Snack: 1 gói",
  "service_total": 80000,
  "discount": 10000
}
```

### 3.3 Get All Invoices

**Method**: `GET`  
**URL**: `http://localhost:8080/api/invoices/?limit=10&offset=0`  
**Headers**:

```
Authorization: Bearer <your_token_here>
```

### 3.4 Get Invoice by ID

**Method**: `GET`  
**URL**: `http://localhost:8080/api/invoices/1`  
**Headers**:

```
Authorization: Bearer <your_token_here>
```

---

## 4. Reports APIs

### 4.1 Daily Report

**Method**: `GET`  
**URL**: `http://localhost:8080/api/reports/daily?date=2025-07-18`  
**Headers**:

```
Authorization: Bearer <your_token_here>
```

**Expected Response**:

```json
{
  "date": "2025-07-18",
  "total_invoices": 2,
  "total_revenue": 270000,
  "total_time_revenue": 245000,
  "total_service_revenue": 100000
}
```

### 4.2 Monthly Report

**Method**: `GET`  
**URL**: `http://localhost:8080/api/reports/monthly?year=2025&month=7`  
**Headers**:

```
Authorization: Bearer <your_token_here>
```

**Expected Response**:

```json
{
  "year": 2025,
  "month": 7,
  "total_invoices": 2,
  "total_revenue": 270000,
  "total_time_revenue": 245000,
  "total_service_revenue": 100000
}
```

---

## 5. Testing Workflow

### Bước 1: Health Check

1. Test endpoint Health Check để đảm bảo server hoạt động

### Bước 2: Authentication

1. Login với admin account
2. Copy token từ response
3. Sử dụng token này cho các request tiếp theo

### Bước 3: Create Invoices

1. Tạo invoice đầu tiên (Bàn 1)
2. Tạo invoice thứ hai (Bàn 2)
3. Kiểm tra response có đúng format không

### Bước 4: Query Invoices

1. Get all invoices để xem danh sách
2. Get invoice by ID (thử với ID = 1)

### Bước 5: Reports

1. Get daily report cho ngày hôm nay (2025-07-18)
2. Get monthly report cho tháng 7/2025

---

## 6. Sample Expected Responses

### Invoice Creation Response

```json
{
  "id": 1,
  "amount": 145000,
  "table_name": "Bàn 1",
  "start_time": "2025-07-18T08:00:00Z",
  "end_time": "2025-07-18T10:30:00Z",
  "play_duration_minutes": 150,
  "hourly_rate": 50000,
  "time_total": 125000,
  "services_detail": "Nước ngọt: 2 chai",
  "service_total": 20000,
  "discount": 0,
  "created_by": 1,
  "created_at": "2025-07-18T07:24:10Z"
}
```

### All Invoices Response

```json
[
  {
    "id": 1,
    "amount": 145000,
    "table_name": "Bàn 1"
    // ... other fields
  },
  {
    "id": 2,
    "amount": 190000,
    "table_name": "Bàn 2"
    // ... other fields
  }
]
```

---

## 7. Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 400 Bad Request

```json
{
  "error": "Invalid request format"
}
```

### 404 Not Found

```json
{
  "error": "Invoice not found"
}
```

---

## 8. Notes

- Server đang chạy ở chế độ debug, sẽ hiển thị log chi tiết
- Database đã có sẵn 2 user: admin và staff
- Tất cả thời gian sử dụng format ISO 8601: `YYYY-MM-DDTHH:MM:SSZ`
- Token JWT có thời hạn, nếu hết hạn cần login lại
- Hourly rate và amounts tính bằng VND (không có dấu phẩy)

## 9. Business Logic

### Tính toán hóa đơn:

- `time_total = (play_duration_minutes / 60) * hourly_rate`
- `amount = time_total + service_total - discount`

### Ví dụ:

- Chơi 150 phút (2.5 giờ) với giá 50,000đ/giờ = 125,000đ
- Dịch vụ: 20,000đ
- Giảm giá: 0đ
- **Tổng tiền: 145,000đ**
