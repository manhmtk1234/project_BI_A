'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Edit, Trash2, Package, Coffee, Utensils, ShoppingCart, DollarSign } from 'lucide-react';
import { Product } from '@/types';
import { apiClient } from '@/lib/api-client';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'drink',
    description: '',
  });
  const router = useRouter();

  // Check if user is logged in and load products
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllProducts();
      
      // Ensure data is array
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please check if you are logged in.');
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Tất cả', icon: Package },
    { value: 'drink', label: 'Đồ uống', icon: Coffee },
    { value: 'food', label: 'Đồ ăn', icon: Utensils },
    { value: 'accessory', label: 'Phụ kiện', icon: ShoppingCart },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drink': return Coffee;
      case 'food': return Utensils;
      case 'accessory': return ShoppingCart;
      default: return Package;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'drink': return 'Đồ uống';
      case 'food': return 'Đồ ăn';
      case 'accessory': return 'Phụ kiện';
      default: return 'Khác';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price) {
      try {
        const productData = {
          name: newProduct.name,
          price: newProduct.price,
          category: newProduct.category as 'drink' | 'food' | 'accessory',
          description: newProduct.description || '',
        };
        await apiClient.createProduct(productData);
        await loadProducts(); // Refresh products list
        setNewProduct({ name: '', price: 0, category: 'drink', description: '' });
        setShowAddModal(false);
      } catch (err) {
        console.error('Error creating product:', err);
        alert('Không thể tạo sản phẩm');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({ ...product });
    setShowAddModal(true);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct && newProduct.name && newProduct.price) {
      try {
        const productData = {
          name: newProduct.name,
          price: newProduct.price,
          category: newProduct.category as 'drink' | 'food' | 'accessory',
          description: newProduct.description || '',
          is_active: true,
        };
        await apiClient.updateProduct(editingProduct.id, productData);
        await loadProducts(); // Refresh products list
        setEditingProduct(null);
        setNewProduct({ name: '', price: 0, category: 'drink', description: '' });
        setShowAddModal(false);
      } catch (err) {
        console.error('Error updating product:', err);
        alert('Không thể cập nhật sản phẩm');
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await apiClient.deleteProduct(id);
      await loadProducts(); // Refresh products list
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Không thể xóa sản phẩm');
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center text-white">Đang tải...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-400">
          {error}
          <button 
            onClick={loadProducts}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
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
            <h1 className="text-2xl font-bold text-white">Quản lý sản phẩm</h1>
            <p className="text-blue-200 mt-1">Quản lý các sản phẩm bán kèm trong quán</p>
          </div>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({ name: '', price: 0, category: 'drink', description: '' });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <Package className="w-10 h-10 text-blue-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Giá trị trung bình</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue / totalProducts || 0)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Loại sản phẩm</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-purple-300" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      selectedCategory === category.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const Icon = getCategoryIcon(product.category);
            
            return (
              <div key={product.id} className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{product.name}</h3>
                      <p className="text-slate-400 text-sm">{getCategoryLabel(product.category)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Giá bán:</span>
                    <span className="text-white font-semibold">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-500">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Giá bán
                </label>
                <input
                  type="number"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giá bán"
                  min={0}
                  step={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả sản phẩm"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Loại sản phẩm
                </label>
                <select
                  value={newProduct.category || 'drink'}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as 'drink' | 'food' | 'accessory' })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="drink">Đồ uống</option>
                  <option value="food">Đồ ăn</option>
                  <option value="accessory">Phụ kiện</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', price: 0, category: 'drink', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
