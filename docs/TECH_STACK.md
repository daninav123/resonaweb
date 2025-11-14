# 🛠️ Stack Tecnológico Detallado - ReSona

## Frontend

### Core
- **React 18.2** - UI Library con Concurrent Mode
- **TypeScript 5.0** - Tipado estático
- **Vite 4.x** - Build tool rápido
- **React Router v6** - Routing SPA

### Estado y Data Fetching
- **Zustand** - State management ligero
- **React Query (TanStack Query)** - Data fetching, caching, sincronización
- **Axios** - HTTP client

### UI y Estilos
- **Tailwind CSS 3.x** - Utility-first CSS
- **shadcn/ui** - Componentes base (Button, Dialog, Select, etc.)
- **Lucide React** - Iconos modernos
- **Framer Motion** - Animaciones
- **React Hot Toast** - Notificaciones

### Formularios y Validación
- **React Hook Form** - Gestión de formularios
- **Zod** - Schema validation (compartido con backend)

### Fechas y Calendarios
- **date-fns** - Manipulación de fechas
- **React Day Picker** - Selector de fechas

### Mapas
- **@react-google-maps/api** - Integración Google Maps

### Otros
- **React Helmet Async** - SEO meta tags
- **React Dropzone** - Upload de archivos
- **Recharts** - Gráficos para admin dashboard

## Backend

### Core
- **Node.js 18 LTS** - Runtime
- **Express 4.x** - Web framework
- **TypeScript 5.0** - Tipado estático

### Base de Datos
- **PostgreSQL 15** - Base de datos relacional
- **Prisma 5.x** - ORM moderno
  - Type-safe queries
  - Migrations automáticas
  - Prisma Studio para debugging

### Autenticación
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Hash de contraseñas
- **express-rate-limit** - Rate limiting

### Validación
- **Zod** - Schema validation (compartido con frontend)
- **express-validator** - Middleware de validación adicional

### Documentación API
- **Swagger UI Express** - Interfaz interactiva
- **swagger-jsdoc** - Generación desde JSDoc

### Logging
- **Winston** - Logger flexible
- **Morgan** - HTTP request logger

### Generación de PDFs
- **Puppeteer** - Generación de facturas en PDF
- **Handlebars** - Templates para facturas

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de endpoints HTTP
- **ts-jest** - Jest para TypeScript

### Utilidades
- **dotenv** - Variables de entorno
- **cors** - CORS middleware
- **helmet** - Security headers
- **compression** - Gzip compression
- **express-async-errors** - Error handling async

## DevOps e Infraestructura

### Containerización
```yaml
# docker-compose.yml incluye:
- Frontend (Nginx)
- Backend (Node)
- PostgreSQL
- Prometheus
- Grafana
```

### CI/CD
- **GitHub Actions**
  - Lint y tests automáticos
  - Build en cada PR
  - Deploy automático a producción

### Monitorización
- **Prometheus** - Métricas del sistema
- **Grafana** - Dashboards visuales
- **Winston** → logs a archivo rotativo

### Control de Versiones
- **Git** con GitFlow
- **Husky** - Git hooks
- **Commitlint** - Conventional commits

## Estructura del Proyecto

```
windsurf-project-3/
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn components
│   │   │   │   ├── layout/     # Header, Footer, Sidebar
│   │   │   │   ├── products/   # ProductCard, ProductList
│   │   │   │   ├── orders/     # OrderCard, OrderTimeline
│   │   │   │   └── admin/      # AdminTable, Dashboard
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   ├── Checkout.tsx
│   │   │   │   ├── MyOrders.tsx
│   │   │   │   └── admin/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useProducts.ts
│   │   │   │   └── useOrders.ts
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts
│   │   │   │   └── cartStore.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── validation.ts
│   │   │   │   └── formatters.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── products.routes.ts
│       │   │   ├── orders.routes.ts
│       │   │   └── index.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── products.controller.ts
│       │   │   └── orders.controller.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── products.service.ts
│       │   │   ├── orders.service.ts
│       │   │   ├── invoice.service.ts
│       │   │   └── email.service.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   ├── errorHandler.ts
│       │   │   └── rateLimiter.ts
│       │   ├── utils/
│       │   │   ├── jwt.ts
│       │   │   ├── logger.ts
│       │   │   └── pdf-generator.ts
│       │   ├── types/
│       │   │   └── index.ts
│       │   ├── config/
│       │   │   ├── database.ts
│       │   │   └── swagger.ts
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── tests/
│       │   ├── auth.test.ts
│       │   └── orders.test.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docs/
├── scripts/
│   ├── runTask.js
│   └── seed-dev-data.js
├── logs/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Variables de Entorno

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/resona_db

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (ejemplo con SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@resona.com

# API Keys
OPENAI_API_KEY=${OPENAI_API_KEY}

# External Services
GOOGLE_MAPS_API_KEY=your_key_here
STRIPE_SECRET_KEY=your_stripe_key (futuro)

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3002
```

## Scripts NPM

### Root package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:frontend": "npm run dev --workspace=frontend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "db:migrate": "npm run db:migrate --workspace=backend",
    "db:seed": "npm run db:seed --workspace=backend",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  }
}
```

## Dependencias Clave

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.5.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.22.0",
    "winston": "^3.11.0",
    "swagger-ui-express": "^5.0.0",
    "cors": "^2.8.0",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.0",
    "puppeteer": "^21.5.0",
    "handlebars": "^4.7.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.10.0",
    "typescript": "^5.0.0",
    "prisma": "^5.7.0",
    "ts-node": "^10.9.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.0",
    "ts-jest": "^29.1.0"
  }
}
```

## Consideraciones de Rendimiento

- **Code splitting** en frontend (React.lazy)
- **Image optimization** (WebP, lazy loading)
- **Database indexes** en campos frecuentemente consultados
- **Caching** con React Query (5 min para productos)
- **Connection pooling** en Prisma
- **Compression** de respuestas HTTP
- **CDN** para assets estáticos (futuro)
