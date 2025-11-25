import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para sanitizar inputs y prevenir XSS
 */

// Lista de caracteres peligrosos para XSS
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // <script> tags
  /javascript:/gi, // javascript: protocol
  /on\w+\s*=/gi, // event handlers (onclick, onerror, etc)
  /<iframe/gi, // iframes
  /<embed/gi, // embed tags
  /<object/gi, // object tags
];

/**
 * Sanitizar string básico (eliminar scripts)
 */
function sanitizeString(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;
  
  // Eliminar patrones peligrosos
  for (const pattern of XSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  // Escapar caracteres HTML básicos
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware de sanitización
 * Sanitiza req.body, req.query, req.params
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query params
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar route params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Error sanitizing inputs:', error);
    // Continuar de todos modos
    next();
  }
};

/**
 * Middleware específico para campos de texto HTML
 * Permite algunos tags HTML pero elimina los peligrosos
 */
export const sanitizeHTML = (allowedTags: string[] = ['b', 'i', 'u', 'p', 'br', 'strong', 'em']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implementación básica - en producción usa una librería como sanitize-html
    // o DOMPurify en el servidor
    
    // Por ahora, solo sanitizar normalmente
    sanitizeInputs(req, res, next);
  };
};

/**
 * Validar que no haya scripts en un campo específico
 */
export function hasXSSAttempt(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(value)) {
      return true;
    }
  }

  return false;
}

/**
 * Middleware para detectar intentos de XSS y rechazar request
 */
export const detectXSS = (req: Request, res: Response, next: NextFunction) => {
  try {
    const checkValue = (val: any, path: string = ''): boolean => {
      if (typeof val === 'string') {
        if (hasXSSAttempt(val)) {
          console.warn(`⚠️  XSS attempt detected in ${path}:`, val.substring(0, 100));
          return true;
        }
      } else if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          if (checkValue(val[i], `${path}[${i}]`)) {
            return true;
          }
        }
      } else if (val && typeof val === 'object') {
        for (const key in val) {
          if (checkValue(val[key], path ? `${path}.${key}` : key)) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkValue(req.body, 'body') || checkValue(req.query, 'query')) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Contenido no permitido detectado',
        },
      });
    }

    next();
  } catch (error) {
    console.error('Error detecting XSS:', error);
    next();
  }
};

export default {
  sanitizeInputs,
  sanitizeHTML,
  detectXSS,
  hasXSSAttempt,
};
