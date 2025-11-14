# 🗺️ Roadmap de Desarrollo - ReSona

## Fase 1: MVP - Fundamentos (Semanas 1-2)

### Setup Inicial
- ✅ Estructura monorepo con npm workspaces
- ✅ TypeScript en frontend y backend
- ✅ PostgreSQL + Prisma ORM
- ✅ Docker Compose para desarrollo
- ✅ Variables de entorno configuradas

### Autenticación y Usuarios
- [ ] Schema de User en Prisma
- [ ] Endpoints: register, login, refresh token
- [ ] Middleware JWT con roles
- [ ] Páginas de login/registro en React
- [ ] Protected routes
- [ ] Store de autenticación (Zustand)

### Gestión de Productos - Admin
- [ ] Schema: Product, Category, ProductImage
- [ ] CRUD completo de productos (API)
- [ ] CRUD de categorías (API)
- [ ] Panel admin: Lista de productos
- [ ] Panel admin: Crear/editar producto
- [ ] Upload de imágenes
- [ ] Gestión de stock

## Fase 2: Core Features (Semanas 3-4)

### Catálogo Público
- [ ] Endpoint: GET /products con filtros
- [ ] Página de catálogo con filtros
- [ ] Página de detalle de producto
- [ ] Sistema de búsqueda
- [ ] Paginación

### Sistema de Pedidos - Básico
- [ ] Schema: Order, OrderItem
- [ ] Carrito en frontend (Zustand)
- [ ] Sistema de disponibilidad básico
- [ ] Checkout (3 pasos)
- [ ] Endpoint: POST /orders
- [ ] Cálculo de precios automático
- [ ] Emails de confirmación

### Panel Admin - Pedidos
- [ ] Lista de pedidos
- [ ] Detalle de pedido
- [ ] Cambio de estados
- [ ] Filtros y búsqueda

## Fase 3: Facturación y Logística (Semanas 5-6)

### Facturación Automática
- [ ] Schema: Invoice, Payment
- [ ] Generación automática al confirmar
- [ ] Templates con Handlebars
- [ ] Generación PDF con Puppeteer
- [ ] Descarga de facturas
- [ ] Envío por email

### Gestión de Logística
- [ ] Selector de entrega (recogida/transporte)
- [ ] Cálculo de distancia (Google Maps API)
- [ ] Cálculo de coste de transporte
- [ ] Calendario de eventos (admin)
- [ ] Asignación de recursos

### Gestión de Clientes (CRM Básico)
- [ ] Lista de clientes en admin
- [ ] Perfil de cliente con historial
- [ ] Notas internas

## Fase 4: API Pública (Semana 7)

### API REST Pública
- [ ] Schema: ApiKey
- [ ] Sistema de autenticación con API Keys
- [ ] Rate limiting configurable
- [ ] Documentación con Swagger
- [ ] Endpoints públicos documentados
- [ ] Sandbox para testing

## Fase 5: Mejoras UX/UI (Semana 8)

### Dashboard Admin
- [ ] KPIs en tiempo real
- [ ] Gráficos con Recharts
- [ ] Alertas y notificaciones

### Mejoras Cliente
- [ ] Sistema de favoritos
- [ ] Historial de pedidos mejorado
- [ ] Perfil de usuario editable

### Optimizaciones
- [ ] Loading states
- [ ] Error boundaries
- [ ] SEO básico
- [ ] Responsive optimizado

## Fase 6: Features Avanzadas (Semanas 9-10)

### Packs y Combos
- [ ] Schema: Pack, PackProduct
- [ ] CRUD de packs (admin)
- [ ] Visualización de packs
- [ ] Descuentos automáticos

### Sistema de Valoraciones
- [ ] Schema: Review
- [ ] Valoraciones de productos
- [ ] Moderación (admin)
- [ ] Display en producto

### Notificaciones
- [ ] Templates de email personalizables
- [ ] Recordatorios automáticos
- [ ] Sistema de notificaciones interno

## Fase 7: Testing y Deploy (Semanas 11-12)

### Testing
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (Supertest)
- [ ] Tests E2E (Playwright - opcional)
- [ ] Coverage > 70%

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Lint automático
- [ ] Tests en cada PR
- [ ] Build verification

### Monitorización
- [ ] Prometheus configurado
- [ ] Grafana dashboards
- [ ] Logs con Winston
- [ ] Health checks

### Deployment
- [ ] Docker images optimizadas
- [ ] Deploy a staging
- [ ] Deploy a producción
- [ ] Backup automático de BD

## Backlog Futuro (Post-MVP)

### Integraciones
- [ ] Pasarela de pago (Stripe/PayPal)
- [ ] Google Calendar sync
- [ ] Chatbot de soporte

### Multi-almacén
- [ ] Gestión de múltiples ubicaciones
- [ ] Transfer entre almacenes
- [ ] Asignación automática por proximidad

### App Móvil
- [ ] React Native app
- [ ] Push notifications
- [ ] Tracking GPS en tiempo real

### Inteligencia
- [ ] Recomendaciones con IA
- [ ] Predicción de demanda
- [ ] Optimización de rutas
