import React, { useState, useEffect } from 'react';

// Thông tin quán - Chỉnh sửa ở đây
const SHOP_INFO = {
  name: 'ANH MINH CLUB BI-A',
  address: 'Sân bóng Hào Xuyên, Thôn Hào Xuyên- Xã Yên Mỹ - Tỉnh Hưng Yên',
  phone: '0869.986.566',
  nameAscii: 'ANH MINH CLUB BI-A', // Cho máy in nhiệt (không dấu)
  addressAscii: 'San bong Hao Xuyen, Thon Hao Xuyen- Xa Yen My - Tinh Hung Yen',
  phoneAscii: '0869.986.566'
};

interface Invoice {
  id: number;
  table_name: string;
  customer_name?: string;
  start_time: string;
  end_time: string;
  play_duration_minutes: number;
  hourly_rate: number;
  time_total: number;
  services_detail: string;
  service_total: number;
  discount: number;
  amount: number;
  created_at: string;
  payment_status?: string;
}

interface ThermalPrintProps {
  invoice: Invoice;
  onClose: () => void;
}

export const ThermalPrintReceipt: React.FC<ThermalPrintProps> = ({ invoice, onClose }) => {
  const [isClient, setIsClient] = useState(false);
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    setTimestamp(Date.now().toString());
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleThermalPrint = async () => {
    try {
      const escPos = generateESCPOSCommands(invoice);
      
      // Check if we're on HTTPS or localhost
      const isSecureContext = window.location.protocol === 'https:' || 
                              window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
      
      // Try WebUSB API FIRST (only on secure contexts)
      if ('usb' in navigator && isSecureContext) {
        try {
          await printToUSBPrinter(escPos);
          return;
        } catch (usbError: any) {
          // USB failed, try Windows Print fallback
          try {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Hóa đơn In Nhiệt</title>
                    <style>
                      body { font-family: monospace; width: 300px; margin: 0; padding: 10px; }
                      .center { text-align: center; }
                      .bold { font-weight: bold; }
                      .large { font-size: 18px; }
                      hr { border: 1px dashed #000; }
                    </style>
                  </head>
                  <body>
                    <div class="center bold large">${SHOP_INFO.name}</div>
                    <div class="center">${SHOP_INFO.address}</div>
                    <div class="center">ĐT: ${SHOP_INFO.phone}</div>
                    <hr>
                    <div class="center bold">HÓA ĐƠN THANH TOÁN</div>
                    <br>
                    Số HĐ: #${invoice.id.toString().padStart(6, '0')}<br>
                    Bàn: ${invoice.table_name}<br>
                    ${invoice.customer_name ? `Khách: ${invoice.customer_name}<br>` : ''}
                    Ngày: ${formatDateTime(invoice.created_at)}<br>
                    <hr>
                    <div class="bold">THỜI GIAN CHƠI:</div>
                    Bắt đầu: ${formatDateTime(invoice.start_time)}<br>
                    Kết thúc: ${formatDateTime(invoice.end_time)}<br>
                    Tổng thời gian: ${formatDuration(invoice.play_duration_minutes)}<br>
                    Giá/giờ: ${formatCurrency(invoice.hourly_rate)}<br>
                    <div class="bold">Tiền bàn: ${formatCurrency(invoice.time_total)}</div>
                    ${invoice.services_detail && invoice.service_total > 0 ? `
                      <hr>
                      <div class="bold">DỊCH VỤ:</div>
                      ${invoice.services_detail}<br>
                      <div class="bold">Tiền dịch vụ: ${formatCurrency(invoice.service_total)}</div>
                    ` : ''}
                    <hr>
                    Tạm tính: ${formatCurrency(invoice.time_total + invoice.service_total)}<br>
                    ${invoice.discount > 0 ? `Giảm giá: -${formatCurrency(invoice.discount)}<br>` : ''}
                    <div class="bold large">TỔNG TIỀN: ${formatCurrency(invoice.amount)}</div>
                    <hr>
                    <div class="center">Cảm ơn quý khách!</div>
                    <div class="center">Hẹn gặp lại!</div>
                    <div class="center">In lúc: ${new Date().toLocaleString('vi-VN')}</div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
              return;
            }
          } catch (printError) {
            // Windows Print failed, continue to next method
          }
          
          // Try Serial as last resort (only on secure contexts)
          if ('serial' in navigator && isSecureContext) {
            try {
              await printToThermalPrinter(escPos);
              return;
            } catch (serialError) {
              // Serial failed, continue to file download
            }
          }
        }
      } else if (!isSecureContext) {
        // On HTTP sites, show info and go straight to Windows Print
        alert('💡 Lưu ý: Để sử dụng in trực tiếp USB, vui lòng truy cập qua HTTPS.\nHiện tại sẽ mở Windows Print dialog.');
      }
      
      // Windows Print fallback - always try this
      try {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Hóa đơn In Nhiệt</title>
                <style>
                  body { font-family: monospace; width: 300px; margin: 0; padding: 10px; }
                  .center { text-align: center; }
                  .bold { font-weight: bold; }
                  .large { font-size: 18px; }
                  hr { border: 1px dashed #000; }
                </style>
              </head>
              <body>
                <div class="center bold large">${SHOP_INFO.name}</div>
                <div class="center">${SHOP_INFO.address}</div>
                <div class="center">ĐT: ${SHOP_INFO.phone}</div>
                <hr>
                <div class="center bold">HÓA ĐƠN THANH TOÁN</div>
                <br>
                Số HĐ: #${invoice.id.toString().padStart(6, '0')}<br>
                Bàn: ${invoice.table_name}<br>
                ${invoice.customer_name ? `Khách: ${invoice.customer_name}<br>` : ''}
                Ngày: ${formatDateTime(invoice.created_at)}<br>
                <hr>
                <div class="bold">THỜI GIAN CHƠI:</div>
                Bắt đầu: ${formatDateTime(invoice.start_time)}<br>
                Kết thúc: ${formatDateTime(invoice.end_time)}<br>
                Tổng thời gian: ${formatDuration(invoice.play_duration_minutes)}<br>
                Giá/giờ: ${formatCurrency(invoice.hourly_rate)}<br>
                <div class="bold">Tiền bàn: ${formatCurrency(invoice.time_total)}</div>
                ${invoice.services_detail && invoice.service_total > 0 ? `
                  <hr>
                  <div class="bold">DỊCH VỤ:</div>
                  ${invoice.services_detail}<br>
                  <div class="bold">Tiền dịch vụ: ${formatCurrency(invoice.service_total)}</div>
                ` : ''}
                <hr>
                Tạm tính: ${formatCurrency(invoice.time_total + invoice.service_total)}<br>
                ${invoice.discount > 0 ? `Giảm giá: -${formatCurrency(invoice.discount)}<br>` : ''}
                <div class="bold large">TỔNG TIỀN: ${formatCurrency(invoice.amount)}</div>
                <hr>
                <div class="center">Cảm ơn quý khách!</div>
                <div class="center">Hẹn gặp lại!</div>
                <div class="center">In lúc: ${new Date().toLocaleString('vi-VN')}</div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
          return;
        }
      } catch (printError) {
        // Windows Print failed, continue to next method
      }
      
      // Final fallback: download file
      downloadPrintFile(escPos, timestamp);
      
    } catch (error) {
      alert('Không thể kết nối máy in nhiệt. Vui lòng sử dụng in thường.');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Print Controls */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:hidden">
          <h3 className="text-lg font-semibold text-gray-900">In Hóa Đơn</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleThermalPrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              In Nhiệt
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              In Thường
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="thermal-receipt p-4" style={{ fontFamily: 'monospace', maxWidth: '300px', margin: '0 auto' }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div className="text-lg font-bold">{SHOP_INFO.name}</div>
            <div className="text-sm">{SHOP_INFO.address}</div>
            <div className="text-sm">ĐT: {SHOP_INFO.phone}</div>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="text-sm font-bold">HÓA ĐƠN THANH TOÁN</div>
          </div>

          {/* Invoice Info */}
          <div className="text-sm space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Số HĐ:</span>
              <span>#{invoice.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="flex justify-between">
              <span>Bàn:</span>
              <span>{invoice.table_name}</span>
            </div>
            {invoice.customer_name && (
              <div className="flex justify-between">
                <span>Khách:</span>
                <span>{invoice.customer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Ngày:</span>
              <span>{formatDateTime(invoice.created_at)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Time Details */}
          <div className="text-sm space-y-1 mb-3">
            <div className="font-semibold">THỜI GIAN CHƠI:</div>
            <div className="flex justify-between">
              <span>Bắt đầu:</span>
              <span>{formatDateTime(invoice.start_time)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kết thúc:</span>
              <span>{formatDateTime(invoice.end_time)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng thời gian:</span>
              <span>{formatDuration(invoice.play_duration_minutes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Giá/giờ:</span>
              <span>{formatCurrency(invoice.hourly_rate)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Tiền bàn:</span>
              <span>{formatCurrency(invoice.time_total)}</span>
            </div>
          </div>

          {/* Services */}
          {invoice.services_detail && invoice.service_total > 0 && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div className="text-sm space-y-1 mb-3">
                <div className="font-semibold">DỊCH VỤ:</div>
                <div className="text-xs whitespace-pre-wrap">{invoice.services_detail}</div>
                <div className="flex justify-between font-semibold">
                  <span>Tiền dịch vụ:</span>
                  <span>{formatCurrency(invoice.service_total)}</span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Total */}
          <div className="text-sm space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span>{formatCurrency(invoice.time_total + invoice.service_total)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="border-t border-gray-400 pt-1">
              <div className="flex justify-between font-bold text-base">
                <span>TỔNG TIỀN:</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Footer */}
          <div className="text-center text-xs space-y-1">
            <div>Cảm ơn quý khách!</div>
            <div>Hẹn gặp lại!</div>
            <div className="mt-2">---</div>
            <div>In lúc: {new Date().toLocaleString('vi-VN')}</div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-receipt, .thermal-receipt * {
            visibility: visible;
          }
          .thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            font-size: 12px;
            line-height: 1.2;
          }
          @page {
            size: 80mm 150mm;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
};

// Generate ESC/POS commands for thermal printer
export function generateESCPOSCommands(invoice: Invoice): string {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  let commands = '';
  
  // Initialize printer
  commands += ESC + '@'; // Initialize
  commands += ESC + 'a' + '\x01'; // Center align
  
  // Header
  commands += ESC + '!' + '\x38'; // Double width and height
  commands += SHOP_INFO.nameAscii + '\n';
  commands += ESC + '!' + '\x00'; // Normal size
  commands += SHOP_INFO.addressAscii + '\n';
  commands += 'DT: ' + SHOP_INFO.phoneAscii + '\n';
  commands += '--------------------------------\n';
  commands += ESC + '!' + '\x08'; // Emphasized
  commands += 'HOA DON THANH TOAN\n';
  commands += ESC + '!' + '\x00'; // Normal
  
  // Invoice details
  commands += ESC + 'a' + '\x00'; // Left align
  commands += `So HD: #${invoice.id.toString().padStart(6, '0')}\n`;
  commands += `Ban: ${invoice.table_name}\n`;
  if (invoice.customer_name) {
    commands += `Khach: ${invoice.customer_name}\n`;
  }
  commands += `Ngay: ${new Date(invoice.created_at).toLocaleString('vi-VN')}\n`;
  commands += '--------------------------------\n';
  
  // Time details
  commands += 'THOI GIAN CHOI:\n';
  commands += `Bat dau: ${new Date(invoice.start_time).toLocaleString('vi-VN')}\n`;
  commands += `Ket thuc: ${new Date(invoice.end_time).toLocaleString('vi-VN')}\n`;
  commands += `Tong TG: ${Math.floor(invoice.play_duration_minutes / 60)}h ${invoice.play_duration_minutes % 60}m\n`;
  commands += `Gia/gio: ${formatVND(invoice.hourly_rate)}\n`;
  commands += ESC + '!' + '\x08'; // Emphasized
  commands += `Tien ban: ${formatVND(invoice.time_total)}\n`;
  commands += ESC + '!' + '\x00'; // Normal
  
  // Services
  if (invoice.services_detail && invoice.service_total > 0) {
    commands += '--------------------------------\n';
    commands += 'DICH VU:\n';
    commands += invoice.services_detail + '\n';
    commands += ESC + '!' + '\x08'; // Emphasized
    commands += `Tien dich vu: ${formatVND(invoice.service_total)}\n`;
    commands += ESC + '!' + '\x00'; // Normal
  }
  
  commands += '--------------------------------\n';
  
  // Total
  commands += `Tam tinh: ${formatVND(invoice.time_total + invoice.service_total)}\n`;
  if (invoice.discount > 0) {
    commands += `Giam gia: -${formatVND(invoice.discount)}\n`;
  }
  commands += ESC + '!' + '\x38'; // Double size
  commands += `TONG TIEN: ${formatVND(invoice.amount)}\n`;
  commands += ESC + '!' + '\x00'; // Normal
  
  // Footer
  commands += '--------------------------------\n';
  commands += ESC + 'a' + '\x01'; // Center align
  commands += 'Cam on quy khach!\n';
  commands += 'Hen gap lai!\n';
  commands += `In luc: ${new Date().toLocaleString('vi-VN')}\n`;
  
  // Cut paper
  commands += '\n\n\n';
  commands += GS + 'V' + '\x42' + '\x00'; // Partial cut
  
  return commands;
}

// Format VND for thermal printer
function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'd';
}

// Print to USB printer via WebUSB API
export async function printToUSBPrinter(commands: string): Promise<void> {
  if (!('usb' in navigator)) {
    throw new Error('WebUSB API not supported');
  }

  try {
    const device = await (navigator as any).usb.requestDevice({
      filters: [
        { vendorId: 0x0483, productId: 0x5743 },
      ]
    });

    if (!device.opened) {
      try {
        await device.open();
      } catch (openError: any) {
        if (openError.name === 'SecurityError' || openError.name === 'NotAllowedError') {
          throw new Error('USB Access Denied. Please:\n1. Close other apps using printer\n2. Disconnect USB → Wait 5s → Reconnect\n3. Restart Chrome\n4. Try again');
        }
        throw openError;
      }
    }
    
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }

    await device.claimInterface(0);

    const encoder = new TextEncoder();
    const data = encoder.encode(commands);
    
    const endpoints = [1, 2, 0x01, 0x02, 0x81, 0x82];
    let success = false;
    
    for (const endpoint of endpoints) {
      try {
        await device.transferOut(endpoint, data);
        success = true;
        break;
      } catch (err) {
        continue;
      }
    }

    await device.close();

    if (success) {
      alert('✅ In thành công!');
    } else {
      throw new Error('Failed to send data to printer - All USB endpoints failed');
    }
    
  } catch (error: any) {
    if (error.message.includes('Security Error') || error.message.includes('access denied')) {
      throw new Error('Không thể truy cập máy in USB. Hãy:\n1. Đóng tất cả app khác đang dùng máy in\n2. Ngắt USB cable, đợi 5s, cắm lại\n3. Restart Chrome hoàn toàn\n4. Thử lại');
    } else if (error.message.includes('No device selected')) {
      throw new Error('Chưa chọn máy in. Vui lòng chọn máy in trong dialog.');
    } else {
      throw error;
    }
  }
}

// Print to thermal printer via Web Serial API
export async function printToThermalPrinter(commands: string): Promise<void> {
  if (!('serial' in navigator)) {
    throw new Error('Web Serial API not supported');
  }

  try {
    const port = await (navigator as any).serial.requestPort();
    
    await port.open({ 
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });

    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(commands));
    
    writer.releaseLock();
    await port.close();
    
    alert('In thành công!');
  } catch (error) {
    throw error;
  }
}

// Download print file as fallback
export function downloadPrintFile(commands: string, timestamp: string): void {
  const blob = new Blob([commands], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hoadon_${timestamp || 'temp'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default ThermalPrintReceipt;
