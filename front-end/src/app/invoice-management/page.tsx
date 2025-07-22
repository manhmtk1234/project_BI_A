'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Filter, Calendar, Download, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Invoice } from '@/types';
import apiClient from '@/lib/api-client';

export default function InvoiceManagementPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllInvoices(50, 0);
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

  // Mock status for demo
  const getInvoiceStatus = (invoice: Invoice) => {
    // In real app, this would come from the invoice data
    const statuses = ['paid', 'pending', 'cancelled'];
    return statuses[invoice.id % 3];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/50 rounded-full text-xs">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full text-xs">Chờ thanh toán</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/50 rounded-full text-xs">Đã hủy</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/50 rounded-full text-xs">Không xác định</span>;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toString().includes(searchTerm);
    
    const matchesDate = !dateFilter || 
      new Date(invoice.created_at).toISOString().split('T')[0] === dateFilter;
    
    const invoiceStatus = getInvoiceStatus(invoice);
    const matchesStatus = statusFilter === 'all' || invoiceStatus === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleSelectInvoice = (invoiceId: number) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedInvoices.length > 0);
  }, [selectedInvoices]);

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const averageAmount = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;
  const paidInvoices = filteredInvoices.filter(inv => getInvoiceStatus(inv) === 'paid').length;
  const pendingInvoices = filteredInvoices.filter(inv => getInvoiceStatus(inv) === 'pending').length;

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
            <p className="text-blue-200 mt-1">Quản lý trạng thái và thông tin chi tiết các hóa đơn</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Tạo hóa đơn</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Tổng hóa đơn</p>
                <p className="text-white text-2xl font-bold">{filteredInvoices.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Đã thanh toán</p>
                <p className="text-green-400 text-2xl font-bold">{paidInvoices}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Chờ thanh toán</p>
                <p className="text-yellow-400 text-2xl font-bold">{pendingInvoices}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Doanh thu</p>
                <p className="text-purple-400 text-xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Download className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
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

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-slate-800">Tất cả trạng thái</option>
              <option value="paid" className="bg-slate-800">Đã thanh toán</option>
              <option value="pending" className="bg-slate-800">Chờ thanh toán</option>
              <option value="cancelled" className="bg-slate-800">Đã hủy</option>
            </select>

            <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Lọc nâng cao</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-300">{selectedInvoices.length} hóa đơn được chọn</span>
                <button
                  onClick={() => setSelectedInvoices([])}
                  className="text-blue-400 hover:text-white text-sm"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg text-sm transition-all duration-200">
                  Đánh dấu đã thanh toán
                </button>
                <button className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-300 px-4 py-2 rounded-lg text-sm transition-all duration-200">
                  In hóa đơn
                </button>
                <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm transition-all duration-200">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Bàn</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Thời lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Tổng tiền</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-blue-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInvoices.map((invoice) => {
                  const status = getInvoiceStatus(invoice);
                  return (
                    <tr key={invoice.id} className={`hover:bg-white/5 transition-colors ${
                      selectedInvoices.includes(invoice.id) ? 'bg-blue-500/10' : ''
                    }`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                        />
                      </td>
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
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-200 text-sm">
                          {formatDate(invoice.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg transition-all duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 rounded-lg transition-all duration-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-all duration-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">Không có hóa đơn nào</p>
              <p className="text-blue-200 mt-1">Thử thay đổi bộ lọc hoặc tạo hóa đơn mới</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Tóm tắt</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-blue-200 text-sm">Tổng doanh thu hiển thị</p>
              <p className="text-green-400 text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-sm">Giá trị trung bình/hóa đơn</p>
              <p className="text-yellow-400 text-xl font-bold">{formatCurrency(averageAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-sm">Tỷ lệ thanh toán</p>
              <p className="text-purple-400 text-xl font-bold">
                {filteredInvoices.length > 0 ? ((paidInvoices / filteredInvoices.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
