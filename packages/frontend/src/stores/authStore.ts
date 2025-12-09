import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  userLevel: 'STANDARD' | 'VIP' | 'VIP_PLUS';
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
          
          console.log('🔐 Login exitoso - Datos recibidos:', {
            user: user?.email,
            role: user?.role,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });
          
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
          
          console.log('✅ Estado actualizado en Zustand');
          console.log('💾 Verificando localStorage...', localStorage.getItem('auth-storage'));
          
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
        console.log('🚪 Cerrando sesión y limpiando tokens...');
        
        // Clear token from axios defaults
        if (api.removeAuthToken) {
          api.removeAuthToken();
        }
        
        // Clear localStorage
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('cart');
        sessionStorage.clear();
        
        // Clear state
        set({
          user: null,
          token: null,
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
        // Intentar obtener todo el estado persistido
        let token = get().accessToken;
        let user = get().user;
        let refreshToken = get().refreshToken;
        
        // Si no está en el estado, intentar obtenerlo del storage de zustand persist
        if (!token || !user) {
          try {
            const storedAuth = localStorage.getItem('auth-storage');
            
            if (storedAuth) {
              const parsed = JSON.parse(storedAuth);
              
              token = parsed.state?.accessToken || parsed.state?.token;
              user = parsed.state?.user;
              refreshToken = parsed.state?.refreshToken;
              
              // Restaurar el estado completo desde el storage
              if (token && user) {
                set({
                  accessToken: token,
                  token: token,
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
            token: null
          });
          // Limpiar headers
          if (api.removeAuthToken) {
            api.removeAuthToken();
          }
          return;
        }
        
        try {
          // Set token in axios defaults
          if (api.setAuthToken) {
            api.setAuthToken(token);
          }
          const response: any = await api.get('/auth/me');
          
          // El backend devuelve { data: user }, no { data: { user } }
          const userData = response.data || response;
          
          // Actualizar con datos frescos del servidor
          set({
            user: userData,
            isAuthenticated: true,
            loading: false,
            accessToken: token,
            token: token,
          });
        } catch (error: any) {
          const status = error?.response?.status;
          
          // Si es 401, limpiar todo y resetear estado
          if (status === 401) {
            console.log('❌ Token inválido o expirado (401), limpiando sesión');
            set({ 
              isAuthenticated: false, 
              loading: false,
              user: null,
              accessToken: null,
              refreshToken: null,
              token: null
            });
            // Limpiar localStorage y headers
            localStorage.removeItem('auth-storage');
            if (api.removeAuthToken) {
              api.removeAuthToken();
            }
          } else if (status === 429) {
            // Rate limiting - no reintentar automáticamente
            console.log('⚠️ Rate limiting (429), esperando antes de reintentar...');
            set({ loading: false });
            // No hacer nada más, dejar que se recupere naturalmente
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
        token: state.token,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
