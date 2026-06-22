import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, RegisterData } from '@resona/shared-types';
import { api } from './api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });

        if (api.removeAuthToken) api.removeAuthToken();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        try {
          const response: any = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = response.data.data || response.data;

          console.log('🔐 Login exitoso:', {
            user: user?.email,
            role: user?.role,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
          });

          if (api.setAuthToken) api.setAuthToken(accessToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return true;
        } catch (error: any) {
          console.error('❌ Error en login:', error);
          set({
            loading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión',
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({ loading: true, error: null });

        if (api.removeAuthToken) api.removeAuthToken();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        try {
          const response: any = await api.post('/auth/register', data);
          const { user, accessToken, refreshToken } = response.data.data || response.data;

          if (api.setAuthToken) api.setAuthToken(accessToken);

          set({
            user,
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
        console.log('🚪 Cerrando sesión y limpiando tokens...');

        if (api.removeAuthToken) api.removeAuthToken();

        localStorage.removeItem('auth-storage');
        localStorage.removeItem('cart');
        sessionStorage.clear();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        console.log('✅ Sesión cerrada completamente');
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return;

        try {
          const response: any = await api.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          if (api.setAuthToken) api.setAuthToken(accessToken);

          set({
            accessToken,
            refreshToken: newRefreshToken,
          });
        } catch {
          get().logout();
        }
      },

      checkAuth: async () => {
        let token = get().accessToken;
        let user = get().user;
        let refreshToken = get().refreshToken;

        if (!token || !user) {
          try {
            const storedAuth = localStorage.getItem('auth-storage');

            if (storedAuth) {
              const parsed = JSON.parse(storedAuth);

              token = parsed.state?.accessToken || parsed.state?.token;
              user = parsed.state?.user;
              refreshToken = parsed.state?.refreshToken;

              if (token && user) {
                set({
                  accessToken: token,
                  refreshToken: refreshToken,
                  user: user,
                  isAuthenticated: true,
                  loading: false,
                });
              }
            }
          } catch (e) {
            console.error('Error parsing auth storage:', e);
          }
        }

        if (!token) {
          set({
            loading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          if (api.removeAuthToken) api.removeAuthToken();
          return;
        }

        try {
          if (api.setAuthToken) api.setAuthToken(token);
          const response: any = await api.get('/auth/me');
          const userData = response.data || response;

          set({
            user: userData,
            isAuthenticated: true,
            loading: false,
            accessToken: token,
          });
        } catch (error: any) {
          const status = error?.response?.status;

          if (status === 401) {
            set({
              isAuthenticated: false,
              loading: false,
              user: null,
              accessToken: null,
              refreshToken: null,
            });
            localStorage.removeItem('auth-storage');
            if (api.removeAuthToken) api.removeAuthToken();
          } else if (status === 429) {
            console.log('⚠️ Rate limiting (429), esperando antes de reintentar...');
            set({ loading: false });
          } else {
            console.log('⚠️ Error inesperado en checkAuth:', status, error?.message);
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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
