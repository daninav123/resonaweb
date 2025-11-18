import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './error.middleware';
import { logger } from '../utils/logger';

/**
 * Middleware para validar requests usando express-validator
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));
    
    logger.warn('Validation failed:', formattedErrors);
    
    throw new AppError(
      400,
      'Errores de validación',
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
  
  next();
};

/**
 * Wrapper para ejecutar validaciones en secuencia
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }
    
    validateRequest(req, res, next);
  };
};

/**
 * Sanitización de inputs
 */
export class InputSanitizer {
  /**
   * Sanitiza strings removiendo HTML y caracteres peligrosos
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '');
  }

  /**
   * Sanitiza email
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return email;
    
    return email.toLowerCase().trim();
  }

  /**
   * Sanitiza objeto recursivamente
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Middleware para sanitizar el body del request
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = InputSanitizer.sanitizeObject(req.body);
  }
  next();
};

/**
 * Middleware para validar IDs de UUID
 */
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      throw new AppError(400, 'ID inválido', 'INVALID_ID');
    }
    
    next();
  };
};

/**
 * Middleware para validar paginación
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (page < 1) {
    throw new AppError(400, 'Página debe ser mayor a 0', 'INVALID_PAGE');
  }
  
  if (limit < 1 || limit > 100) {
    throw new AppError(400, 'Límite debe estar entre 1 y 100', 'INVALID_LIMIT');
  }
  
  // Añadir valores validados al request
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };
  
  next();
};

/**
 * Middleware para validar fechas
 */
export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.body;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      throw new AppError(400, 'Fecha de inicio inválida', 'INVALID_START_DATE');
    }
    
    if (isNaN(end.getTime())) {
      throw new AppError(400, 'Fecha de fin inválida', 'INVALID_END_DATE');
    }
    
    if (start > end) {
      throw new AppError(400, 'La fecha de inicio debe ser anterior a la fecha de fin', 'INVALID_DATE_RANGE');
    }
    
    // Validar que no sea en el pasado (si se requiere)
    if (start < new Date()) {
      throw new AppError(400, 'La fecha de inicio no puede ser en el pasado', 'PAST_DATE');
    }
  }
  
  next();
};

/**
 * Middleware para validar archivos subidos
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
} = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

    for (const file of files as any[]) {
      if (!file) continue;

      // Validar tamaño
      if (file.size > maxSize) {
        throw new AppError(
          400,
          `El archivo ${file.originalname} excede el tamaño máximo de ${maxSize / 1024 / 1024}MB`,
          'FILE_TOO_LARGE'
        );
      }

      // Validar tipo
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(
          400,
          `Tipo de archivo ${file.mimetype} no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
          'INVALID_FILE_TYPE'
        );
      }
    }

    next();
  };
};

// Extender el tipo Request para incluir paginación
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
    }
  }
}

export {};
