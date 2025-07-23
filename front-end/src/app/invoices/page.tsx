'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Eye, Edit, Trash2, Calendar, DollarSign, Clock, User, Printer } from 'lucide-react';
import { Invoice } from '@/types';
import apiClient from '@/lib/api-client';
import { ThermalPrintReceipt } from '@/components/ThermalPrint';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

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
    return `${hours}h ${mins}m`;
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toString().includes(searchTerm)
  );

  const viewInvoiceDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const printInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPrintModal(true);
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
            <h1 className="text-2xl font-bold text-white">Quản lý hóa đơn</h1>
            <p className="text-blue-200 mt-1">Danh sách tất cả hóa đơn trong hệ thống</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Tạo hóa đơn mới</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo bàn hoặc ID hóa đơn..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-medium py-3 px-6 rounded-lg transition-all duration-200">
              Lọc
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Bàn</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Thời lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">#{invoice.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-sm font-medium">
                            {invoice.table_name.replace('Bàn ', '')}
                          </span>
                        </div>
                        <span className="text-white">{invoice.table_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm">
                        <div>{formatDate(invoice.start_time)}</div>
                        <div className="text-blue-300">đến {formatDate(invoice.end_time)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-300 font-medium">
                        {formatDuration(invoice.play_duration_minutes)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-300 font-bold">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-200">
                        {formatDate(invoice.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewInvoiceDetail(invoice)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg transition-all duration-200"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => printInvoice(invoice)}
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg transition-all duration-200"
                          title="In hóa đơn"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg transition-all duration-200"
                          title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-all duration-200"
                          title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-white text-lg font-medium">Không có hóa đơn nào</p>
              <p className="text-blue-200 mt-1">Tạo hóa đơn đầu tiên của bạn</p>
            </div>
          )}
        </div>

        {/* Invoice Detail Modal */}
        {showDetailModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Chi tiết hóa đơn #{selectedInvoice.id}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300 text-sm">Bàn</span>
                    </div>
                    <p className="text-white font-bold text-lg">{selectedInvoice.table_name}</p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm">Tổng tiền</span>
                    </div>
                    <p className="text-white font-bold text-lg">{formatCurrency(selectedInvoice.amount)}</p>
                  </div>
                </div>

                {/* Time Details */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-400" />
                    Chi tiết thời gian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-300">Bắt đầu:</span>
                      <p className="text-white">{formatDate(selectedInvoice.start_time)}</p>
                    </div>
                    <div>
                      <span className="text-blue-300">Kết thúc:</span>
                      <p className="text-white">{formatDate(selectedInvoice.end_time)}</p>
                    </div>
                    <div>
                      <span className="text-blue-300">Thời lượng:</span>
                      <p className="text-white">{formatDuration(selectedInvoice.play_duration_minutes)}</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Chi tiết chi phí</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-300">Giá theo giờ:</span>
                      <span className="text-white">{formatCurrency(selectedInvoice.hourly_rate)}/giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Tiền thời gian:</span>
                      <span className="text-white">{formatCurrency(selectedInvoice.time_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Dịch vụ:</span>
                      <span className="text-white">{formatCurrency(selectedInvoice.service_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-300">Giảm giá:</span>
                      <span className="text-red-300">-{formatCurrency(selectedInvoice.discount)}</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between">
                        <span className="text-white font-medium">Tổng cộng:</span>
                        <span className="text-yellow-300 font-bold text-lg">{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Detail */}
                {selectedInvoice.services_detail && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Chi tiết dịch vụ</h4>
                    <p className="text-blue-200">{selectedInvoice.services_detail}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => printInvoice(selectedInvoice)}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In hóa đơn</span>
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200">
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thermal Print Modal */}
        {showPrintModal && selectedInvoice && (
          <ThermalPrintReceipt 
            invoice={selectedInvoice}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
