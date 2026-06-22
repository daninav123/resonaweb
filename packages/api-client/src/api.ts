import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './authStore';

// En dev usamos ruta relativa → Vite proxy /api → http://localhost:3001 (sin CORS).
// En prod, VITE_API_URL apunta al backend público (ej. https://resona-backend.onrender.com/api/v1).
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api/v1';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    const silentOn401Endpoints = [
      '/notifications/unread-count',
      '/cart',
      '/auth/me',
      '/auth/refresh',
    ];

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const isAuthEndpoint =
          config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

        if (!isAuthEndpoint) {
          const token = useAuthStore.getState().accessToken;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const shouldSilent401 =
          status === 401 &&
          silentOn401Endpoints.some((endpoint) => originalRequest.url?.includes(endpoint));

        if (status === 429) {
          console.warn('⚠️ Rate limiting (429) - esperando antes de reintentar');
          return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
          if (
            originalRequest.url?.includes('/auth/me') ||
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh')
          ) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) return Promise.reject(error);

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data;
            useAuthStore.setState({ accessToken });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError: any) {
            if (refreshError?.response?.status === 429) {
              console.warn('⚠️ Rate limiting en refresh - esperando...');
              return Promise.reject(refreshError);
            }

            if (refreshError?.response?.status === 401) {
              console.warn('🔒 Sesión expirada - redirigiendo a login...');
              useAuthStore.getState().logout();

              if (!window.location.pathname.includes('/login')) {
                toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                setTimeout(() => {
                  window.location.href = '/login';
                }, 1500);
              }
            }

            return Promise.reject(refreshError);
          }
        }

        if (shouldSilent401) {
          return Promise.reject(error);
        } else if (status === 429) {
          return Promise.reject(error);
        } else if (status === 404) {
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
