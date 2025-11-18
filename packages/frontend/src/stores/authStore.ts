import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        // Limpiar tokens viejos ANTES del login
        if (api.removeAuthToken) {
          api.removeAuthToken();
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        try {
          const response: any = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response.data.data || response.data;
          
          // Store token in axios defaults
          if (api.setAuthToken) {
            api.setAuthToken(accessToken);
          }
          
          set({
            user,
            token: accessToken,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
          return true;
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión',
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true, error: null });
        
        // Limpiar tokens viejos ANTES del registro
        if (api.removeAuthToken) {
          api.removeAuthToken();
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        try {
          const response: any = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = response.data.data || response.data;
          
          // Store token in axios defaults
          if (api.setAuthToken) {
            api.setAuthToken(accessToken);
          }
          
          set({
            user,
            token: accessToken,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
          
          return true;
        } catch (error: any) {
          set({
            loading: false,
            error: error.response?.data?.message || 'Error al registrar usuario',
          });
          return false;
        }
      },

      logout: () => {
        // Clear token from axios defaults
        if (api.removeAuthToken) {
          api.removeAuthToken();
        }
        set({
          user: null,
          token: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return;

        try {
          const response: any = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Store new token in axios defaults
          if (api.setAuthToken) {
            api.setAuthToken(accessToken);
          }
          
          set({
            token: accessToken,
            accessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      checkAuth: async () => {
        const token = get().accessToken || localStorage.getItem('accessToken');
        
        if (!token) {
          set({ 
            loading: false, 
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            token: null
          });
          // Limpiar headers
          if (api.removeAuthToken) {
            api.removeAuthToken();
          }
          return;
        }

        set({ loading: true });
        
        try {
          // Set token in axios defaults
          if (api.setAuthToken) {
            api.setAuthToken(token);
          }
          const response: any = await api.get('/auth/me');
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: any) {
          // Si es 401, limpiar todo y resetear estado
          if (error?.response?.status === 401) {
            set({ 
              isAuthenticated: false, 
              loading: false,
              user: null,
              accessToken: null,
              refreshToken: null,
              token: null
            });
            // Limpiar localStorage y headers
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('auth-storage');
            if (api.removeAuthToken) {
              api.removeAuthToken();
            }
          } else {
            set({ loading: false });
          }
        }
      },

      setUser: (user: User | null) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
