import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  CreateInvoiceRequest, 
  Invoice, 
  DailyReport, 
  MonthlyReport,
  Table,
  TableSession,
  StartSessionRequest,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  AddOrderRequest,
  SessionOrder
} from '@/types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Health check
  public async healthCheck(): Promise<{ message: string; status: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Authentication
  public async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post('/auth/login', credentials);
    const data = response.data;
    this.setToken(data.token);
    return data;
  }

  public async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.removeToken();
    }
  }

  // Invoice management
  public async createInvoice(invoice: CreateInvoiceRequest): Promise<Invoice> {
    const response = await this.api.post('/invoices/', invoice);
    return response.data;
  }

  public async getAllInvoices(limit: number = 10, offset: number = 0): Promise<Invoice[]> {
    const response = await this.api.get(`/invoices/?limit=${limit}&offset=${offset}`);
    return response.data.invoices || [];
  }

  public async getInvoiceById(id: number): Promise<Invoice> {
    const response = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  // Reports
  public async getDailyReport(date: string): Promise<DailyReport> {
    const response = await this.api.get(`/reports/daily?date=${date}`);
    return response.data;
  }

  public async getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    const response = await this.api.get(`/reports/monthly?year=${year}&month=${month}`);
    return response.data;
  }

  // Tables Management
  public async getAllTables(): Promise<Table[]> {
    const response = await this.api.get('/tables/');
    return response.data.tables || response.data; // Handle both formats
  }

  public async updateTableRate(tableId: number, hourlyRate: number): Promise<{ message: string }> {
    const response = await this.api.put(`/tables/${tableId}/rate`, {
      hourly_rate: hourlyRate
    });
    return response.data;
  }

  public async getActiveSessions(): Promise<TableSession[]> {
    const response = await this.api.get('/tables/sessions');
    return response.data.sessions || response.data; // Handle both formats
  }

  public async startSession(request: StartSessionRequest): Promise<{ message: string; session: TableSession }> {
    const response = await this.api.post('/tables/sessions', request);
    return response.data;
  }

  public async getSessionById(id: number): Promise<TableSession> {
    const response = await this.api.get(`/tables/sessions/${id}`);
    return response.data;
  }

  public async updateRemainingTime(sessionId: number, remainingMinutes: number): Promise<{ message: string }> {
    const response = await this.api.put(`/tables/sessions/${sessionId}/time`, {
      remaining_minutes: remainingMinutes
    });
    return response.data;
  }

  public async endSession(sessionId: number, finalAmount?: number, discount?: number): Promise<{ message: string; invoice_id: number; total_amount: number }> {
    const response = await this.api.post(`/tables/sessions/${sessionId}/end`, {
      final_amount: finalAmount,
      discount: discount
    });
    return response.data;
  }

  public async autoExpireSessions(): Promise<{ message: string }> {
    const response = await this.api.post('/tables/sessions/expire');
    return response.data;
  }

  // Products Management
  public async getAllProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/');
    return response.data.products || response.data; // Handle both formats
  }

  public async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await this.api.post('/products/', product);
    return response.data;
  }

  public async updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
    const response = await this.api.put(`/products/${id}`, product);
    return response.data;
  }

  public async deleteProduct(id: number): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Session Orders
  public async addOrderToSession(order: AddOrderRequest): Promise<{ message: string; orders: SessionOrder[] }> {
    const response = await this.api.post('/tables/sessions/orders', order);
    return response.data;
  }

  // Calculate session amount realtime
  public async calculateSessionAmount(sessionId: number): Promise<{
    session_id: number;
    session_type: string;
    actual_minutes: number;
    table_amount: number;
    orders_amount: number;
    total_amount: number;
    hourly_rate: number;
  }> {
    const response = await this.api.get(`/tables/sessions/${sessionId}/calculate-amount`);
    return response.data;
  }

  // Dashboard APIs
  public async getDashboardStats(): Promise<{
    today_revenue: number;
    active_sessions: number;
    today_invoices: number;
    avg_session_time: number;
  }> {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  public async getTodayInvoices(): Promise<any[]> {
    const response = await this.api.get('/invoices/today');
    return response.data;
  }

  public async getRecentActivities(): Promise<any[]> {
    const response = await this.api.get('/dashboard/activities');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
