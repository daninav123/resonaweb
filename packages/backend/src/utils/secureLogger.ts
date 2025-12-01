/**
 * Utilidad de Logging Seguro
 * Oculta información sensible en producción
 */

import { logger } from './logger';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Oculta información sensible de un string
 */
function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Ocultar tokens JWT (mostrar solo primeros 10 caracteres)
    if (data.includes('eyJ')) {
      return data.substring(0, 10) + '...[MASKED]';
    }
    
    // Ocultar emails (mostrar solo dominio)
    const emailRegex = /([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    data = data.replace(emailRegex, '***@$2');
    
    // Ocultar IPs
    const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    data = data.replace(ipRegex, '***.***.***.**');
    
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = Array.isArray(data) ? [] : {};
    
    for (const key in data) {
      const lowerKey = key.toLowerCase();
      
      // Ocultar campos sensibles completamente
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('apikey') ||
        lowerKey.includes('authorization')
      ) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskSensitiveData(data[key]);
      }
    }
    
    return masked;
  }
  
  return data;
}

/**
 * Logger seguro para desarrollo
 */
export const secureLog = {
  /**
   * Log de información (solo en desarrollo o con datos maskeados)
   */
  info: (message: string, data?: any) => {
    if (!isProduction) {
      console.log(`ℹ️  ${message}`, data || '');
    } else if (data) {
      logger.info(message, maskSensitiveData(data));
    } else {
      logger.info(message);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (message: string, data?: any) => {
    if (!isProduction) {
      console.log(`🔍 ${message}`, data || '');
    }
  },

  /**
   * Log de advertencia
   */
  warn: (message: string, data?: any) => {
    if (!isProduction) {
      console.warn(`⚠️  ${message}`, data || '');
    } else {
      logger.warn(message, data ? maskSensitiveData(data) : undefined);
    }
  },

  /**
   * Log de error (siempre registra pero maskea datos sensibles)
   */
  error: (message: string, error?: any) => {
    if (!isProduction) {
      console.error(`❌ ${message}`, error || '');
    } else {
      // En producción, registrar pero sin stack trace completo si no es necesario
      const maskedError = error ? {
        message: error.message,
        code: error.code,
        // No incluir stack en producción por defecto
      } : undefined;
      
      logger.error(message, maskedError);
    }
  },

  /**
   * Log de autenticación (siempre maskeado)
   */
  auth: (message: string, data?: any) => {
    if (!isProduction) {
      console.log(`🔐 ${message}`, maskSensitiveData(data || {}));
    } else {
      logger.info(`Auth: ${message}`, maskSensitiveData(data || {}));
    }
  },

  /**
   * Log de operación exitosa
   */
  success: (message: string, data?: any) => {
    if (!isProduction) {
      console.log(`✅ ${message}`, data || '');
    } else {
      logger.info(message, data ? maskSensitiveData(data) : undefined);
    }
  },
};

/**
 * Helper para validar que no estamos logueando información sensible
 */
export function isSensitiveData(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes('password') ||
    lowerKey.includes('token') ||
    lowerKey.includes('secret') ||
    lowerKey.includes('apikey') ||
    lowerKey.includes('authorization') ||
    lowerKey.includes('credit') ||
    lowerKey.includes('card')
  );
}

export default secureLog;
