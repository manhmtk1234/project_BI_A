# 🖨️ Hướng Dẫn In Nhiệt Cho Khách Hàng

## 📋 **Yêu Cầu Hệ Thống:**

### **✅ Trình Duyệt Hỗ Trợ:**
- ✅ Chrome/Chromium 89+ 
- ✅ Edge 89+
- ❌ Firefox (không hỗ trợ WebUSB)
- ❌ Safari (không hỗ trợ WebUSB)

### **🔌 Máy In Hỗ Trợ:**
- ✅ Máy in nhiệt 80mm (ESC/POS compatible)
- ✅ Kết nối USB
- ✅ Driver đã cài đặt

---

## 🌐 **Phương Thức Truy Cập Website:**

### **🔐 HTTPS (Cần domain + SSL - Tính năng đầy đủ):**
```
https://anhminhclubbia.com
```
**Chi phí:** ~1-2 triệu/năm (domain + hosting)  
**Tính năng:**
- ✅ In trực tiếp USB (WebUSB API)
- ✅ In qua Windows Print dialog
- ✅ Tải file ESC/POS
- ✅ In thường (Ctrl+P)

### **🌍 HTTP (Không cần domain - Tiết kiệm chi phí):**
```
http://server-ip:3000
```
**Chi phí:** Chỉ server/hosting (~500k-1tr/năm)  
**Tính năng:**
- ❌ In trực tiếp USB (bị chặn bởi browser)
- ✅ In qua Windows Print dialog (VẪN HOẠT ĐỘNG TỐT)
- ✅ Tải file ESC/POS
- ✅ In thường (Ctrl+P)

> **💡 Lưu ý:** Với HTTP, khách hàng vẫn in được hóa đơn nhiệt bình thường qua Windows Print dialog!

---

## 📖 **Hướng Dẫn Sử Dụng:**

### **🔧 Bước 1: Chuẩn Bị Máy In**
1. Cắm máy in USB vào máy tính
2. Đảm bảo máy in đã bật và có giấy
3. Cài driver máy in (nếu chưa có)
4. Test in từ Windows để đảm bảo hoạt động

### **🌐 Bước 2: Truy Cập Website**
1. Mở Chrome hoặc Edge
2. Truy cập website của quán
3. Đăng nhập vào hệ thống

### **🖨️ Bước 3: In Hóa Đơn**

#### **Trường Hợp 1: Website HTTPS**
1. Chọn hóa đơn cần in
2. Bấm nút **"In Nhiệt"**  
3. Chọn máy in trong dialog WebUSB
4. ✅ **In thành công!**

#### **Trường Hợp 2: Website HTTP (Không cần domain)**
1. Chọn hóa đơn cần in
2. Bấm nút **"In Nhiệt"**
3. Xuất hiện thông báo: *"Lưu ý: Để sử dụng in trực tiếp USB, vui lòng truy cập qua HTTPS..."*
4. Tự động mở Windows Print dialog
5. Chọn máy in nhiệt trong danh sách
6. ✅ **In thành công!** (Giống in USB, chất lượng tương tự)

---

## 🛠️ **Xử Lý Sự Cố:**

### **❌ "USB Access Denied"**
**Nguyên nhân:** Website HTTP hoặc máy in đang được sử dụng
**Giải pháp:**
1. Kiểm tra URL có HTTPS không
2. Đóng tất cả ứng dụng khác đang dùng máy in
3. Ngắt USB → Đợi 5s → Cắm lại
4. Restart Chrome

### **❌ "No device selected"**
**Nguyên nhân:** Chưa chọn máy in trong dialog
**Giải pháp:**
1. Bấm "In Nhiệt" lại
2. Chọn máy in trong dialog WebUSB
3. Cho phép truy cập thiết bị

### **❌ "Không tìm thấy máy in"**
**Nguyên nhân:** Driver chưa cài hoặc máy in chưa nhận diện
**Giải pháp:**
1. Kiểm tra máy in trong Device Manager
2. Cài driver từ nhà sản xuất
3. Test in từ Windows trước

---

## 💡 **Các Phương Thức In Dự Phòng:**

### **1. Windows Print Dialog (Luôn hoạt động)**
- Tự động mở khi WebUSB không khả dụng
- Chọn máy in nhiệt trong danh sách
- Format tương tự in nhiệt trực tiếp

### **2. Tải File ESC/POS**
- Tự động tải file khi không thể in
- Mở file bằng phần mềm máy in
- Copy nội dung và in thủ công

### **3. In Thường (Backup)**
- Bấm nút **"In Thường"**
- Sử dụng Ctrl+P
- Phù hợp cho máy in A4 thông thường

---

## 📞 **Hỗ Trợ Kỹ Thuật:**

**Liên hệ:** 0869.986.566  
**Email:** anhminhclubbia@gmail.com

**Thông tin cần cung cấp khi gặp sự cố:**
- Hệ điều hành (Windows 10/11)
- Trình duyệt (Chrome/Edge + version)
- Model máy in nhiệt
- URL website (HTTP/HTTPS)
- Mô tả lỗi chi tiết

---

*Cập nhật: 23/07/2025 - ANH MINH CLUB BI-A*
