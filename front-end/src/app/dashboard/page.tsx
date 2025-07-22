'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, DollarSign, Receipt, Clock, Users, Activity, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  today_revenue: number;
  active_sessions: number;
  today_invoices: number;
  avg_session_time: number;
}

interface RecentActivity {
  action: string;
  table: string;
  customer: string;
  time: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    today_revenue: 0,
    active_sessions: 0,
    today_invoices: 0,
    avg_session_time: 0
  });
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalHoursToday, setTotalHoursToday] = useState<number>(0);
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [todayCustomers, setTodayCustomers] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Load real data from dashboard APIs with error handling
      const [dashboardStats, recentActivitiesData, allInvoices] = await Promise.all([
        apiClient.getDashboardStats().catch(() => ({
          today_revenue: 0,
          active_sessions: 0,
          today_invoices: 0,
          avg_session_time: 0
        })),
        apiClient.getRecentActivities().catch(() => []),
        apiClient.getAllInvoices(1000, 0).catch(() => [])
      ]);

      // Set real stats from API with null check
      if (dashboardStats) {
        setStats(dashboardStats);
      }

      // Set recent activities from API with null check
      if (Array.isArray(recentActivitiesData)) {
        setRecentActivities(recentActivitiesData);
      } else {
        setRecentActivities([]);
      }

      // Calculate total revenue from all invoices with null/undefined check
      const invoicesArray = Array.isArray(allInvoices) ? allInvoices : [];
      const calculatedTotalRevenue = invoicesArray.reduce((sum, inv) => {
        return sum + (inv?.amount || 0);
      }, 0);
      setTotalRevenue(calculatedTotalRevenue);
      
      // Set total number of invoices
      setTotalInvoices(invoicesArray.length);

      // Calculate total hours today from today's invoices duration
      const todayInvoices = invoicesArray.filter(inv => {
        try {
          const invoiceDate = new Date(inv?.created_at || '').toISOString().split('T')[0];
          return invoiceDate === today;
        } catch {
          return false;
        }
      });
      
      // Set today customers (number of invoices today)
      setTodayCustomers(todayInvoices.length);
      
      const totalMinutesToday = todayInvoices.reduce((sum, inv) => {
        return sum + (inv?.play_duration_minutes || 0);
      }, 0);
      const totalHoursToday = totalMinutesToday / 60;
      setTotalHoursToday(totalHoursToday);

      setError(null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Chào mừng quay trở lại!</h1>
            <p className="text-blue-100">Hôm nay là Thứ Sáu, 19 tháng 7, 2025</p>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">↗ +8.2%</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(stats.today_revenue)}
              </p>
            </div>
          </div>

          {/* Invoices Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Receipt className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">↗ +15.3%</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tổng hóa đơn</p>
              <p className="text-3xl font-bold text-white mt-1">{totalInvoices}</p>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Bàn đang hoạt động</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.active_sessions}</p>
            </div>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Hours Today */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tổng giờ chơi hôm nay</p>
              <p className="text-3xl font-bold text-white mt-1">{totalHoursToday.toFixed(1)} giờ</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">↗ +12.5%</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          {/* Today Customers */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-green-400 text-sm font-medium">↗ +6.8%</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Khách hàng hôm nay</p>
              <p className="text-3xl font-bold text-white mt-1">{todayCustomers}</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-6">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.table} - {activity.action}</p>
                      <p className="text-slate-400 text-sm">{activity.customer}</p>
                    </div>
                    <span className="text-slate-400 text-sm">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">Chưa có hoạt động nào hôm nay</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-6">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/tables')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-2"
              >
                <Clock className="w-6 h-6" />
                <span className="text-sm font-medium">Quản lý bàn</span>
              </button>
              <button 
                onClick={() => router.push('/invoices')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-2"
              >
                <Receipt className="w-6 h-6" />
                <span className="text-sm font-medium">Tạo hóa đơn</span>
              </button>
              <button 
                onClick={() => router.push('/reports')}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-2"
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm font-medium">Xem báo cáo</span>
              </button>
              <button 
                onClick={() => router.push('/products')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-xl transition-all duration-200 flex flex-col items-center space-y-2"
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">Sản phẩm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
