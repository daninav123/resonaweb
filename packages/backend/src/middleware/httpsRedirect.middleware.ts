import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para forzar HTTPS en producción
 * Redirige automáticamente HTTP → HTTPS
 */
export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  // Solo aplicar en producción
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Verificar si la conexión es segura
  const isSecure = 
    req.secure || // Express detecta HTTPS
    req.headers['x-forwarded-proto'] === 'https' || // Proxy/Load Balancer
    req.headers['x-forwarded-ssl'] === 'on'; // Algunos proxies

  if (!isSecure) {
    // Construir URL HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    
    console.log(`🔒 Redirigiendo HTTP → HTTPS: ${req.url}`);
    
    // Redirect permanente (301)
    return res.redirect(301, httpsUrl);
  }

  next();
};

/**
 * Middleware para añadir headers de seguridad HTTPS
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Solo en producción
  if (process.env.NODE_ENV === 'production') {
    // Strict Transport Security (HSTS)
    // Forzar HTTPS por 1 año
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection (legacy pero útil)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  next();
};

export default {
  httpsRedirect,
  securityHeaders,
};
