import { Request, Response, NextFunction } from 'express';
import { startHttpTimer, recordHttpRequest } from '../utils/metrics';

/**
 * Middleware para capturar métricas de todas las peticiones HTTP
 * Se aplica globalmente en la aplicación
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Iniciar temporizador
  const startTime = startHttpTimer();
  
  // Guardar el método original res.end para interceptarlo
  const originalEnd = res.end;
  
  // Sobrescribir res.end para capturar cuando la respuesta termina
  res.end = function(chunk?: any, ...args: any[]): Response {
    // Extraer la ruta limpia (sin parámetros de query)
    let route = req.route?.path || req.path || 'unknown';
    
    // Normalizar rutas con parámetros (e.g., /products/:id → /products/:id)
    if (req.route && req.route.path) {
      route = req.route.path;
    }
    
    // Registrar la métrica
    recordHttpRequest(
      req.method,
      route,
      res.statusCode,
      startTime
    );
    
    // Llamar al método original
    return originalEnd.call(this, chunk, ...args) as Response;
  };
  
  next();
};
