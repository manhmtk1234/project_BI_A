# 🧪 Script Test HTTP Deployment

## Test Trên Máy Local (Giả lập HTTP deployment)

### 1. Tạo Test File HTML
Tạo file `test-http-print.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test HTTP Print</title>
</head>
<body>
    <h1>Test In Nhiệt HTTP</h1>
    <button onclick="testThermalPrint()">Test In Nhiệt</button>
    
    <script>
    function testThermalPrint() {
        // Simulate HTTP environment check
        const isSecureContext = window.location.protocol === 'https:' || 
                                window.location.hostname === 'localhost' || 
                                window.location.hostname === '127.0.0.1';
        
        console.log('Protocol:', window.location.protocol);
        console.log('Is Secure Context:', isSecureContext);
        
        if (!isSecureContext) {
            alert('💡 Lưu ý: Để sử dụng in trực tiếp USB, vui lòng truy cập qua HTTPS.\\nHiện tại sẽ mở Windows Print dialog.');
        }
        
        // Open Windows Print dialog with thermal receipt format
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Test Hóa đơn In Nhiệt</title>
                        <style>
                            body { font-family: monospace; width: 300px; margin: 0; padding: 10px; }
                            .center { text-align: center; }
                            .bold { font-weight: bold; }
                            .large { font-size: 18px; }
                            hr { border: 1px dashed #000; }
                        </style>
                    </head>
                    <body>
                        <div class="center bold large">ANH MINH CLUB BI-A</div>
                        <div class="center">Sân bóng Hào Xuyên, Thôn Hào Xuyên- Xã Yên Mỹ - Tỉnh Hưng Yên</div>
                        <div class="center">ĐT: 0869.986.566</div>
                        <hr>
                        <div class="center bold">HÓA ĐƠN THANH TOÁN</div>
                        <br>
                        Số HĐ: #000001<br>
                        Bàn: Bàn 1<br>
                        Ngày: 23/07/2025 14:30<br>
                        <hr>
                        <div class="bold">THỜI GIAN CHƠI:</div>
                        Bắt đầu: 23/07/2025 13:00<br>
                        Kết thúc: 23/07/2025 14:30<br>
                        Tổng thời gian: 1h 30m<br>
                        Giá/giờ: 50.000₫<br>
                        <div class="bold">Tiền bàn: 75.000₫</div>
                        <hr>
                        Tạm tính: 75.000₫<br>
                        <div class="bold large">TỔNG TIỀN: 75.000₫</div>
                        <hr>
                        <div class="center">Cảm ơn quý khách!</div>
                        <div class="center">Hẹn gặp lại!</div>
                        <div class="center">In lúc: ${new Date().toLocaleString('vi-VN')}</div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }
    </script>
</body>
</html>
```

### 2. Test Steps:

1. **Upload file lên web server** (hoặc mở bằng http-server)
2. **Truy cập qua HTTP IP**: http://your-ip/test-http-print.html  
3. **Bấm "Test In Nhiệt"**
4. **Kết quả mong đợi:**
   - Thông báo: "Lưu ý: Để sử dụng in trực tiếp USB..."
   - Mở Windows Print dialog
   - Format giống hóa đơn nhiệt
   - Có thể chọn máy in nhiệt và in thành công

### 3. Test với Ngrok (Giả lập domain thật):

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Sẽ có URL: http://abc123.ngrok.io
# Test với URL này → Giống production
```

### 4. Checklist Test:

- [ ] Truy cập được từ máy khác
- [ ] Hiển thị thông báo HTTP warning
- [ ] Windows Print dialog mở được
- [ ] Format hóa đơn đúng
- [ ] Có thể chọn máy in nhiệt
- [ ] In thành công

### 5. Expected Behavior:

✅ **HOẠT ĐỘNG:**
- Windows Print dialog
- Format ESC/POS
- Chọn máy in nhiệt
- In thành công

❌ **KHÔNG HOẠT ĐỘNG:**
- WebUSB direct printing
- Web Serial API

**KẾT LUẬN:** Khách hàng vẫn in được bình thường!
