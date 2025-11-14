import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { prisma } from '../index';
import { AppError } from './error.middleware';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token de autenticación no proporcionado', 'NO_TOKEN');
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Usuario no encontrado o inactivo', 'USER_NOT_FOUND');
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error: any) {
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
