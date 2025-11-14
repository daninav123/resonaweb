import rateLimit from 'express-rate-limit';

// Create rate limiter
export const rateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas peticiones, por favor intenta más tarde',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Demasiados intentos de autenticación, por favor intenta más tarde',
    },
  },
  skipSuccessfulRequests: true,
});
