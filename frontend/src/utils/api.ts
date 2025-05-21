import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, Equipment, Booking, Notification } from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class ApiClient {
  private api: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 seconds
      withCredentials: true
    });
    this.cache = new Map();
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API Response Error]', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getCachedData(key: string) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private handleError(error: any): ApiResponse<any> {
    console.error('API Error:', error);
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401) {
        // Only return session expired if we have a token
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          return {
            success: false,
            error: 'Session expired. Please login again.',
            code: 'AUTH_ERROR'
          };
        }
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'AUTH_ERROR'
        };
      }

      if (status === 403) {
        return {
          success: false,
          error: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        };
      }

      return {
        success: false,
        error: message || 'An error occurred',
        code: 'API_ERROR'
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }

  // Equipment endpoints
  async getEquipment(): Promise<ApiResponse<Equipment[]>> {
    const cacheKey = 'equipment';
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await this.api.get<ApiResponse<Equipment[]>>('/equipment');
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async bookEquipment(bookingData: {
    equipmentId: string;
    quantity: number;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<Booking>> {
    try {
      console.log('Sending booking request:', bookingData); // Debug log
      const response = await this.api.post<ApiResponse<Booking>>('/bookings', bookingData);
      console.log('Booking response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Booking error:', error); // Debug log
      return this.handleError(error);
    }
  }

  // Add new equipment (admin only)
  async addEquipment(equipmentData: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    try {
      const response = await this.api.post<ApiResponse<Equipment>>('/equipment', equipmentData);
      // Clear equipment cache after successful addition
      this.cache.delete('equipment');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Edit equipment (admin only)
  async editEquipment(id: string, equipmentData: Partial<Equipment>): Promise<ApiResponse<Equipment>> {
    try {
      const response = await this.api.put<ApiResponse<Equipment>>(`/equipment/${id}`, equipmentData);
      // Clear equipment cache after successful edit
      this.cache.delete('equipment');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      console.log('Attempting login for:', email);
      const response = await this.api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', { email, password });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return this.handleError(error);
    }
  }

  async register(username: string, email: string, password: string, role: string): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await this.api.post<ApiResponse<{ token: string; user: any }>>('/auth/register', { 
        username, 
        email, 
        password,
        role 
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Booking endpoints
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      const response = await this.api.get<ApiResponse<Booking[]>>('/bookings');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await this.api.get<ApiResponse<Notification[]>>('/notifications');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Delete equipment (admin only)
  async deleteEquipment(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete<ApiResponse<any>>(`/equipment/${id}`);
      // Clear equipment cache after successful deletion
      this.cache.delete('equipment');
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const api = new ApiClient(); 