import { useAuthStore } from '../stores/authStore';

let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Inicia el sistema de renovación automática de tokens
 * Renueva el token cada 7 horas (antes de que expire a las 8 horas)
 */
export const startTokenRefresh = () => {
  // Limpiar interval anterior si existe
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  console.log('🔄 Sistema de renovación automática de token iniciado');
  console.log('⏰ El token se renovará cada 7 horas automáticamente');

  // Renovar cada 7 horas (7 * 60 * 60 * 1000 ms)
  const REFRESH_INTERVAL = 7 * 60 * 60 * 1000; // 7 horas

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

  // También renovar inmediatamente si el token está próximo a expirar
  checkTokenExpiration();
};

/**
 * Detiene el sistema de renovación automática
 */
export const stopTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏹️ Sistema de renovación automática de token detenido');
  }
};

/**
 * Verifica si el token está próximo a expirar y lo renueva si es necesario
 */
const checkTokenExpiration = async () => {
  const { accessToken, refreshAccessToken, isAuthenticated } = useAuthStore.getState();

  if (!isAuthenticated || !accessToken) return;

  try {
    // Decodificar el JWT para ver la fecha de expiración
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    const now = Date.now();
    const timeUntilExpiry = exp - now;

    // Si quedan menos de 30 minutos, renovar
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

/**
 * Hook para iniciar el sistema cuando el usuario se autentica
 */
export const useTokenRefresh = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    startTokenRefresh();
  } else {
    stopTokenRefresh();
  }
};
