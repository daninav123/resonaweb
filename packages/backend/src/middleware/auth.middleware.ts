import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { prisma } from '../index';
import { AppError } from './error.middleware';
import { tokenBlacklistService } from '../services/tokenBlacklist.service';
import { secureLog } from '../utils/secureLogger';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    secureLog.debug('Auth middleware - Verificando autenticación...');
    
    // Get token from header
    const authHeader = req.headers.authorization;
    secureLog.debug('Auth header presente:', authHeader ? 'Sí' : 'No');
    
    // PERMITIR ACCESO A ENDPOINTS PÚBLICOS SIN TOKEN (solo GET)
    const isPublicEndpoint = req.path.includes('/packs') || 
                            req.path.includes('/products') || 
                            req.path.includes('/categories') || 
                            req.path.includes('/extra-categories') ||
                            req.path.includes('/calculator-config'); // ✅ CALCULADORA PÚBLICA
    const isGetRequest = req.method === 'GET';
    
    // Si no hay token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Permitir solo si es GET en endpoint público
      if (isPublicEndpoint && isGetRequest) {
        secureLog.debug('Endpoint público GET sin token - permitiendo acceso');
        return next();
      }
      
      secureLog.debug('No hay token o formato incorrecto');
      throw new AppError(401, 'Token de autenticación no proporcionado', 'NO_TOKEN');
    }

    // Extract token
    const token = authHeader.substring(7);
    secureLog.debug('Token extraído (masked)');

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
    if (isBlacklisted) {
      secureLog.warn('Token en blacklist');
      throw new AppError(401, 'Token inválido', 'TOKEN_BLACKLISTED');
    }

    // Verify token
    secureLog.debug('Verificando token...');
    const payload = verifyAccessToken(token);
    secureLog.auth('Token verificado', { userId: payload.userId });

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      secureLog.warn('Usuario no encontrado o inactivo');
      throw new AppError(401, 'Usuario no encontrado o inactivo', 'USER_NOT_FOUND');
    }

    secureLog.auth('Usuario autenticado', { userId: user.id, role: user.role });
    
    // Attach user to request
    req.user = user;
    req.token = token; // Store token for logout

    next();
  } catch (error: any) {
    secureLog.error('Error en auth middleware', error);
    
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, error.message || 'Token inválido', 'INVALID_TOKEN'));
    }
  }
};

/**
 * Middleware to authorize based on user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'No tienes permisos para acceder a este recurso', 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Middleware to optionally authenticate (for public routes that may have authenticated users)
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Token invalid, continue without user
    next();
  }
};
