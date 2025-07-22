'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Printer, Search, Download, Eye, Settings, Calendar } from 'lucide-react';
import { Invoice } from '@/types';
import apiClient from '@/lib/api-client';

export default function PrintPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllInvoices(20, 0);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} giờ ${mins} phút`;
  };

  const handlePrint = () => {
    if (selectedInvoice) {
      const printWindow = window.open('', '_blank');
      if (printWindow && printRef.current) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hóa đơn #${selectedInvoice.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice { max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                .company-info { margin-top: 10px; }
                .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f5f5f5; }
                .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
                @media print { .no-print { display: none; } }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toString().includes(searchTerm)
  );

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">In hóa đơn</h1>
            <p className="text-blue-200 mt-1">In và xuất hóa đơn theo yêu cầu</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-600/20 hover:bg-gray-600/30 border border-gray-600/50 text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Cài đặt in</span>
            </button>
            {selectedInvoice && (
              <button 
                onClick={handlePrint}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>In hóa đơn</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice List */}
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm hóa đơn..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Invoice List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Danh sách hóa đơn</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${
                      selectedInvoice?.id === invoice.id ? 'bg-blue-500/20' : ''
                    }`}
                    onClick={() => handlePreviewInvoice(invoice)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">Hóa đơn #{invoice.id}</h4>
                        <p className="text-blue-200 text-sm">{invoice.table_name}</p>
                        <p className="text-green-300 text-sm">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-200 text-sm">{formatDate(invoice.created_at)}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(invoice);
                              setShowPreview(true);
                            }}
                            className="p-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded transition-all duration-200"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(invoice);
                              handlePrint();
                            }}
                            className="p-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded transition-all duration-200"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredInvoices.length === 0 && (
                <div className="text-center py-12">
                  <Printer className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-white">Không tìm thấy hóa đơn nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Xem trước hóa đơn</h3>
            </div>
            
            <div className="p-6">
              {selectedInvoice ? (
                <div ref={printRef} className="bg-white rounded-lg p-8 text-black">
                  {/* Invoice Header */}
                  <div className="header">
                    <div className="logo">BI-A MANAGEMENT SYSTEM</div>
                    <div className="company-info">
                      <p>123 Đường ABC, Quận XYZ, TP.HCM</p>
                      <p>Điện thoại: (028) 1234 5678 | Email: info@bia-management.com</p>
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div className="invoice-info">
                    <div>
                      <h2>HÓA ĐƠN THANH TOÁN</h2>
                      <p><strong>Số hóa đơn:</strong> #{selectedInvoice.id}</p>
                      <p><strong>Ngày tạo:</strong> {formatDate(selectedInvoice.created_at)}</p>
                    </div>
                    <div>
                      <p><strong>Bàn:</strong> {selectedInvoice.table_name}</p>
                      <p><strong>Thời gian:</strong></p>
                      <p>Bắt đầu: {formatDate(selectedInvoice.start_time)}</p>
                      <p>Kết thúc: {formatDate(selectedInvoice.end_time)}</p>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Mô tả</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Thời gian chơi bi-a</td>
                        <td>{formatDuration(selectedInvoice.play_duration_minutes)}</td>
                        <td>{formatCurrency(selectedInvoice.hourly_rate)}/giờ</td>
                        <td>{formatCurrency(selectedInvoice.time_total)}</td>
                      </tr>
                      {selectedInvoice.service_total > 0 && (
                        <tr>
                          <td>Dịch vụ bổ sung</td>
                          <td>1</td>
                          <td>{formatCurrency(selectedInvoice.service_total)}</td>
                          <td>{formatCurrency(selectedInvoice.service_total)}</td>
                        </tr>
                      )}
                      {selectedInvoice.discount > 0 && (
                        <tr>
                          <td>Giảm giá</td>
                          <td>1</td>
                          <td>-{formatCurrency(selectedInvoice.discount)}</td>
                          <td>-{formatCurrency(selectedInvoice.discount)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Services Detail */}
                  {selectedInvoice.services_detail && (
                    <div style={{ marginTop: '20px' }}>
                      <p><strong>Chi tiết dịch vụ:</strong></p>
                      <p>{selectedInvoice.services_detail}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="total">
                    <p>TỔNG CỘNG: {formatCurrency(selectedInvoice.amount)}</p>
                  </div>

                  {/* Footer */}
                  <div className="footer">
                    <p>Cảm ơn quý khách đã sử dụng dịch vụ!</p>
                    <p>Hẹn gặp lại quý khách lần sau.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Printer className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-white text-lg">Chọn hóa đơn để xem trước</p>
                  <p className="text-blue-200 text-sm mt-2">Nhấp vào hóa đơn bên trái để hiển thị bản xem trước</p>
                </div>
              )}
            </div>

            {/* Preview Actions */}
            {selectedInvoice && (
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In hóa đơn</span>
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Tải PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Print Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Cài đặt in</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Kích thước giấy</label>
              <select className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="A4" className="bg-slate-800">A4</option>
                <option value="A5" className="bg-slate-800">A5</option>
                <option value="Receipt" className="bg-slate-800">Hóa đơn nhiệt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Hướng in</label>
              <select className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="portrait" className="bg-slate-800">Dọc</option>
                <option value="landscape" className="bg-slate-800">Ngang</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Số bản sao</label>
              <input
                type="number"
                min="1"
                max="10"
                defaultValue="1"
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
