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
                            req.path.includes('/calculator-config') || // ✅ CALCULADORA PÚBLICA
                            req.path.includes('/seo-pages'); // ✅ SEO PAGES PÚBLICAS
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
    // Token expirado / inválido no es un error del servidor — es flujo normal (sesión caducada).
    // Solo loguea como error si es algo inesperado (500 real).
    const isExpectedAuthError =
      error instanceof AppError ||
      error?.name === 'JsonWebTokenError' ||
      error?.name === 'TokenExpiredError' ||
      error?.message?.includes('jwt') ||
      error?.message?.includes('token');

    if (isExpectedAuthError) {
      secureLog.warn('Auth rechazada', { reason: error.message });
    } else {
      secureLog.error('Error en auth middleware', error);
    }

    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, error.message || 'Token inválido', 'INVALID_TOKEN'));
    }
  }
};

/**
 * Obtener todos los roles efectivos de un usuario (rol principal + adicionales)
 */
export const getAllUserRoles = (user: { role: string; additionalRoles?: string[] }): string[] => {
  const roles = new Set<string>();
  roles.add(user.role);
  if (user.additionalRoles && Array.isArray(user.additionalRoles)) {
    user.additionalRoles.forEach(r => roles.add(r));
  }
  return Array.from(roles);
};

/**
 * Comprobar si un usuario tiene al menos uno de los roles indicados
 */
export const userHasRole = (user: { role: string; additionalRoles?: string[] }, ...roles: string[]): boolean => {
  const allRoles = getAllUserRoles(user);
  return roles.some(r => allRoles.includes(r));
};

/**
 * Middleware to authorize based on user roles (checks role + additionalRoles)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED'));
    }

    if (!userHasRole(req.user, ...roles)) {
      return next(new AppError(403, 'No tienes permisos para acceder a este recurso', 'FORBIDDEN'));
    }

    next();
  };
};

// Helpers de autorización por área
export const authorizeAdmin = () => authorize('SUPERADMIN', 'ADMIN');
export const authorizeSales = () => authorize('SUPERADMIN', 'ADMIN', 'COMMERCIAL');
export const authorizeWarehouse = () => authorize('SUPERADMIN', 'ADMIN', 'WAREHOUSE');
export const authorizeOperations = () => authorize('SUPERADMIN', 'ADMIN', 'TECHNICIAN', 'WAREHOUSE');
export const authorizeFinance = () => authorize('SUPERADMIN', 'ADMIN', 'ACCOUNTANT');
export const authorizeAnyStaff = () => authorize('SUPERADMIN', 'ADMIN', 'COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT');

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
