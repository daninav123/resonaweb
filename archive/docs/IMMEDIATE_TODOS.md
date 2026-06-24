# 🚨 TAREAS INMEDIATAS - RESONA PROJECT

**Prioridad**: CRÍTICA para lanzamiento  
**Tiempo estimado total**: 40 horas

---

## 🔴 CRÍTICO (Bloqueantes para Producción)

### 1. ❌ **Emails NO funcionan** (2 horas)
```bash
# PROBLEMA: No se envían emails de confirmación
# SOLUCIÓN: Configurar SendGrid

1. Crear cuenta en https://sendgrid.com
2. Obtener API Key
3. Actualizar backend/.env:
   SENDGRID_API_KEY=SG.tu-api-key-aqui
4. Reiniciar backend
```

### 2. ❌ **Imágenes rotas** (1 hora)
```bash
# PROBLEMA: Imágenes de productos no cargan
# SOLUCIÓN: Configurar Cloudinary

1. Crear cuenta en https://cloudinary.com
2. Obtener credenciales
3. Actualizar backend/.env:
   CLOUDINARY_URL=cloudinary://key:secret@cloud-name
4. Subir imágenes de productos
```

### 3. ❌ **Páginas Legales** (4 horas)
```bash
# PROBLEMA: No hay términos ni privacidad (OBLIGATORIO por ley)
# ARCHIVOS A CREAR:
- src/pages/legal/TermsPage.tsx
- src/pages/legal/PrivacyPage.tsx
- src/pages/legal/CookiesPage.tsx
- Añadir links en footer
```

---

## 🟡 IMPORTANTE (Para MVP completo)

### 4. ⚠️ **Sistema de Reviews** (8 horas)
```typescript
// El modelo existe pero falta:
- [ ] Componente ReviewForm.tsx
- [ ] Mostrar reviews en ProductDetailPage
- [ ] Endpoint POST /products/:id/reviews
- [ ] Validación: solo clientes que compraron
```

### 5. ⚠️ **Gestión de Stock en Admin** (6 horas)
```typescript
// Falta UI para:
- [ ] Ver stock actual por producto
- [ ] Ajustar stock manualmente
- [ ] Histórico de movimientos
- [ ] Alertas de stock bajo
```

### 6. ⚠️ **Notificaciones al Usuario** (4 horas)
```typescript
// Sistema existe pero no se muestra:
- [ ] Componente NotificationBell en header
- [ ] Lista de notificaciones
- [ ] Marcar como leídas
- [ ] Badge con contador
```

---

## 🟢 NICE TO HAVE (Post-lanzamiento)

### 7. 💡 **Sistema de Cupones** (12 horas)
```typescript
// Nuevo feature:
- [ ] Modelo Coupon en Prisma
- [ ] Admin: CRUD de cupones
- [ ] Aplicar en checkout
- [ ] Validaciones de uso
```

### 8. 💡 **Búsqueda y Filtros** (8 horas)
```typescript
// Mejorar catálogo:
- [ ] Búsqueda por texto
- [ ] Filtros por precio
- [ ] Filtros por disponibilidad
- [ ] Ordenar por: precio, nombre, popularidad
```

### 9. 💡 **Multi-idioma** (16 horas)
```typescript
// i18n setup:
- [ ] Instalar react-i18next
- [ ] Archivos de traducción (ES, EN, CAT)
- [ ] Selector de idioma
- [ ] Traducir todo el contenido
```

---

## 🐛 BUGS A CORREGIR

### Alta Prioridad
```javascript
1. ❌ Logs repetitivos en ProductsPage
   // Archivo: src/pages/ProductsPage.tsx
   // Línea: ~166
   // Eliminar: console.log('🏷️ Categoría en dropdown...')

2. ❌ Estados de pedido incorrectos en modal
   // Archivo: src/pages/admin/OrderDetailPage.tsx
   // Cambiar: IN_PREPARATION → PREPARING
   // Cambiar: IN_USE → IN_TRANSIT

3. ❌ Webhook de Stripe sin secret
   // Archivo: backend/.env
   // Añadir: STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Media Prioridad
```javascript
4. ⚠️ TypeScript 'any' types
   // ~200+ usos de 'any'
   // Gradualmente reemplazar con tipos correctos

5. ⚠️ useEffect dependencies
   // Varios warnings en consola
   // Revisar y corregir dependencias
```

---

## 📝 CHECKLIST RÁPIDO PRE-LANZAMIENTO

### Configuración
- [ ] SendGrid API key configurada
- [ ] Cloudinary configurado
- [ ] Stripe en modo producción
- [ ] Variables .env de producción
- [ ] CORS configurado para dominio real

### Legal
- [ ] Términos y Condiciones
- [ ] Política de Privacidad
- [ ] Política de Cookies
- [ ] Aviso Legal
- [ ] RGPD compliance

### SEO
- [ ] Google Analytics instalado
- [ ] Meta tags en todas las páginas
- [ ] Sitemap.xml generado
- [ ] Robots.txt configurado
- [ ] Schema.org en productos

### Testing
- [ ] Flujo completo de compra
- [ ] Registro/Login funcionando
- [ ] Pagos con Stripe (modo test)
- [ ] Emails llegando
- [ ] Admin panel completo

### Seguridad
- [ ] HTTPS configurado
- [ ] Headers de seguridad
- [ ] Rate limiting activo
- [ ] Backup de BD configurado
- [ ] Monitoring activo

---

## 🎯 ORDEN DE EJECUCIÓN SUGERIDO

### Día 1 (8h)
1. ✅ Configurar SendGrid (2h)
2. ✅ Configurar Cloudinary (1h)
3. ✅ Crear páginas legales (4h)
4. ✅ Fix bugs críticos (1h)

### Día 2 (8h)
5. ✅ Sistema de reviews (8h)

### Día 3 (8h)
6. ✅ Gestión de stock (6h)
7. ✅ Notificaciones (2h)

### Día 4 (8h)
8. ✅ Testing completo (4h)
9. ✅ Configuración producción (2h)
10. ✅ Deploy (2h)

### Post-lanzamiento
- Sistema de cupones
- Búsqueda avanzada
- Multi-idioma
- Chat support
- PWA features

---

## 💰 ESTIMACIÓN DE COSTOS (Mensual)

### Servicios Necesarios
```
SendGrid Essentials: $19.95/mes (40k emails)
Cloudinary Free: $0 (25GB storage)
Stripe: 2.9% + 30¢ por transacción
PostgreSQL (Supabase): $25/mes
Hosting (Vercel): $20/mes
Dominio: $12/año

TOTAL: ~$65/mes + fees de Stripe
```

---

## 🚀 COMANDO PARA VERIFICAR ESTADO

```bash
# Verificar que todo funciona:
cd packages/backend
npm run dev

# En otra terminal:
cd packages/frontend
npm run dev

# Verificar:
- [ ] Backend en http://localhost:3001/health
- [ ] Frontend en http://localhost:3000
- [ ] Login funciona
- [ ] Productos cargan
- [ ] Checkout completo
```

---

**⚠️ IMPORTANTE**: El proyecto está al 85% pero **NO está listo para producción** sin:
1. Configurar emails (SendGrid)
2. Páginas legales
3. Imágenes funcionando (Cloudinary)

**Con estos 3 puntos resueltos, puede lanzarse como MVP.**

---

_Última actualización: 18/11/2025 05:35 AM_
