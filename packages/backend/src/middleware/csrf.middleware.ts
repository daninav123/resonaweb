/**
 * CSRF Protection Middleware
 * 
 * Implementa protección contra Cross-Site Request Forgery
 * Usa el patrón "Custom Header" que es efectivo con arquitecturas JWT
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import crypto from 'crypto';

// Cache de tokens CSRF por sesión (en producción usar Redis)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

// Limpiar tokens expirados cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expiresAt < now) {
      csrfTokens.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Genera un token CSRF único
 */
export function generateCsrfToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Guardar token con expiración de 1 hora
  csrfTokens.set(userId, {
    token,
    expiresAt: Date.now() + 60 * 60 * 1000
  });
  
  return token;
}

/**
 * Verifica el token CSRF
 */
function verifyCsrfToken(userId: string, token: string): boolean {
  const stored = csrfTokens.get(userId);
  
  if (!stored) {
    return false;
  }
  
  if (stored.expiresAt < Date.now()) {
    csrfTokens.delete(userId);
    return false;
  }
  
  return stored.token === token;
}

/**
 * Middleware de protección CSRF
 * 
 * Métodos seguros (GET, HEAD, OPTIONS) no requieren verificación
 * Métodos de modificación (POST, PUT, DELETE, PATCH) requieren token CSRF
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Solo verificar en producción (opcional: también en staging)
  const isProduction = process.env.NODE_ENV === 'production';
  const csrfEnabled = process.env.CSRF_PROTECTION !== 'false';
  
  if (!isProduction || !csrfEnabled) {
    return next();
  }
  
  // Métodos seguros no requieren CSRF
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  // Verificar que el usuario esté autenticado
  if (!req.user) {
    return next(new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED'));
  }
  
  // Obtener token CSRF del header
  const csrfToken = req.headers['x-csrf-token'] as string;
  
  if (!csrfToken) {
    return next(new AppError(403, 'Token CSRF no proporcionado', 'CSRF_TOKEN_MISSING'));
  }
  
  // Verificar token
  if (!verifyCsrfToken(req.user.id, csrfToken)) {
    return next(new AppError(403, 'Token CSRF inválido o expirado', 'CSRF_TOKEN_INVALID'));
  }
  
  next();
};

/**
 * Endpoint para obtener un token CSRF
 * Debe estar protegido por autenticación
 */
export const getCsrfToken = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'NOT_AUTHENTICATED',
        message: 'No autenticado'
      }
    });
  }
  
  const token = generateCsrfToken(req.user.id);
  
  res.json({
    csrfToken: token,
    expiresIn: 3600 // 1 hora en segundos
  });
};

/**
 * Middleware alternativo: Custom Header Verification
 * 
 * Verifica que las peticiones incluyan un header personalizado
 * Este método es efectivo porque los navegadores no permiten
 * a sitios maliciosos añadir headers personalizados en peticiones CORS
 */
export const customHeaderProtection = (req: Request, res: Response, next: NextFunction) => {
  // Solo verificar en producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    return next();
  }
  
  // Métodos seguros no requieren verificación
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }
  
  // Verificar header personalizado
  const customHeader = req.headers['x-requested-with'];
  
  if (customHeader !== 'XMLHttpRequest') {
    return next(new AppError(403, 'Header personalizado requerido', 'CUSTOM_HEADER_MISSING'));
  }
  
  next();
};

export default {
  csrfProtection,
  customHeaderProtection,
  getCsrfToken,
  generateCsrfToken,
};
