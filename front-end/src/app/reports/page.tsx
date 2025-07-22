'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, DollarSign, TrendingUp, BarChart3, Download, RefreshCw, PieChart } from 'lucide-react';
import { DailyReport, MonthlyReport } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  RevenueTrendChart, 
  InvoiceCountChart, 
  PlayTimeChart, 
  RevenueComparisonChart,
  CategoryRevenueChart
} from '@/components/Charts';
import { format, subDays } from 'date-fns';

interface ChartDataPoint {
  date: string;
  revenue: number;
  invoices: number;
  playTime: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly' | 'charts'>('daily');
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTab === 'daily') {
      fetchDailyReport();
    } else if (selectedTab === 'monthly') {
      fetchMonthlyReport();
    } else if (selectedTab === 'charts') {
      fetchChartData();
    }
  }, [selectedTab, selectedDate, selectedYear, selectedMonth, dateRange]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDailyReport(selectedDate);
      setDailyReport(data);
    } catch (_error) {
      console.error('Error fetching daily report:', _error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMonthlyReport(selectedYear, selectedMonth);
      setMonthlyReport(data);
    } catch (_error) {
      console.error('Error fetching monthly report:', _error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Generate date range for chart data
      const dates = [];
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(format(d, 'yyyy-MM-dd'));
      }
      
      // Fetch daily reports for each date
      const chartPromises = dates.map(async (date) => {
        try {
          const report = await apiClient.getDailyReport(date);
          return {
            date: date,
            revenue: report.total_revenue || 0,
            invoices: report.total_invoices || 0,
            playTime: 0 // TODO: Thêm field này vào API hoặc tính từ invoice data
          };
        } catch (_error) {
          return {
            date: date,
            revenue: 0,
            invoices: 0,
            playTime: 0
          };
        }
      });
      
      const results = await Promise.all(chartPromises);
      setChartData(results);
      
      // Sample category data (you can enhance this by fetching real data)
      setCategoryData([
        { name: 'Tiền Bàn', value: results.reduce((sum, day) => sum + (day.revenue * 0.7), 0), color: '#3B82F6' },
        { name: 'Đồ Uống', value: results.reduce((sum, day) => sum + (day.revenue * 0.2), 0), color: '#10B981' },
        { name: 'Thức Ăn', value: results.reduce((sum, day) => sum + (day.revenue * 0.1), 0), color: '#F59E0B' },
      ]);
      
    } catch (_error) {
      console.error('Error fetching chart data:', _error);
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

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    format = 'currency' 
  }: {
    title: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    format?: 'currency' | 'number';
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return formatCurrency(value);
        default:
          return value.toLocaleString();
      }
    };

    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{formatValue()}</p>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Báo cáo doanh thu</h1>
            <p className="text-blue-200 mt-1">Theo dõi hiệu suất kinh doanh và xu hướng doanh thu</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => selectedTab === 'daily' ? fetchDailyReport() : fetchMonthlyReport()}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
            <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTab('daily')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                selectedTab === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-200 hover:bg-white/5'
              }`}
            >
              Báo cáo theo ngày
            </button>
            <button
              onClick={() => setSelectedTab('monthly')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                selectedTab === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-200 hover:bg-white/5'
              }`}
            >
              Báo cáo theo tháng
            </button>
            <button
              onClick={() => setSelectedTab('charts')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                selectedTab === 'charts'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-200 hover:bg-white/5'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Biểu Đồ & Xu Hướng
            </button>
          </div>
        </div>

        {/* Date/Month Selector */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
          {selectedTab === 'daily' ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Chọn ngày:</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchDailyReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Tải lại</span>
              </button>
            </div>
          ) : selectedTab === 'monthly' ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Chọn tháng:</span>
              </div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                  <option key={month} value={month}>Tháng {month}</option>
                ))}
              </select>
              <button
                onClick={fetchMonthlyReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Tải lại</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Chọn khoảng thời gian cho biểu đồ:</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">Từ ngày:</span>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-4 py-2 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">Đến ngày:</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-4 py-2 bg-white/90 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={fetchChartData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Tải biểu đồ</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent"></div>
          </div>
        )}

        {/* Daily Report */}
        {selectedTab === 'daily' && dailyReport && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng doanh thu"
                value={dailyReport.total_revenue}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Doanh thu thời gian"
                value={dailyReport.total_time_revenue}
                icon={BarChart3}
                color="bg-blue-500"
              />
              <StatCard
                title="Doanh thu dịch vụ"
                value={dailyReport.total_service_revenue}
                icon={TrendingUp}
                color="bg-purple-500"
              />
              <StatCard
                title="Số hóa đơn"
                value={dailyReport.total_invoices}
                icon={Calendar}
                color="bg-orange-500"
                format="number"
              />
            </div>

            {/* Daily Summary */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Tóm tắt ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Số hóa đơn:</span>
                    <span className="text-white font-medium">{dailyReport.total_invoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Doanh thu trung bình/hóa đơn:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(dailyReport.total_invoices > 0 ? dailyReport.total_revenue / dailyReport.total_invoices : 0)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Tỷ lệ dịch vụ:</span>
                    <span className="text-white font-medium">
                      {dailyReport.total_revenue > 0 
                        ? ((dailyReport.total_service_revenue / dailyReport.total_revenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Tỷ lệ thời gian:</span>
                    <span className="text-white font-medium">
                      {dailyReport.total_revenue > 0 
                        ? ((dailyReport.total_time_revenue / dailyReport.total_revenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Report */}
        {selectedTab === 'monthly' && monthlyReport && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Tổng doanh thu"
                value={monthlyReport.total_revenue}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Doanh thu thời gian"
                value={monthlyReport.total_time_revenue}
                icon={BarChart3}
                color="bg-blue-500"
              />
              <StatCard
                title="Doanh thu dịch vụ"
                value={monthlyReport.total_service_revenue}
                icon={TrendingUp}
                color="bg-purple-500"
              />
              <StatCard
                title="Số hóa đơn"
                value={monthlyReport.total_invoices}
                icon={Calendar}
                color="bg-orange-500"
                format="number"
              />
            </div>

            {/* Monthly Summary */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Tóm tắt tháng {selectedMonth}/{selectedYear}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Số hóa đơn:</span>
                    <span className="text-white font-medium">{monthlyReport.total_invoices}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Doanh thu TB/ngày:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(monthlyReport.total_revenue / 30)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Hóa đơn TB/ngày:</span>
                    <span className="text-white font-medium">
                      {(monthlyReport.total_invoices / 30).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Doanh thu TB/hóa đơn:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(monthlyReport.total_invoices > 0 ? monthlyReport.total_revenue / monthlyReport.total_invoices : 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {selectedTab === 'charts' && !loading && (
          <div className="space-y-12">
            {/* Chart Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatCard
                title="Tổng doanh thu kỳ"
                value={chartData.reduce((sum, day) => sum + day.revenue, 0)}
                icon={DollarSign}
                color="bg-green-500"
              />
              <StatCard
                title="Trung bình/ngày"
                value={chartData.length > 0 ? chartData.reduce((sum, day) => sum + day.revenue, 0) / chartData.length : 0}
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatCard
                title="Tổng hóa đơn"
                value={chartData.reduce((sum, day) => sum + day.invoices, 0)}
                icon={Calendar}
                color="bg-purple-500"
                format="number"
              />
              <StatCard
                title="Tổng giờ chơi"
                value={Math.round(chartData.reduce((sum, day) => sum + day.playTime, 0) / 60)}
                icon={BarChart3}
                color="bg-orange-500"
                format="number"
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Xu Hướng Doanh Thu</h3>
                  <p className="text-blue-200 text-sm">Theo dõi xu hướng doanh thu theo thời gian</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 overflow-hidden">
                <div className="w-full h-80">
                  <RevenueTrendChart data={chartData} type="daily" />
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Invoice Count Chart */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Số Lượng Hóa Đơn</h3>
                    <p className="text-green-200 text-sm">Thống kê số hóa đơn hàng ngày</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 overflow-hidden">
                  <div className="w-full h-64">
                    <InvoiceCountChart data={chartData} type="daily" />
                  </div>
                </div>
              </div>

              {/* Play Time Chart */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">⏰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Thời Gian Chơi</h3>
                    <p className="text-purple-200 text-sm">Tổng thời gian chơi (phút)</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 overflow-hidden">
                  <div className="w-full h-64">
                    <PlayTimeChart data={chartData} type="daily" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Comparison */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📈</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">So Sánh Doanh Thu Theo Ngày</h3>
                  <p className="text-orange-200 text-sm">Phân tích và so sánh doanh thu</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 overflow-hidden">
                <div className="w-full h-80">
                  <RevenueComparisonChart data={chartData} />
                </div>
              </div>
            </div>

            {/* Category Revenue */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🥧</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Phân Bổ Doanh Thu Theo Danh Mục</h3>
                  <p className="text-indigo-200 text-sm">Tỷ lệ đóng góp từng loại dịch vụ</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-6 overflow-hidden">
                <div className="w-full h-80">
                  <CategoryRevenueChart data={categoryData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Placeholder for other tabs */}
        {(selectedTab === 'daily' || selectedTab === 'monthly') && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              📊 Biểu đồ xu hướng {selectedTab === 'daily' ? 'theo giờ' : 'theo ngày'}
            </h3>
            <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-200">Chuyển sang tab &quot;Biểu Đồ &amp; Xu Hướng&quot; để xem biểu đồ chi tiết</p>
                <button 
                  onClick={() => setSelectedTab('charts')}
                  className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
                >
                  Xem Biểu Đồ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
