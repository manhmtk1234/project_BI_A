# 🖨️ Test Setup Máy In Nhiệt - Hướng Dẫn Chi Tiết

## 1. **Không Có Máy In - Test Offline**

### **🔧 Mock Test (Không cần máy in thật):**
```javascript
// Test function trong browser console
const testThermalPrintMock = () => {
  try {
    // Simulate ESC/POS commands
    const commands = '\x1B\x40' + // Initialize
                     'QUAN BI-A TUAN ANH\n' +
                     '================================\n' +
                     'HOA DON THANH TOAN\n' +
                     '================================\n' +
                     'So HD: #000001\n' +
                     'Ban: Ban 1\n' +
                     'Ngay: ' + new Date().toLocaleString('vi-VN') + '\n' +
                     '--------------------------------\n' +
                     'Tien ban:           150.000 VND\n' +
                     'Dich vu:             50.000 VND\n' +
                     '--------------------------------\n' +
                     'TONG TIEN:          200.000 VND\n' +
                     '================================\n' +
                     'Cam on quy khach!\n' +
                     'Hen gap lai!\n' +
                     '\x1B\x64\x05'; // Feed 5 lines
    
    // Download as text file để test format
    const blob = new Blob([commands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test_receipt.txt';
    a.click();
    
    console.log('ESC/POS Commands:', commands);
    alert('Test file downloaded! Check format.');
    
  } catch (error) {
    console.error('Mock test error:', error);
  }
};

// Chạy test
testThermalPrintMock();
```

---

## 2. **Có Máy In Thật - Setup Driver**

### **🔌 Windows Setup:**

#### **Bước 1: Download Driver**
```bash
# Xprinter Series:
https://www.xprinter.net/download/

# HPRT Series: 
https://www.hprt.com/download

# Generic Driver (Universal):
Windows Settings > Printers > Add Printer > "Generic / Text Only"
```

#### **Bước 2: Cài Đặt**
```bash
1. Kết nối USB máy in vào máy tính
2. Bật máy in
3. Windows sẽ auto-detect hoặc cài manual
4. Vào Device Manager kiểm tra
5. Test print từ Windows để đảm bảo hoạt động
```

#### **Bước 3: Kiểm Tra Port**
```bash
# Vào Device Manager > Ports (COM & LPT)
# Tìm máy in (thường là COM3, COM4...)
# Note lại port name để dùng trong code
```

---

## 3. **Test Trong Ứng Dụng**

### **🌐 Web Serial API Test:**
```javascript
// Mở browser Chrome (Edge cũng được)
// Vào http://localhost:3000/invoices
// Click "In Nhiệt" trên một hóa đơn
// Browser sẽ hiện popup chọn Serial Port
// Chọn máy in và test
```

### **📱 Test Bằng Console:**
```javascript
// Paste vào browser console để test trực tiếp
const testRealPrinter = async () => {
  try {
    if ('serial' in navigator) {
      // Request port selection
      const port = await navigator.serial.requestPort();
      await port.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      
      // Simple test commands
      const testCommands = '\x1B\x40' + // Initialize
                          'TEST PRINT\n' +
                          'Xin chao!\n' +
                          'Hello World!\n' +
                          '================\n' +
                          new Date().toLocaleString('vi-VN') + '\n' +
                          '\x1B\x64\x05'; // Feed
      
      await writer.write(encoder.encode(testCommands));
      
      writer.releaseLock();
      await port.close();
      
      alert('In thành công!');
    } else {
      alert('Browser không hỗ trợ Web Serial API');
    }
  } catch (error) {
    console.error('Print error:', error);
    alert('Lỗi in: ' + error.message);
  }
};

// Chạy test
testRealPrinter();
```

---

## 4. **Troubleshooting**

### **❌ Lỗi Thường Gặp:**

#### **"Port not found":**
```bash
- Kiểm tra máy in đã bật
- Kiểm tra cáp USB
- Restart browser
- Kiểm tra Device Manager
```

#### **"Access denied":**
```bash
- Đóng tất cả app khác đang dùng máy in
- Restart máy in
- Try different USB port
```

#### **"In ra giấy trắng":**
```bash
- Kiểm tra giấy nhiệt đúng mặt (mặt bóng hướng lên)
- Đầu in có thể bị bẩn
- Kiểm tra ESC/POS commands
```

#### **"Font lỗi/không đọc được":**
```bash
- Sử dụng charset đơn giản
- Tránh ký tự đặc biệt
- Test với ASCII characters trước
```

---

## 5. **Step-by-Step Test Plan**

### **📝 Checklist:**

#### **Phase 1: Preparation**
- [ ] Mua máy in + giấy nhiệt
- [ ] Cài driver
- [ ] Test print từ Windows/Notepad
- [ ] Note lại COM port

#### **Phase 2: Web App Test**
- [ ] Start frontend: `npm run dev`
- [ ] Vào http://localhost:3000
- [ ] Tạo 1 hóa đơn test
- [ ] Click "In Nhiệt"
- [ ] Chọn Serial Port
- [ ] Kiểm tra kết quả in

#### **Phase 3: Fine-tuning**
- [ ] Adjust ESC/POS commands nếu cần
- [ ] Test với data thật
- [ ] Optimize format layout
- [ ] Test error handling

---

## 6. **Alternative: Test Không Cần Driver**

### **🔧 Bluetooth Test (Nếu máy hỗ trợ):**
```javascript
// Sử dụng Web Bluetooth API
const testBluetoothPrint = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['0000ff00-0000-1000-8000-00805f9b34fb'] }]
    });
    
    const server = await device.gatt.connect();
    // Send print commands via Bluetooth
    
  } catch (error) {
    console.error('Bluetooth error:', error);
  }
};
```

---

## 🎯 **Kết Luận**

### **✅ Recommend Flow:**
1. **Start Mock Test** → Download file để check format
2. **Buy Printer** → Gợi ý Xprinter XP-58IIH cho budget
3. **Install Driver** → Generic Text Driver là đủ
4. **Real Test** → Dùng console code ở trên
5. **Integration** → Test trong app thật

### **📞 Support:**
Nếu có vấn đề, paste error message và tôi sẽ debug cụ thể!
