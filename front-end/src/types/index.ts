// Types for the Bi-A Management System
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'staff';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Table Management
export interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TableSession {
  id: number;
  table_id: number;
  table_name?: string;
  customer_name: string;
  start_time: string;
  preset_duration_minutes: number;
  remaining_minutes?: number;
  hourly_rate: number;
  prepaid_amount: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  session_type: 'fixed_time' | 'open_play'; // <-- Thêm dòng này
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface StartSessionRequest {
  table_id: number;
  customer_name: string;
  preset_duration_minutes: number;
  prepaid_amount: number;
}

// Products
export interface Product {
  id: number;
  name: string;
  category: 'drink' | 'food' | 'accessory' | 'service';
  price: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  category: 'drink' | 'food' | 'accessory' | 'service';
  price: number;
  description: string;
}

export interface UpdateProductRequest {
  name: string;
  category: 'drink' | 'food' | 'accessory' | 'service';
  price: number;
  description: string;
  is_active: boolean;
}

export interface SessionOrder {
  id: number;
  session_id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  ordered_at: string;
}

export interface AddOrderRequest {
  session_id: number;
  items: AddOrderItemRequest[];
}

export interface AddOrderItemRequest {
  product_id: number;
  quantity: number;
}

// Enhanced session with orders
export interface SessionWithDetails {
  id: number;
  table_id: number;
  table_name?: string;
  customer_name: string;
  start_time: string;
  preset_duration_minutes: number;
  remaining_minutes?: number;
  hourly_rate: number;
  prepaid_amount: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  created_by: number;
  created_at: string;
  updated_at: string;
  orders?: SessionOrder[];
  total_order_amount: number;
}

// Invoices
export interface CreateInvoiceRequest {
  table_name: string;
  start_time: string;
  end_time: string;
  play_duration_minutes: number;
  hourly_rate: number;
  services_detail: string;
  service_total: number;
  discount: number;
}

export interface Invoice {
  id: number;
  amount: number;
  table_name: string;
  start_time: string;
  end_time: string;
  play_duration_minutes: number;
  hourly_rate: number;
  time_total: number;
  services_detail: string;
  service_total: number;
  discount: number;
  session_id?: number;
  customer_name?: string;
  payment_status?: 'pending' | 'paid' | 'cancelled';
  created_by: number;
  created_at: string;
}

// Reports
export interface DailyReport {
  date: string;
  total_invoices: number;
  total_revenue: number;
  total_time_revenue: number;
  total_service_revenue: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  total_invoices: number;
  total_revenue: number;
  total_time_revenue: number;
  total_service_revenue: number;
}
