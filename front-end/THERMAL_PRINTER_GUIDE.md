# 🖨️ Hướng Dẫn Kết Nối Máy In Hóa Đơn Nhiệt

## 1. **Các Loại Máy In Nhiệt Phổ Biến**

### **🔥 Máy In POS Nhiệt 80mm:**

- **Xprinter XP-80C** (1.2 - 1.8 triệu)
- **HPRT TP805** (1.5 - 2.2 triệu)
- **GPRINTER GP-80230I** (2 - 2.8 triệu)
- **Epson TM-T82** (3 - 4 triệu)

### **📱 Máy In Bluetooth 58mm:**

- **Xprinter XP-58IIH** (800k - 1.2 triệu)
- **HPRT MPT-II** (900k - 1.5 triệu)
- **Goojprt MTP-II** (600k - 1 triệu)

---

## 2. **Cách Kết Nối Máy In**

### **🔌 Kết Nối USB:**

```javascript
// 1. Cắm USB vào máy tính
// 2. Cài driver từ CD hoặc tải từ website nhà sản xuất
// 3. Kiểm tra trong Device Manager
// 4. Sử dụng Web Serial API hoặc Electron
```

### **📶 Kết Nối Bluetooth:**

```javascript
// 1. Bật Bluetooth trên máy in và máy tính
// 2. Pair device trong Windows Settings
// 3. Sử dụng Web Bluetooth API
```

### **🌐 Kết Nối WiFi/Ethernet:**

```javascript
// 1. Kết nối máy in vào mạng
// 2. Tìm IP address của máy in
// 3. Gửi ESC/POS qua TCP socket
```

---

## 3. **Tích Hợp Vào Hệ Thống**

### **🖥️ Option 1: Web Serial API (Chrome)**

```typescript
// Đã tích hợp trong ThermalPrint.tsx
async function printToThermalPrinter(commands: string) {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 9600 });

  const writer = port.writable.getWriter();
  await writer.write(new TextEncoder().encode(commands));

  writer.releaseLock();
  await port.close();
}
```

### **🔄 Option 2: Electron App**

```javascript
// Tạo Electron wrapper cho ứng dụng web
const { SerialPort } = require("serialport");

function printToSerial(data) {
  const port = new SerialPort("/dev/ttyUSB0", { baudRate: 9600 });
  port.write(data);
}
```

### **🌐 Option 3: Print Server**

```go
// Tạo service Go để handle printing
package main

import (
    "fmt"
    "net/http"
    "github.com/tarm/serial"
)

func printHandler(w http.ResponseWriter, r *http.Request) {
    config := &serial.Config{Name: "COM3", Baud: 9600}
    port, err := serial.OpenPort(config)
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }
    defer port.Close()

    // Nhận ESC/POS từ frontend và in
    data := r.FormValue("commands")
    port.Write([]byte(data))
}
```

---

## 4. **Cài Đặt Máy In**

### **📋 Bước 1: Chuẩn Bị**

1. Mua máy in nhiệt POS 80mm hoặc 58mm
2. Mua giấy in nhiệt (thermal paper)
3. Kết nối USB, Bluetooth hoặc WiFi

### **⚙️ Bước 2: Cài Driver**

```bash
# Windows: Tải driver từ website nhà sản xuất
# Hoặc sử dụng Windows Generic / Text Only driver

# Linux:
sudo apt-get install cups-pdf
sudo lpadmin -p thermal_printer -E -v usb://printer_uri
```

### **🔧 Bước 3: Test Print**

```javascript
// Test với ESC/POS commands cơ bản
const testPrint = () => {
  const commands =
    "\x1B\x40" + // Initialize
    "Test Print\n" +
    "\x1B\x64\x05"; // Feed 5 lines
  // Gửi qua Serial/Bluetooth/Network
};
```

---

## 5. **Định Dạng Hóa Đơn**

### **📏 Kích Thước Giấy:**

- **80mm**: 48 ký tự/dòng
- **58mm**: 32 ký tự/dòng
- **57mm**: 30 ký tự/dòng

### **🎨 ESC/POS Commands:**

```javascript
const ESC = "\x1B";
const GS = "\x1D";

// Font size
ESC + "!" + "\x00"; // Normal
ESC + "!" + "\x38"; // Double height & width

// Alignment
ESC + "a" + "\x00"; // Left
ESC + "a" + "\x01"; // Center
ESC + "a" + "\x02"; // Right

// Cut paper
GS + "V" + "\x42" + "\x00"; // Partial cut
```

---

## 6. **Troubleshooting**

### **❌ Lỗi Thường Gặp:**

**🔌 Không kết nối được:**

- Kiểm tra driver đã cài đúng
- Thử đổi cổng USB
- Restart máy tính và máy in

**📄 In ra giấy trắng:**

- Kiểm tra giấy nhiệt đúng mặt
- Đầu in có thể bị bẩn
- Nhiệt độ in quá thấp

**🔤 Font bị lỗi:**

- Sử dụng font monospace
- Tránh ký tự đặc biệt
- Encode UTF-8 đúng cách

---

## 7. **Tích Hợp Production**

### **🚀 Deployment:**

1. **Web App**: Sử dụng Progressive Web App (PWA)
2. **Desktop**: Đóng gói với Electron
3. **Server**: Deploy print service riêng
4. **Mobile**: React Native + Bluetooth

### **🔒 Security:**

- HTTPS cho Web Serial API
- Validate ESC/POS commands
- Rate limiting cho print requests

---

## 8. **Demo & Test**

```javascript
// Test ngay trong trình duyệt
const testThermalPrint = async () => {
  try {
    if ("serial" in navigator) {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable.getWriter();
      const commands =
        "\x1B\x40" + // Init
        "QUAN BI-A TUAN ANH\n" +
        "Test Print Success!\n" +
        "\x1B\x64\x05"; // Feed

      await writer.write(new TextEncoder().encode(commands));
      writer.releaseLock();
      await port.close();

      alert("In thành công!");
    }
  } catch (error) {
    console.error("Print error:", error);
  }
};
```

---

## 9. **Mua Sắm Thiết Bị**

### **🛒 Gợi Ý Mua:**

1. **Budget**: Xprinter XP-58IIH (~1 triệu)
2. **Standard**: HPRT TP805 (~2 triệu)
3. **Premium**: Epson TM-T82 (~4 triệu)

### **📦 Phụ Kiện:**

- Giấy in nhiệt 80mm x 80m (50k/cuộn)
- Cáp USB A-B (50k)
- Adapter 24V (nếu cần)

---

**✅ Hệ thống đã sẵn sàng để tích hợp máy in nhiệt!**

Chỉ cần:

1. Mua máy in nhiệt
2. Kết nối USB/Bluetooth
3. Test với nút "In Nhiệt" trong ứng dụng
4. Enjoy professional printing! 🎉
