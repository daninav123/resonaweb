import { useAuthStore } from './authStore';

let refreshInterval: ReturnType<typeof setInterval> | null = null;

export const startTokenRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);

  console.log('🔄 Sistema de renovación automática de token iniciado');

  const REFRESH_INTERVAL = 7 * 60 * 60 * 1000;

  refreshInterval = setInterval(async () => {
    const { refreshToken, refreshAccessToken, isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated && refreshToken) {
      console.log('🔄 Renovando token automáticamente...');
      try {
        await refreshAccessToken();
        console.log('✅ Token renovado exitosamente');
      } catch (error) {
        console.error('❌ Error al renovar token:', error);
      }
    }
  }, REFRESH_INTERVAL);

  checkTokenExpiration();
};

export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏹️ Sistema de renovación automática de token detenido');
  }
};

const checkTokenExpiration = async () => {
  const { accessToken, refreshAccessToken, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !accessToken) return;

  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = exp - now;

    const THIRTY_MINUTES = 30 * 60 * 1000;

    if (timeUntilExpiry < THIRTY_MINUTES && timeUntilExpiry > 0) {
      console.log('⚠️ Token próximo a expirar, renovando...');
      await refreshAccessToken();
      console.log('✅ Token renovado por proximidad de expiración');
    }
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
  }
};

export const useTokenRefresh = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    startTokenRefresh();
  } else {
    stopTokenRefresh();
  }
};
