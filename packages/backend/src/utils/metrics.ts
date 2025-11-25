import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Crear registro de métricas
export const register = new Registry();

// Recolectar métricas por defecto del sistema (CPU, memoria, etc.)
collectDefaultMetrics({ 
  register,
  prefix: 'resona_'
});

// ============= MÉTRICAS PERSONALIZADAS =============

// Contador de requests HTTP
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Histograma de duración de requests
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // Buckets en segundos
  registers: [register]
});

// Contador de errores por tipo
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total de errores por tipo',
  labelNames: ['type', 'code'],
  registers: [register]
});

// ============= MÉTRICAS DE NEGOCIO =============

// Pedidos creados
export const ordersCreatedTotal = new Counter({
  name: 'orders_created_total',
  help: 'Total de pedidos creados',
  registers: [register]
});

// Carritos creados
export const cartsCreatedTotal = new Counter({
  name: 'carts_created_total',
  help: 'Total de carritos creados',
  registers: [register]
});

// Carritos abandonados
export const cartsAbandonedTotal = new Counter({
  name: 'carts_abandoned_total',
  help: 'Total de carritos abandonados',
  registers: [register]
});

// Intentos de login fallidos
export const loginAttemptsFailedTotal = new Counter({
  name: 'login_attempts_failed_total',
  help: 'Total de intentos de login fallidos',
  registers: [register]
});

// Rate limit excedido
export const rateLimitExceededTotal = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total de veces que se excedió el rate limit',
  labelNames: ['endpoint'],
  registers: [register]
});

// ============= MÉTRICAS DE BASE DE DATOS =============

// Conexiones activas a la BD
export const dbConnectionsActive = new Gauge({
  name: 'db_connections_active',
  help: 'Número de conexiones activas a la base de datos',
  registers: [register]
});

// Queries ejecutadas
export const dbQueriesTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total de queries ejecutadas en la base de datos',
  labelNames: ['operation', 'table'],
  registers: [register]
});

// Duración de queries
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duración de las queries de base de datos en segundos',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
});

// ============= FUNCIONES AUXILIARES =============

/**
 * Inicia el temporizador para medir la duración de una request
 */
export function startHttpTimer() {
  return Date.now();
}

/**
 * Registra una request HTTP completada
 */
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  startTime: number
) {
  const duration = (Date.now() - startTime) / 1000; // Convertir a segundos
  
  httpRequestsTotal.inc({ 
    method, 
    route, 
    status: statusCode 
  });
  
  httpRequestDuration.observe(
    { method, route, status: statusCode },
    duration
  );
}

/**
 * Registra un error
 */
export function recordError(type: string, code: string) {
  errorsTotal.inc({ type, code });
}
