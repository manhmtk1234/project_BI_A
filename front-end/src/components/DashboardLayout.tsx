'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  ShoppingCart, 
  FileText, 
  Printer, 
  User, 
  LogOut, 
  Menu, 
  X,
  Users,
  Clock
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: 'text-blue-400' },
  { icon: Clock, label: 'Quản lý bàn', href: '/tables', color: 'text-green-400' },
  { icon: Receipt, label: 'Hóa đơn', href: '/invoices', color: 'text-purple-400' },
  { icon: BarChart3, label: 'Báo cáo', href: '/reports', color: 'text-orange-400' },
  { icon: ShoppingCart, label: 'Sản phẩm', href: '/products', color: 'text-pink-400' },
  { icon: FileText, label: 'Quản lý HĐ', href: '/invoice-management', color: 'text-cyan-400' },
  { icon: Printer, label: 'In hóa đơn', href: '/print', color: 'text-yellow-400' },
];

export default function DashboardLayout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-white font-bold text-lg">Bi-A System</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-blue-300 text-sm capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white hover:text-blue-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-semibold">
              {menuItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-blue-200">
              <Users className="w-4 h-4" />
              <span>{user?.username}</span>
              <span className="px-2 py-1 bg-blue-500/20 rounded-full text-xs">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
