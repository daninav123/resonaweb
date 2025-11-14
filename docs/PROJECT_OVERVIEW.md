# ReSona - Plataforma de Gestión de Eventos

## 📋 Resumen Ejecutivo

ReSona es una plataforma web integral para la gestión de eventos que combina:
- **Montaje de eventos** - Servicios completos de producción
- **Alquiler de material** - Gestión de inventario y reservas

## 🎯 Objetivos del Proyecto

1. **Digitalizar** la gestión de pedidos y alquileres
2. **Automatizar** procesos de facturación y logística
3. **Centralizar** la información de clientes y productos
4. **Integrar** con aplicaciones externas mediante API pública
5. **Optimizar** la experiencia del cliente y administración

## 👥 Usuarios del Sistema

### Cliente Final
- Explora catálogo de productos/servicios
- Crea y gestiona pedidos de alquiler
- Selecciona opciones de entrega (recogida/transporte)
- Descarga facturas automáticas
- Consulta historial de pedidos

### Administrador
- Gestiona inventario completo
- Supervisa todos los pedidos (estados, fechas, logística)
- Gestiona clientes y sus datos
- Configura precios y disponibilidad
- Genera reportes y estadísticas
- Gestiona usuarios del sistema

### Sistema Externo (API)
- Consulta disponibilidad de productos
- Crea pedidos programáticamente
- Sincroniza estados de pedidos
- Obtiene información de facturación

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Propuesto

#### Frontend
- **Framework:** React 18 + TypeScript
- **Routing:** React Router v6
- **Estado Global:** Zustand
- **UI Components:** shadcn/ui + Tailwind CSS
- **Iconos:** Lucide React
- **Formularios:** React Hook Form + Zod
- **Peticiones HTTP:** Axios
- **Fechas:** date-fns

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Documentación API:** Swagger/OpenAPI 3.0
- **Testing:** Jest + Supertest

#### Infraestructura
- **Monorepo:** npm workspaces
- **Control de versiones:** Git
- **CI/CD:** GitHub Actions
- **Containerización:** Docker + Docker Compose
- **Monitorización:** Prometheus + Grafana

### Estructura de Directorios

```
windsurf-project-3/
├── packages/
│   ├── frontend/          # Aplicación React
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── backend/           # API Express
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── models/
│       │   └── utils/
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── docs/                  # Documentación
├── scripts/              # Scripts de automatización
├── logs/                 # Logs del sistema
├── .github/              # GitHub Actions
├── docker-compose.yml
├── .env.example
├── package.json          # Root package
└── README.md
```

## 🔒 Seguridad

- Autenticación JWT con refresh tokens
- Hash de contraseñas con bcrypt (salt rounds: 12)
- Validación de entrada en cliente y servidor
- Rate limiting en API pública
- CORS configurado
- Variables de entorno para credenciales
- Logs de auditoría para acciones sensibles

## 🚀 Puertos y Configuración

- **Frontend:** Puerto 3000
- **Backend:** Puerto 3001
- **PostgreSQL:** Puerto 5432
- **Prometheus:** Puerto 9090
- **Grafana:** Puerto 3002

## 📊 Métricas y Monitorización

- Disponibilidad de endpoints (/health)
- Latencia de peticiones
- Tasa de errores (4xx, 5xx)
- Uso de recursos (CPU, memoria, disco)
- Pedidos por día/semana/mes
- Productos más alquilados
- Ingresos generados
