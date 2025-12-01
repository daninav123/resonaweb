import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log('🔴 ERROR MIDDLEWARE ACTIVADO');
  console.log('🔴 Tipo de error:', err.name);
  console.log('🔴 Mensaje:', err.message);
  console.log('🔴 URL:', req.method, req.url);
  
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userId: (req as any).user?.id,
  });

  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Ha ocurrido un error interno del servidor';
  let details = undefined;

  // Handle different error types
  if (err instanceof AppError) {
    console.log('🔴 Es AppError, statusCode:', err.statusCode);
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Los datos proporcionados no son válidos';
    details = err.message;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Token de autenticación inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token de autenticación expirado';
  } else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'El registro ya existe';
      details = prismaError.meta;
    } else if (prismaError.code === 'P2025') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Registro no encontrado';
    }
  }

  // Send error response
  const errorResponse: ErrorResponse = {
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { details }),
    },
  };

  res.status(statusCode).json(errorResponse);
};
