# Dockerfile para Railway - Sin Chromium
FROM node:18-slim

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Compilar TypeScript usando script personalizado
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
