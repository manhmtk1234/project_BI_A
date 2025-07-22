'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableSession, StartSessionRequest } from '@/types';
import { Clock, Play, Square, Users, DollarSign, Plus, Minus, ShoppingCart } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import SessionAmountDisplay from '@/components/SessionAmountDisplay';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeSessions, setActiveSessions] = useState<TableSession[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [presetDuration, setPresetDuration] = useState(60);
  const [prepaidAmount, setPrepaidAmount] = useState(50000);
  const [sessionType, setSessionType] = useState<'fixed_time' | 'open_play'>('fixed_time');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [products, setProducts] = useState<{id: number; name: string; category: string; price: number; description?: string}[]>([]);
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const [showEditRateModal, setShowEditRateModal] = useState(false);
  const [selectedTableForRate, setSelectedTableForRate] = useState<Table | null>(null);
  const [newHourlyRate, setNewHourlyRate] = useState(0);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesData, sessionsData] = await Promise.all([
        apiClient.getAllTables(),
        apiClient.getActiveSessions()
      ]);
      
      // Ensure data is array
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setActiveSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please check if you are logged in.');
      console.error('Error loading data:', err);
      setTables([]);
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect for active sessions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.status === 'active' && session.remaining_minutes && session.remaining_minutes > 0) {
            return {
              ...session,
              remaining_minutes: session.remaining_minutes - 1
            };
          }
          return session;
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const startTable = async () => {
    if (!selectedTable || !customerName.trim()) {
      alert('Vui lòng chọn bàn và nhập tên khách hàng');
      return;
    }

    try {
      const request: StartSessionRequest = {
        table_id: selectedTable.id,
        customer_name: customerName.trim(),
        preset_duration_minutes: presetDuration,
        prepaid_amount: prepaidAmount
      };

      await apiClient.startSession(request);
      await loadData(); // Refresh data
      setShowBookingModal(false);
      setCustomerName('');
      setSelectedTable(null);
    } catch (err) {
      console.error('Error starting session:', err);
      alert('Không thể bắt đầu phiên chơi');
    }
  };

  const endSession = async (sessionId: number) => {
    if (!confirm('Bạn có chắc muốn kết thúc phiên chơi này?')) return;

    try {
      await apiClient.endSession(sessionId);
      await loadData(); // Refresh data
    } catch (err) {
      console.error('Error ending session:', err);
      alert('Không thể kết thúc phiên chơi');
    }
  };

  const updateTime = async (sessionId: number, newTime: number) => {
    try {
      await apiClient.updateRemainingTime(sessionId, newTime);
      setActiveSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, remaining_minutes: newTime }
            : session
        )
      );
    } catch (err) {
      console.error('Error updating time:', err);
      alert('Không thể cập nhật thời gian');
    }
  };

  const openProductModal = async (sessionId: number) => {
    try {
      setSelectedSessionId(sessionId);
      const productsData = await apiClient.getAllProducts();
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCart({});
      setShowProductModal(true);
    } catch (err) {
      console.error('Error loading products:', err);
      alert('Không thể tải sản phẩm');
    }
  };

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const addProductsToSession = async () => {
    if (!selectedSessionId || Object.keys(cart).length === 0) {
      alert('Vui lòng chọn sản phẩm');
      return;
    }

    try {
      const items = Object.entries(cart).map(([productId, quantity]) => ({
        product_id: parseInt(productId),
        quantity: quantity
      }));

      await apiClient.addOrderToSession({
        session_id: selectedSessionId,
        items: items
      });
      
      setShowProductModal(false);
      setCart({});
      setSelectedSessionId(null);
      alert('Đã thêm sản phẩm thành công');
    } catch (err) {
      console.error('Error adding products:', err);
      alert('Không thể thêm sản phẩm');
    }
  };

  const openEditRateModal = (table: Table) => {
    setSelectedTableForRate(table);
    setNewHourlyRate(table.hourly_rate);
    setShowEditRateModal(true);
  };

  const updateTableRate = async () => {
    if (!selectedTableForRate || newHourlyRate <= 0) {
      alert('Vui lòng nhập giá hợp lệ');
      return;
    }

    try {
      // Call API to update table rate
      await apiClient.updateTableRate(selectedTableForRate.id, newHourlyRate);
      
      // Update local state
      setTables(prev => 
        prev.map(table => 
          table.id === selectedTableForRate.id 
            ? { ...table, hourly_rate: newHourlyRate }
            : table
        )
      );
      
      setShowEditRateModal(false);
      setSelectedTableForRate(null);
      setNewHourlyRate(0);
      alert('Đã cập nhật giá thành công!');
    } catch (err) {
      console.error('Error updating table rate:', err);
      alert('Không thể cập nhật giá. Vui lòng thử lại.');
    }
  };

  // Get session for a table
  const getSessionForTable = (tableId: number): TableSession | undefined => {
    return activeSessions.find(session => 
      session.table_id === tableId && session.status === 'active'
    );
  };

  // Get table status
  const getTableStatus = (table: Table): 'available' | 'occupied' => {
    const session = getSessionForTable(table.id);
    return session ? 'occupied' : 'available';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTableStatusColor = (status: 'available' | 'occupied') => {
    switch (status) {
      case 'available':
        return 'from-green-600 to-green-700 border-green-500 hover:from-green-700 hover:to-green-800';
      case 'occupied':
        return 'from-red-600 to-red-700 border-red-500';
      default:
        return 'from-slate-600 to-slate-700 border-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg">{error}</p>
          </div>
          <div className="space-x-4">
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Thử lại
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản Lý Bàn Bi-a</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables && tables.length > 0 ? (
          tables.map((table) => {
            const status = getTableStatus(table);
            const session = getSessionForTable(table.id);
            
            return (
              <div
                key={table.id}
                className={`relative rounded-xl border-2 shadow-lg overflow-hidden transition-all duration-300 bg-gradient-to-br ${getTableStatusColor(status)}`}
              >
                <div className="p-6 text-white">
                  {/* Table Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{table.name}</h3>
                    <button
                      onClick={() => openEditRateModal(table)}
                      className="flex items-center space-x-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 group"
                      title="Click để chỉnh sửa giá"
                    >
                      <DollarSign className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm">{formatCurrency(table.hourly_rate)}/giờ</span>
                    </button>
                  </div>

                  {/* Table Content */}
                  {status === 'available' ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">Trống</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTable(table);
                          setShowBookingModal(true);
                          setPrepaidAmount(table.hourly_rate);
                        }}
                        className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Bắt đầu</span>
                      </button>
                    </div>
                  ) : session ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{session.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            Còn: {session.remaining_minutes ? formatTime(session.remaining_minutes) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Realtime Amount Display */}
                      <SessionAmountDisplay 
                        sessionId={session.id} 
                        realtime={true}
                        className="border-t border-white/20 pt-2"
                      />

                      {/* Time Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => session.remaining_minutes && updateTime(session.id, session.remaining_minutes - 15)}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded"
                          disabled={!session.remaining_minutes || session.remaining_minutes <= 15}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs">15 phút</span>
                        <button
                          onClick={() => session.remaining_minutes && updateTime(session.id, session.remaining_minutes + 15)}
                          className="p-1 bg-white/20 hover:bg-white/30 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => openProductModal(session.id)}
                          className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Thêm sản phẩm</span>
                        </button>

                        <button
                          onClick={() => endSession(session.id)}
                          className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Square className="w-4 h-4" />
                          <span>Kết thúc</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500">
            Không có bàn nào
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bắt đầu phiên chơi - {selectedTable.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình thức chơi
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as 'fixed_time' | 'open_play')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed_time">⏱️ Chơi theo giờ cố định</option>
                  <option value="open_play">🕐 Chơi mở (tính theo giờ thực tế)</option>
                </select>
              </div>

              {sessionType === 'fixed_time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian chơi (phút)
                  </label>
                  <select
                    value={presetDuration}
                    onChange={(e) => setPresetDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 phút</option>
                    <option value={60}>1 giờ</option>
                    <option value={90}>1.5 giờ</option>
                    <option value={120}>2 giờ</option>
                    <option value={180}>3 giờ</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {sessionType === 'fixed_time' ? 'Tiền theo giờ đã set' : 'Tiền tạm tính (sẽ cập nhật theo thời gian)'}
                </label>
                <input
                  type="number"
                  value={sessionType === 'fixed_time' ? presetDuration * (selectedTable.hourly_rate / 60) : selectedTable.hourly_rate}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {sessionType === 'fixed_time' 
                    ? `${presetDuration} phút × ${new Intl.NumberFormat('vi-VN').format(selectedTable.hourly_rate)}/giờ`
                    : `${new Intl.NumberFormat('vi-VN').format(selectedTable.hourly_rate)}/giờ (tính theo thời gian thực tế)`
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setCustomerName('');
                  setSelectedTable(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={startTable}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Bắt đầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm sản phẩm cho phiên chơi</h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setCart({});
                  setSelectedSessionId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[60vh]">
              {/* Products List */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium mb-3">Danh sách sản phẩm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[50vh]">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-500">{product.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div className="border-l pl-6">
                <h3 className="text-lg font-medium mb-3">Giỏ hàng</h3>
                <div className="space-y-3 overflow-y-auto max-h-[40vh]">
                  {Object.keys(cart).length === 0 ? (
                    <p className="text-gray-500">Chưa có sản phẩm nào</p>
                  ) : (
                    Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === parseInt(productId));
                      if (!product) return null;
                      
                      return (
                        <div key={productId} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <h5 className="font-medium">{product.name}</h5>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(product.price)} × {quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => removeFromCart(parseInt(productId))}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => addToCart(parseInt(productId))}
                              className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Cart Total */}
                {Object.keys(cart).length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Tổng cộng:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(
                          Object.entries(cart).reduce((total, [productId, quantity]) => {
                            const product = products.find(p => p.id === parseInt(productId));
                            return total + (product?.price || 0) * quantity;
                          }, 0)
                        )}
                      </span>
                    </div>
                    <button
                      onClick={addProductsToSession}
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Thêm vào phiên chơi
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {showEditRateModal && selectedTableForRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa giá - {selectedTableForRate.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá hiện tại
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                  {formatCurrency(selectedTableForRate.hourly_rate)}/giờ
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá mới (VNĐ/giờ)
                </label>
                <input
                  type="number"
                  value={newHourlyRate}
                  onChange={(e) => setNewHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giá mới"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Giá mới: {formatCurrency(newHourlyRate)}/giờ
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditRateModal(false);
                  setSelectedTableForRate(null);
                  setNewHourlyRate(0);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={updateTableRate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={newHourlyRate <= 0}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
