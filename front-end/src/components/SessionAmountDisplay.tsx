import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface SessionAmountDisplayProps {
  sessionId: number;
  realtime?: boolean;
  className?: string;
}

interface SessionAmount {
  session_id: number;
  session_type: string;
  actual_minutes: number;
  table_amount: number;
  orders_amount: number;
  total_amount: number;
  hourly_rate: number;
}

export default function SessionAmountDisplay({ 
  sessionId, 
  realtime = true,
  className = "" 
}: SessionAmountDisplayProps) {
  const [amount, setAmount] = useState<SessionAmount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmount = async () => {
    try {
      setLoading(true);
      const data = await apiClient.calculateSessionAmount(sessionId);
      setAmount(data);
      setError(null);
    } catch (err) {
      setError('Không thể tính toán số tiền');
      console.error('Error calculating amount:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmount();
    
    if (realtime) {
      // Update every 30 seconds for realtime tracking
      const interval = setInterval(fetchAmount, 30000);
      return () => clearInterval(interval);
    }
  }, [sessionId, realtime]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-white/20 rounded w-20 mb-1"></div>
        <div className="h-3 bg-white/20 rounded w-16"></div>
      </div>
    );
  }

  if (error || !amount) {
    return (
      <div className={`text-white/70 text-xs ${className}`}>
        {error || 'Không có dữ liệu'}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Total Amount - Main Display */}
      <div className="flex items-center space-x-1">
        <DollarSign className="w-4 h-4" />
        <span className="font-bold text-lg">
          {formatCurrency(amount.total_amount)}
        </span>
      </div>

      {/* Breakdown */}
      <div className="text-xs text-white/80 space-y-0.5">
        <div className="flex justify-between">
          <span>Bàn ({formatTime(amount.actual_minutes)}):</span>
          <span>{formatCurrency(amount.table_amount)}</span>
        </div>
        {amount.orders_amount > 0 && (
          <div className="flex justify-between">
            <span>Đồ ăn/uống:</span>
            <span>{formatCurrency(amount.orders_amount)}</span>
          </div>
        )}
      </div>

      {/* Session Type Indicator */}
      <div className="text-xs text-white/60">
        {amount.session_type === 'fixed_time' ? '⏱️ Theo giờ' : '🕐 Chơi mở'}
      </div>
    </div>
  );
}
