# 📊 Monitorización - ReSona

## Stack de Monitorización

- **Prometheus** - Recolección de métricas
- **Grafana** - Visualización y dashboards
- **Winston** - Logging
- **Alertmanager** - Gestión de alertas

## Métricas Clave

### Disponibilidad
- **Uptime** del backend y frontend
- Health checks cada 30 segundos
- Target: 99.9% uptime

### Rendimiento
- **Latencia** de respuesta (p50, p95, p99)
- **Throughput** (requests/segundo)
- **Tasa de errores** (4xx, 5xx)

### Recursos
- **CPU** usage (%)
- **Memoria** usage (MB)
- **Disco** available (GB)
- **Conexiones BD** activas

### Negocio
- Pedidos creados/día
- Ingresos generados
- Productos más alquilados
- Usuarios registrados

## Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'resona-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'
```

## Grafana Dashboards

### Dashboard: Sistema
- CPU y Memoria
- Latencia de API
- Errores por endpoint
- Conexiones activas

### Dashboard: Negocio
- Pedidos por día
- Ingresos totales
- Ocupación de inventario
- Usuarios activos

## Alertas

### Críticas (PagerDuty/SMS)
- API down > 2 min
- Error rate > 5% (5 min)
- DB connections > 90%

### Warning (Slack)
- Latencia > 500ms (5 min)
- Disco < 10GB
- Error rate > 2%

## Logs

### Niveles
```javascript
logger.error('Error crítico');  // Errores del sistema
logger.warn('Advertencia');     // Rate limits, etc
logger.info('Pedido creado');   // Eventos importantes
logger.debug('Debug info');     // Solo desarrollo
```

### Rotación
- Logs diarios
- Retención: 30 días
- Archivos: logs/error.log, logs/combined.log

## Health Endpoints

### Backend
```
GET /health
Response: { "status": "ok", "uptime": 12345, "timestamp": "..." }
```

### Frontend
```
GET / 
Status: 200 = healthy
```

## Configuración de Alertas

```yaml
# alertmanager.yml
route:
  receiver: 'slack-notifications'
  routes:
    - match:
        severity: 'critical'
      receiver: 'pagerduty'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/...'
        channel: '#wind-surf-alerts'
```
