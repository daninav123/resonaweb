# 🔒 Documento de Seguridad - ReSona

## Autenticación y Autorización

### JWT (JSON Web Tokens)
- **Access Token:** 15 minutos de validez
- **Refresh Token:** 7 días de validez
- Algoritmo: HS256
- Tokens almacenados en httpOnly cookies (frontend)
- Blacklist de tokens revocados en Redis (futuro)

### Contraseñas
- Hash con **bcrypt** (12 salt rounds)
- Requisitos mínimos:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
- Verificación en registro y cambio de contraseña

### Roles y Permisos
```typescript
enum UserRole {
  SUPER_ADMIN  // Acceso total al sistema
  ADMIN        // Gestión completa (productos, pedidos, clientes)
  WAREHOUSE    // Solo inventario y logística
  COMMERCIAL   // Solo clientes y pedidos (lectura)
  CLIENT       // Usuario estándar
}
```

**Matriz de permisos:**
| Acción | CLIENT | COMMERCIAL | WAREHOUSE | ADMIN | SUPER_ADMIN |
|--------|--------|------------|-----------|-------|-------------|
| Ver catálogo | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear pedido | ✅ | ✅ | ❌ | ✅ | ✅ |
| Ver sus pedidos | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver todos los pedidos | ❌ | ✅ | ✅ | ✅ | ✅ |
| Editar pedidos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestionar productos | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ❌ | ✅ |
| Ver reportes | ❌ | ✅ | ❌ | ✅ | ✅ |

## Validación de Entrada

### Frontend (React)
- **React Hook Form** + **Zod** para validación de formularios
- Sanitización de entrada antes de envío
- Validación en tiempo real con feedback visual

### Backend (Express)
- **Zod schemas** para validación de body/params/query
- Middleware de validación en cada ruta
- Sanitización con express-validator
- Rechazo de payloads > 10MB

### Ejemplo de Schema Zod compartido:
```typescript
// shared/schemas/order.schema.ts
export const CreateOrderSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  eventType: z.string().min(1),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1)
});
```

## Protección de API

### Rate Limiting
- **Por IP:** 100 requests/15min para endpoints públicos
- **Por usuario autenticado:** 1000 requests/hora
- **API Keys:** Configurable por cliente
- Límites más estrictos en endpoints sensibles:
  - Login: 5 intentos/15min
  - Register: 3 intentos/hora

### CORS (Cross-Origin Resource Sharing)
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Helmet.js
Headers de seguridad configurados:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### API Keys (Para API Pública)
- Generación criptográfica segura
- Hash del secret con bcrypt
- Rotación periódica recomendada
- Revocación inmediata si compromiso
- Logs de uso por API Key

## Protección de Datos

### Variables de Entorno
- **Nunca** commitear archivos .env
- Usar .env.example como plantilla
- Secretos en producción via AWS Secrets Manager o similar
- Rotación de secretos cada 90 días

### Datos Sensibles en Base de Datos
- Contraseñas: **siempre hasheadas**, nunca plain text
- Información de pago: No almacenar CVV, tokenizar tarjetas
- Datos personales: Cumplimiento RGPD
- Backups encriptados

### HTTPS
- Certificados SSL/TLS en producción
- Forzar HTTPS en producción
- HSTS (HTTP Strict Transport Security)

## Prevención de Vulnerabilidades

### SQL Injection
- **Prisma ORM** previene automáticamente
- Queries parametrizadas siempre
- No concatenar strings SQL

### XSS (Cross-Site Scripting)
- React escapa por defecto
- Evitar dangerouslySetInnerHTML
- Sanitizar HTML si es necesario (DOMPurify)
- CSP headers configurados

### CSRF (Cross-Site Request Forgery)
- SameSite cookies
- CSRF tokens en formularios sensibles
- Verificación de origin header

### Inyección de Comandos
- No usar exec/spawn con input de usuario
- Validar estrictamente nombres de archivo en uploads

## Upload de Archivos

### Imágenes de Productos
- Tipos permitidos: jpg, jpeg, png, webp
- Tamaño máximo: 5MB por imagen
- Validación de MIME type real (no solo extensión)
- Renombrado automático con UUID
- Almacenamiento en carpeta aislada
- Servir con headers correctos

### PDFs (Facturas)
- Generación server-side (no upload de usuario)
- Almacenamiento en directorio privado
- Acceso solo con autenticación y autorización

## Auditoría y Logging

### AuditLog Model
Registrar acciones sensibles:
- Creación/edición/eliminación de productos
- Cambios de estado de pedidos
- Modificación de precios
- Gestión de usuarios
- Accesos a facturas

### Winston Logger
Niveles:
- **error:** Errores del sistema
- **warn:** Advertencias (ej: rate limit alcanzado)
- **info:** Eventos importantes (login, pedido creado)
- **debug:** Desarrollo

Rotación de logs:
- Archivos diarios
- Retención: 30 días
- Logs críticos a servicio externo (futuro)

### No Loggear
- Contraseñas
- Tokens completos (solo últimos 4 caracteres)
- Datos de tarjetas de crédito
- Secretos

## Gestión de Sesiones

### Logout
- Invalidar access token
- Revocar refresh token
- Limpiar cookies
- Añadir a blacklist (con Redis en futuro)

### Timeout de Sesión
- Access token expira en 15 min
- Auto-refresh si usuario activo
- Logout automático tras 7 días de inactividad

## Monitorización de Seguridad

### Alertas Automáticas
- Múltiples intentos de login fallidos
- Acceso a recursos no autorizados
- Cambios de configuración crítica
- Errores 500 en endpoints sensibles

### Revisión Periódica
- Auditoría de usuarios con privilegios
- Revisión de API keys activas
- Análisis de logs de seguridad
- Actualización de dependencias

## Dependencias y Actualizaciones

### npm audit
- Ejecutar semanalmente: `npm audit`
- Actualizar dependencias con vulnerabilidades
- CI/CD falla si audit encuentra critical/high

### Dependabot (GitHub)
- Configurar alertas automáticas
- PRs automáticos para security updates

## Cumplimiento Legal

### RGPD (Reglamento General de Protección de Datos)
- Consentimiento explícito para uso de datos
- Derecho al olvido: endpoint DELETE /users/:id/data
- Exportación de datos: endpoint GET /users/:id/export
- Política de privacidad visible
- Cookie consent banner

### Facturas
- Cumplimiento normativa española
- Numeración secuencial sin gaps
- Retención obligatoria: mínimo 4 años

## Backup y Recuperación

### Base de Datos
- Backup diario automático
- Retención: 30 días
- Backups encriptados
- Test de restauración mensual

### Disaster Recovery
- Procedimiento documentado
- RTO (Recovery Time Objective): < 4 horas
- RPO (Recovery Point Objective): < 24 horas

## Checklist Pre-Producción

- [ ] Variables de entorno configuradas (sin valores default)
- [ ] HTTPS configurado y forzado
- [ ] Rate limiting activado
- [ ] Helmet.js configurado
- [ ] Logs en modo production (no debug)
- [ ] Backups automáticos configurados
- [ ] Monitorización activa
- [ ] Secrets rotados desde valores de desarrollo
- [ ] npm audit sin vulnerabilidades high/critical
- [ ] CORS configurado correctamente
- [ ] CSP headers definidos
- [ ] Error messages no revelan información sensible
- [ ] Swagger/docs no expuestos en producción
