import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@stores/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api/v1';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Endpoints que deberían silenciar 401 (son esperados sin autenticación)
    const silentOn401Endpoints = [
      '/notifications/unread-count',
      '/cart',
      '/auth/me',
      '/auth/refresh'
    ];

    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // NO añadir token a endpoints de autenticación ni a endpoints públicos
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                              config.url?.includes('/auth/register');
        const isPublicEndpoint = config.url?.includes('/packs') ||
                                config.url?.includes('/products') ||
                                config.url?.includes('/categories') ||
                                config.url?.includes('/calculator-config');
        
        if (!isAuthEndpoint && !isPublicEndpoint) {
          const token = useAuthStore.getState().accessToken;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        // Verificar si este endpoint debe silenciar 401
        const shouldSilent401 = status === 401 && 
          silentOn401Endpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        // Handle 429 Rate Limiting - no reintentar automáticamente
        if (status === 429) {
          console.warn('⚠️ Rate limiting (429) - esperando antes de reintentar');
          // No hacer nada, dejar que se recupere naturalmente
          return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (status === 401 && !originalRequest._retry) {
          // No intentar refresh para endpoints de auth
          if (originalRequest.url?.includes('/auth/me') || 
              originalRequest.url?.includes('/auth/login') || 
              originalRequest.url?.includes('/auth/register') ||
              originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
          }
          
          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
              // No hacer logout automático, dejar que el usuario decida
              return Promise.reject(error);
            }

            // Try to refresh token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            useAuthStore.setState({ accessToken });

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError: any) {
            // Si el refresh falla por rate limiting, no reintentar
            if (refreshError?.response?.status === 429) {
              console.warn('⚠️ Rate limiting en refresh - esperando...');
              return Promise.reject(refreshError);
            }
            
            // Si el refresh falla con 401 (token expirado), hacer logout
            if (refreshError?.response?.status === 401) {
              console.warn('🔒 Sesión expirada - redirigiendo a login...');
              useAuthStore.getState().logout();
              
              // Mostrar toast solo si no estamos ya en login
              if (!window.location.pathname.includes('/login')) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                // Redirigir a login después de un breve delay
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1500);
              }
            }
            
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors - NO mostrar toast para endpoints silenciosos con 401
        if (shouldSilent401) {
          // Silencioso - no mostrar toast ni loguear
          return Promise.reject(error);
        } else if (status === 429) {
          // Rate limiting - no mostrar toast, es temporal
          return Promise.reject(error);
        } else if (status === 404) {
          // 404 - No mostrar toast, es esperado en algunos casos (ej: productos no encontrados)
          return Promise.reject(error);
        } else if (error.response?.data?.error?.message) {
          toast.error(error.response.data.error.message);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message && status !== 401) {
          toast.error(error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // File upload
  // Auth token management
  setAuthToken(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete axios.defaults.headers.common['Authorization'];
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

const apiClient = new ApiClient();
export { apiClient as api };
export default apiClient;
