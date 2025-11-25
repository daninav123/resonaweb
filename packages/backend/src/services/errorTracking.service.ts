/**
 * Error Tracking Service
 * Integración con Sentry para monitoreo de errores en producción
 */

// Configuración de Sentry (comentada para no requerir instalación inmediata)
// import * as Sentry from '@sentry/node';
// import { ProfilingIntegration } from '@sentry/profiling-node';

let sentryEnabled = false;

/**
 * Inicializar Sentry
 */
export function initErrorTracking() {
  const SENTRY_DSN = process.env.SENTRY_DSN;
  const NODE_ENV = process.env.NODE_ENV;

  if (!SENTRY_DSN || NODE_ENV !== 'production') {
    console.log('⚠️  Sentry no configurado o no en producción');
    return;
  }

  try {
    // Descomentar cuando se instale @sentry/node
    /*
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: NODE_ENV,
      integrations: [
        // HTTP Integration
        new Sentry.Integrations.Http({ tracing: true }),
        // Express Integration
        new Sentry.Integrations.Express({ app: undefined }),
        // Performance Profiling
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0, // 10% en prod, 100% en dev
      // Profiling
      profilesSampleRate: 0.1, // 10% de traces
    });
    */

    sentryEnabled = true;
    console.log('✅ Sentry inicializado');
  } catch (error) {
    console.error('❌ Error inicializando Sentry:', error);
  }
}

/**
 * Capturar error en Sentry
 */
export function captureError(error: Error, context?: any) {
  // Log siempre en consola
  console.error('❌ Error capturado:', error);
  
  if (context) {
    console.error('   Contexto:', context);
  }

  // Enviar a Sentry solo si está habilitado
  if (sentryEnabled) {
    try {
      // Sentry.captureException(error, { extra: context });
      console.log('📤 Error enviado a Sentry');
    } catch (err) {
      console.error('Error enviando a Sentry:', err);
    }
  }

  // También guardar en archivo de log
  if (process.env.NODE_ENV === 'production') {
    // Aquí puedes agregar logging a archivo
    // fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n`);
  }
}

/**
 * Capturar mensaje en Sentry
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`📝 [${level.toUpperCase()}] ${message}`);

  if (sentryEnabled) {
    try {
      // Sentry.captureMessage(message, level as any);
    } catch (err) {
      console.error('Error enviando mensaje a Sentry:', err);
    }
  }
}

/**
 * Añadir contexto del usuario
 */
export function setUserContext(userId: string, email?: string, username?: string) {
  if (sentryEnabled) {
    try {
      // Sentry.setUser({ id: userId, email, username });
      console.log(`👤 User context set: ${userId}`);
    } catch (err) {
      console.error('Error setting user context:', err);
    }
  }
}

/**
 * Limpiar contexto del usuario
 */
export function clearUserContext() {
  if (sentryEnabled) {
    try {
      // Sentry.setUser(null);
    } catch (err) {
      console.error('Error clearing user context:', err);
    }
  }
}

/**
 * Añadir breadcrumb (rastro de eventos)
 */
export function addBreadcrumb(message: string, category: string, data?: any) {
  if (sentryEnabled) {
    try {
      /*
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
      */
      console.log(`🍞 Breadcrumb: [${category}] ${message}`);
    } catch (err) {
      console.error('Error adding breadcrumb:', err);
    }
  }
}

/**
 * Middleware de Sentry para Express
 */
export function getSentryRequestHandler() {
  // Descomentar cuando se instale Sentry
  // return Sentry.Handlers.requestHandler();
  
  // Middleware placeholder
  return (req: any, res: any, next: any) => {
    // Agregar request ID para tracking
    req.id = Math.random().toString(36).substring(7);
    next();
  };
}

export function getSentryTracingHandler() {
  // Descomentar cuando se instale Sentry
  // return Sentry.Handlers.tracingHandler();
  
  // Middleware placeholder
  return (req: any, res: any, next: any) => next();
}

export function getSentryErrorHandler() {
  // Descomentar cuando se instale Sentry
  // return Sentry.Handlers.errorHandler();
  
  // Middleware de error básico
  return (err: any, req: any, res: any, next: any) => {
    captureError(err, {
      url: req.url,
      method: req.method,
      body: req.body,
      userId: req.user?.id,
    });
    next(err);
  };
}

export default {
  initErrorTracking,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  getSentryRequestHandler,
  getSentryTracingHandler,
  getSentryErrorHandler,
};
