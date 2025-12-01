import rateLimit from 'express-rate-limit';

/**
 * Rate limiters específicos por tipo de ruta
 */

// Rate limiter para autenticación (login, register, reset password)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 en desarrollo, 5 en producción
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiados intentos de autenticación. Por favor, espera 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // Desactivar en desarrollo
  // Identificar por IP
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

// Rate limiter específico para login
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 en desarrollo, 5 en producción
  message: {
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Demasiados intentos de login. Por favor, espera 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar requests exitosos
  skip: (req) => process.env.NODE_ENV === 'development', // Desactivar en desarrollo
});

// Rate limiter para registro
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por hora
  message: {
    error: {
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Demasiados intentos de registro. Por favor, espera 1 hora.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para reset password
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por hora
  message: {
    error: {
      code: 'TOO_MANY_RESET_ATTEMPTS',
      message: 'Demasiados intentos de reseteo de contraseña. Por favor, espera 1 hora.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para creación de pedidos
export const orderCreationRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 pedidos cada 5 minutos
  message: {
    error: {
      code: 'TOO_MANY_ORDERS',
      message: 'Demasiados pedidos en poco tiempo. Por favor, espera unos minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit por usuario autenticado o por IP
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Rate limiter para API general (más permisivo)
export const generalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes. Por favor, espera unos minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para uploads
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 uploads por hora
  message: {
    error: {
      code: 'TOO_MANY_UPLOADS',
      message: 'Demasiadas subidas de archivos. Por favor, espera unos minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para búsquedas
export const searchRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 búsquedas por minuto
  message: {
    error: {
      code: 'TOO_MANY_SEARCHES',
      message: 'Demasiadas búsquedas. Por favor, espera un momento.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Permitir rate limit más alto para usuarios autenticados
    return !!(req as any).user;
  },
});

export default {
  auth: authRateLimiter,
  login: loginRateLimiter,
  register: registerRateLimiter,
  passwordReset: passwordResetRateLimiter,
  orderCreation: orderCreationRateLimiter,
  general: generalApiRateLimiter,
  upload: uploadRateLimiter,
  search: searchRateLimiter,
};
