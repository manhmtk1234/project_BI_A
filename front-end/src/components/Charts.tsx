import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ChartDataPoint {
  date: string;
  revenue: number;
  invoices: number;
  playTime: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  type: 'daily' | 'monthly';
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Color schemes
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Custom tooltip formatter
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Trend Chart
export const RevenueTrendChart: React.FC<RevenueChartProps> = ({ data, type }) => {
  const formatXAxis = (tickItem: string) => {
    if (type === 'daily') {
      return format(parseISO(tickItem), 'dd/MM');
    }
    return format(parseISO(tickItem), 'MM/yyyy');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Xu Hướng Doanh Thu {type === 'daily' ? 'Hàng Ngày' : 'Hàng Tháng'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
            name="Doanh Thu"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Invoice Count Chart
export const InvoiceCountChart: React.FC<RevenueChartProps> = ({ data, type }) => {
  const formatXAxis = (tickItem: string) => {
    if (type === 'daily') {
      return format(parseISO(tickItem), 'dd/MM');
    }
    return format(parseISO(tickItem), 'MM/yyyy');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Số Lượng Hóa Đơn {type === 'daily' ? 'Hàng Ngày' : 'Hàng Tháng'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="invoices" 
            fill={COLORS.secondary}
            radius={[4, 4, 0, 0]}
            name="Số Hóa Đơn"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Play Time Chart
export const PlayTimeChart: React.FC<RevenueChartProps> = ({ data, type }) => {
  const formatXAxis = (tickItem: string) => {
    if (type === 'daily') {
      return format(parseISO(tickItem), 'dd/MM');
    }
    return format(parseISO(tickItem), 'MM/yyyy');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tổng Thời Gian Chơi {type === 'daily' ? 'Hàng Ngày' : 'Hàng Tháng'} (Giờ)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxis}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 60).toFixed(1)}h`}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p style={{ color: payload[0].color }} className="text-sm">
                      Thời gian chơi: {(payload[0].value as number / 60).toFixed(1)} giờ
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="playTime"
            stroke={COLORS.accent}
            strokeWidth={3}
            dot={{ fill: COLORS.accent, strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: COLORS.accent, strokeWidth: 2 }}
            name="Thời Gian Chơi"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenue Comparison Chart (Monthly vs Daily)
export const RevenueComparisonChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        So Sánh Doanh Thu & Số Hóa Đơn
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(parseISO(value), 'dd/MM')}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="revenue"
            orientation="left"
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="invoices"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            strokeWidth={3}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 5 }}
            name="Doanh Thu"
          />
          <Line
            yAxisId="invoices"
            type="monotone"
            dataKey="invoices"
            stroke={COLORS.secondary}
            strokeWidth={3}
            dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 5 }}
            name="Số Hóa Đơn"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category Revenue Pie Chart
export const CategoryRevenueChart: React.FC<{ data: CategoryData[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Phân Bố Doanh Thu Theo Danh Mục
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value as number)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dashboard Mini Charts
export const MiniRevenueChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data.slice(-7)}>
        <defs>
          <linearGradient id="miniColorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={COLORS.primary}
          fillOpacity={1}
          fill="url(#miniColorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const MiniInvoiceChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={data.slice(-7)}>
        <Bar dataKey="invoices" fill={COLORS.secondary} />
      </BarChart>
    </ResponsiveContainer>
  );
};
