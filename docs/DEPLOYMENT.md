# 🚀 Guía de Despliegue - ReSona

## Entornos

### Desarrollo (Local)
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Base de datos: resona_dev

### Staging (Pre-producción)
- URL: https://staging.resona.com
- Base de datos: resona_staging
- Datos de prueba cargados
- Mismo setup que producción

### Producción
- URL: https://resona.com
- API: https://api.resona.com
- Base de datos: resona_prod
- Backups automáticos
- Monitorización 24/7

## Requisitos del Sistema

### Servidor
- **OS:** Ubuntu 22.04 LTS o superior
- **CPU:** 2 cores mínimo (4 recomendado)
- **RAM:** 4GB mínimo (8GB recomendado)
- **Disco:** 50GB mínimo (SSD recomendado)
- **Node.js:** v18 LTS
- **PostgreSQL:** v15
- **Docker:** v24+ (opcional pero recomendado)

### Dominios
- resona.com → Frontend
- api.resona.com → Backend API
- admin.resona.com → Panel Admin (opcional, puede ser ruta)

## Preparación de Producción

### 1. Clonar Repositorio
```bash
git clone https://github.com/Daniel-Navarro-Campos/mywed360.git
cd mywed360
```

### 2. Variables de Entorno

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:secure_password@localhost:5432/resona_prod?schema=public

# JWT
JWT_SECRET=<generar-con-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generar-con-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://resona.com

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@resona.com

# Google Maps
GOOGLE_MAPS_API_KEY=<your-key>

# Logs
LOG_LEVEL=info
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.resona.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=<your-key>
```

### 3. Base de Datos

```bash
# Crear base de datos
sudo -u postgres psql
CREATE DATABASE resona_prod;
CREATE USER resona_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE resona_prod TO resona_user;
\q

# Ejecutar migraciones
cd packages/backend
npx prisma migrate deploy

# Seed inicial (categorías, usuario admin, etc.)
npm run db:seed:prod
```

### 4. Instalación de Dependencias

```bash
# En la raíz del proyecto
npm ci --production

# Si usas workspaces
npm ci --workspaces --production
```

### 5. Build

```bash
# Frontend
cd packages/frontend
npm run build
# Genera dist/ con archivos estáticos

# Backend
cd packages/backend
npm run build
# Genera dist/ con JS compilado
```

## Despliegue con Docker (Recomendado)

### Dockerfile - Backend
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
RUN npm ci --workspace=backend
COPY packages/backend ./packages/backend
RUN npm run build --workspace=backend

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/node_modules ./node_modules
COPY --from=builder /app/packages/backend/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### Dockerfile - Frontend
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm ci --workspace=frontend
COPY packages/frontend ./packages/frontend
RUN npm run build --workspace=frontend

FROM nginx:alpine
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.production.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: resona_prod
      POSTGRES_USER: resona_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://resona_user:${DB_PASSWORD}@postgres:5432/resona_prod
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: packages/frontend/Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
  prometheus_data:
  grafana_data:
```

### Ejecutar con Docker
```bash
# Build
docker-compose -f docker-compose.production.yml build

# Up
docker-compose -f docker-compose.production.yml up -d

# Logs
docker-compose -f docker-compose.production.yml logs -f

# Stop
docker-compose -f docker-compose.production.yml down
```

## Despliegue Tradicional (PM2)

### Instalar PM2
```bash
npm install -g pm2
```

### ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'resona-backend',
      cwd: './packages/backend',
      script: 'dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### Ejecutar con PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Nginx como Reverse Proxy

### /etc/nginx/sites-available/resona
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name resona.com www.resona.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name resona.com www.resona.com;

    ssl_certificate /etc/letsencrypt/live/resona.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/resona.com/privkey.pem;

    root /var/www/resona/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.resona.com;

    ssl_certificate /etc/letsencrypt/live/api.resona.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.resona.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Activar y Recargar
```bash
sudo ln -s /etc/nginx/sites-available/resona /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/TLS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d resona.com -d www.resona.com
sudo certbot --nginx -d api.resona.com

# Auto-renovación
sudo certbot renew --dry-run
```

## Backups Automáticos

### Script de Backup (/scripts/backup-db.sh)
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="resona_backup_$DATE.sql"

# Crear backup
pg_dump -U resona_user resona_prod > $BACKUP_DIR/$FILENAME

# Comprimir
gzip $BACKUP_DIR/$FILENAME

# Eliminar backups antiguos (>30 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completado: $FILENAME.gz"
```

### Cron Job
```bash
# Ejecutar diariamente a las 3:00 AM
0 3 * * * /path/to/scripts/backup-db.sh >> /var/log/resona-backup.log 2>&1
```

## Monitorización

### Health Checks
```bash
# Backend health endpoint
curl https://api.resona.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-10T...","uptime":12345}
```

### Configurar Alertas
Ver configuración en `docs/MONITORING.md`

## CI/CD con GitHub Actions

### .github/workflows/deploy-production.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build --workspaces
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/resona
            git pull origin main
            npm ci --production
            npm run build --workspaces
            pm2 reload ecosystem.config.js
```

## Rollback

### Con Docker
```bash
# Ver imágenes disponibles
docker images

# Rollback a versión anterior
docker-compose down
docker-compose up -d <image-id-anterior>
```

### Con PM2
```bash
# Si guardaste versiones anteriores
cd /var/www/resona-backup-previous
pm2 delete resona-backend
pm2 start ecosystem.config.js
```

## Verificación Post-Despliegue

- [ ] Frontend accesible en https://resona.com
- [ ] API responde en https://api.resona.com/health
- [ ] Login funciona correctamente
- [ ] Crear pedido de prueba funciona
- [ ] Emails se envían correctamente
- [ ] SSL válido y activo
- [ ] Logs no muestran errores críticos
- [ ] Monitorización reportando correctamente
- [ ] Backup automático configurado
