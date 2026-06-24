# 📋 PLAN DE MEJORAS COMPLETO - ReSona Events

_Fecha: 19/11/2025 02:35_

---

## 🎯 OBJETIVOS GENERALES

1. ✅ Diseño responsive optimizado (móvil + escritorio)
2. 🔄 Perfil: Datos de facturación
3. 🔄 Panel admin: Facturas manuales (Facturae)
4. 🔄 Imágenes para categorías
5. 🔄 Actualizar datos de empresa
6. 🔄 Eliminar iconos redes sociales
7. 🔄 Corregir acentos/mojibakes
8. 🔄 Panel admin: Navegación mejorada
9. 🔄 Edición/cancelación de pedidos
10. 🔄 VIP: Pago diferido y bloqueo
11. 🔄 Reorganizar SKU

---

## 📱 FASE 1: DISEÑO RESPONSIVE

### **Objetivo:** Adaptar toda la aplicación para móvil y tablet

### **Tareas:**

#### **1.1 Header/Navbar** (30 min)
- [ ] Hamburger menu para móvil
- [ ] Logo adaptativo
- [ ] Menú desplegable en móvil
- [ ] Carrito accesible en móvil
- [ ] Breakpoints: < 768px (móvil), 768-1024px (tablet), > 1024px (desktop)

**Archivos:**
- `components/Layout/Header.tsx`

#### **1.2 HomePage** (20 min)
- [ ] Hero section responsive
- [ ] Grid de productos: 1 col (móvil), 2 col (tablet), 4 col (desktop)
- [ ] Imágenes optimizadas
- [ ] Texto legible en móvil

**Archivos:**
- `pages/HomePage.tsx`

#### **1.3 ProductsPage** (20 min)
- [ ] Filtros en drawer lateral (móvil)
- [ ] Grid adaptativo
- [ ] Cards de productos responsive

**Archivos:**
- `pages/ProductsPage.tsx`
- `components/search/FilterPanel.tsx`

#### **1.4 ProductDetailPage** (15 min)
- [ ] Imágenes stack vertical en móvil
- [ ] Botones full-width en móvil
- [ ] Cantidad y selección adaptada

**Archivos:**
- `pages/ProductDetailPage.tsx`

#### **1.5 CheckoutPage** (25 min)
- [ ] Formulario 1 columna en móvil
- [ ] Resumen sticky en desktop
- [ ] Botones full-width en móvil

**Archivos:**
- `pages/CheckoutPage.tsx`

#### **1.6 Panel Admin** (30 min)
- [ ] Sidebar colapsable en móvil
- [ ] Tablas con scroll horizontal
- [ ] Modales full-screen en móvil

**Archivos:**
- `components/AdminLayout.tsx`
- `pages/admin/*.tsx`

**Tiempo Fase 1:** ~2.5 horas

---

## 👤 FASE 2: PERFIL Y DATOS DE FACTURACIÓN

### **Objetivo:** Eliminar campos innecesarios y añadir datos de facturación

### **Tareas:**

#### **2.1 Modelo de Base de Datos** (15 min)
- [ ] Crear modelo `BillingData`
- [ ] Campos:
  - `userId` (FK)
  - `companyName` (opcional)
  - `taxId` (NIF/CIF)
  - `address`
  - `city`
  - `postalCode`
  - `province`
  - `country` (default: España)
- [ ] Migración

**Archivos:**
- `packages/backend/prisma/schema.prisma`
- Nueva migración

#### **2.2 Backend API** (20 min)
- [ ] GET `/api/v1/users/:id/billing`
- [ ] PUT `/api/v1/users/:id/billing`
- [ ] Validación con Zod

**Archivos:**
- `packages/backend/src/routes/users.routes.ts`
- `packages/backend/src/controllers/user.controller.ts`
- `packages/backend/src/services/user.service.ts`

#### **2.3 Frontend - AccountPage** (30 min)
- [ ] Eliminar campo fecha de nacimiento
- [ ] Eliminar sección dirección principal
- [ ] Nueva tab "Datos de Facturación"
- [ ] Formulario con validación:
  - Nombre fiscal / Razón social
  - NIF/CIF
  - Dirección fiscal
  - Ciudad
  - Código postal
  - Provincia
  - País
- [ ] Botón guardar/editar

**Archivos:**
- `packages/frontend/src/pages/AccountPage.tsx`

#### **2.4 Integración con Pedidos** (15 min)
- [ ] Al crear pedido, incluir datos de facturación
- [ ] Mostrar en detalle de pedido

**Archivos:**
- `packages/backend/src/services/order.service.ts`

**Tiempo Fase 2:** ~1.5 horas

---

## 🧾 FASE 3: FACTURAS MANUALES CON FACTURAE

### **Objetivo:** Sistema de facturación manual desde admin con formato Facturae

### **Tareas:**

#### **3.1 Modelo de Base de Datos** (20 min)
- [ ] Modelo `Invoice`:
  - `invoiceNumber` (secuencial)
  - `orderId` (opcional, puede ser null)
  - `userId` (opcional)
  - `date`
  - `dueDate`
  - `subtotal`
  - `tax`
  - `total`
  - `status` (PAID, PENDING, CANCELLED)
  - `billingData` (JSON)
  - `items` (JSON array)
  - `notes`
  - `facturaeXML` (text, opcional)
- [ ] Migración

**Archivos:**
- `packages/backend/prisma/schema.prisma`

#### **3.2 Backend - Servicio Facturae** (60 min)
- [ ] Instalar librería: `facturae` o crear generador XML
- [ ] Servicio `invoice.service.ts`:
  - `generateInvoiceNumber()`
  - `createManualInvoice(data)`
  - `createInvoiceFromOrder(orderId)`
  - `generateFacturaeXML(invoice)`
  - `getNextInvoiceNumber()`
- [ ] Validación normativa española
- [ ] Generar XML Facturae 3.2.2

**Archivos:**
- `packages/backend/src/services/invoice.service.ts`
- `packages/backend/src/utils/facturae-generator.ts`

#### **3.3 Backend - API Facturas** (30 min)
- [ ] POST `/api/v1/invoices` - Crear factura manual
- [ ] GET `/api/v1/invoices` - Listar facturas
- [ ] GET `/api/v1/invoices/:id` - Ver factura
- [ ] GET `/api/v1/invoices/:id/xml` - Descargar XML
- [ ] GET `/api/v1/invoices/:id/pdf` - Descargar PDF
- [ ] PATCH `/api/v1/invoices/:id` - Actualizar

**Archivos:**
- `packages/backend/src/routes/invoice.routes.ts`
- `packages/backend/src/controllers/invoice.controller.ts`

#### **3.4 Frontend - Panel Admin Facturas** (45 min)
- [ ] Nueva página: `/admin/invoices`
- [ ] Botón "Nueva Factura Manual"
- [ ] Formulario:
  - Cliente (select o manual)
  - Items (lista editable)
  - Impuestos
  - Notas
- [ ] Lista de facturas con filtros
- [ ] Botones: Ver, Descargar XML, Descargar PDF
- [ ] Respetar numeración secuencial

**Archivos:**
- `packages/frontend/src/pages/admin/InvoicesManager.tsx`

#### **3.5 Integración Pedidos → Facturas** (20 min)
- [ ] Botón en detalle pedido: "Generar Factura"
- [ ] Auto-crear factura al completar pedido
- [ ] Link bidireccional pedido ↔ factura

**Archivos:**
- `packages/frontend/src/pages/admin/OrderDetailPage.tsx`

**Tiempo Fase 3:** ~3 horas

---

## 🖼️ FASE 4: IMÁGENES PARA CATEGORÍAS

### **Objetivo:** Añadir imagen a cada categoría

### **Tareas:**

#### **4.1 Base de Datos** (10 min)
- [ ] Añadir campo `imageUrl` a modelo `Category`
- [ ] Migración

**Archivos:**
- `packages/backend/prisma/schema.prisma`

#### **4.2 Backend** (10 min)
- [ ] Actualizar endpoints para incluir `imageUrl`
- [ ] Validación opcional

**Archivos:**
- `packages/backend/src/services/category.service.ts`

#### **4.3 Admin - Categorías** (20 min)
- [ ] Campo para subir imagen en formulario
- [ ] Preview de imagen
- [ ] Usar ImageUploader existente

**Archivos:**
- `packages/frontend/src/pages/admin/CategoriesManager.tsx`

#### **4.4 Frontend - Mostrar Imágenes** (15 min)
- [ ] HomePage: Mostrar imagen en card de categoría
- [ ] ProductsPage: Imagen en filtro de categorías
- [ ] CategorySidebar: Con imagen

**Archivos:**
- `packages/frontend/src/pages/HomePage.tsx`
- `packages/frontend/src/components/CategorySidebar.tsx`

**Tiempo Fase 4:** ~1 hora

---

## 🏢 FASE 5: ACTUALIZAR DATOS DE EMPRESA

### **Objetivo:** Dirección completa en todo el proyecto

### **Tareas:**

#### **5.1 Búsqueda Global** (10 min)
- [ ] Buscar todas las referencias a dirección antigua
- [ ] Listar archivos a modificar

#### **5.2 Actualización** (30 min)
- [ ] `utils/schemas.ts` - Schema JSON-LD
- [ ] `ContactPage.tsx` - Información de contacto
- [ ] `ServicesPage.tsx` - Footer
- [ ] `legal/*.tsx` - Políticas
- [ ] `Footer.tsx` - Pie de página
- [ ] Cualquier otro archivo

**Nueva Dirección:**
```
C/ de l'Illa Cabrera, 13
Quatre Carreres
46026 València, Valencia
España
```

**Archivos:**
- Múltiples archivos (buscar y reemplazar)

**Tiempo Fase 5:** ~40 minutos

---

## 🚫 FASE 6: ELIMINAR ICONOS REDES SOCIALES

### **Objetivo:** Quitar Facebook, Twitter, Instagram, YouTube

### **Tareas:**

#### **6.1 Footer** (10 min)
- [ ] Eliminar sección de redes sociales
- [ ] Mantener solo info de contacto

**Archivos:**
- `components/Layout/Footer.tsx`

#### **6.2 Otros Componentes** (10 min)
- [ ] Buscar referencias en todo el proyecto
- [ ] Eliminar imports de iconos

**Tiempo Fase 6:** ~20 minutos

---

## ✍️ FASE 7: CORREGIR ACENTOS Y MOJIBAKES

### **Objetivo:** Revisar encoding en todo el proyecto

### **Tareas:**

#### **7.1 Footer** (10 min)
- [ ] Revisar todos los textos
- [ ] Corregir "Términos", "Política", etc.

#### **7.2 Menú Desplegable Catálogo** (10 min)
- [ ] Revisar nombres de categorías
- [ ] Verificar encoding UTF-8

#### **7.3 Búsqueda Global** (20 min)
- [ ] Buscar caracteres raros: Ã, Â, etc.
- [ ] Corregir todos los casos

**Archivos:**
- `components/Layout/Footer.tsx`
- `components/Layout/Header.tsx`
- Otros componentes

**Tiempo Fase 7:** ~40 minutos

---

## 🔙 FASE 8: NAVEGACIÓN ADMIN

### **Objetivo:** Poder volver a la página principal desde admin

### **Tareas:**

#### **8.1 AdminLayout** (15 min)
- [ ] Añadir botón "Ver Sitio Web" en header
- [ ] Link a página principal
- [ ] Icono claro (External Link)

**Archivos:**
- `components/AdminLayout.tsx`

**Tiempo Fase 8:** ~15 minutos

---

## ✏️ FASE 9: EDICIÓN Y CANCELACIÓN DE PEDIDOS

### **Objetivo:** Permitir modificar/cancelar pedidos con reglas de negocio

### **Tareas:**

#### **9.1 Base de Datos** (15 min)
- [ ] Añadir campo `canBeModified` a Order
- [ ] Añadir campo `cancellationFee` a Order
- [ ] Añadir `orderHistory` (JSON) para trackear cambios

**Archivos:**
- `packages/backend/prisma/schema.prisma`

#### **9.2 Backend - Lógica de Negocio** (45 min)
- [ ] Servicio: `canModifyOrder(orderId)`:
  - Verificar si faltan > 24h para el evento
- [ ] Servicio: `canCancelOrder(orderId)`:
  - Verificar si faltan < 7 días
  - Calcular penalización (50% si < 7 días)
- [ ] Servicio: `modifyOrder(orderId, changes)`:
  - Añadir/eliminar productos
  - Recalcular totales
  - Aplicar descuento VIP
- [ ] Servicio: `cancelOrder(orderId)`:
  - Marcar como cancelado
  - Calcular reembolso
  - Liberar stock

**Archivos:**
- `packages/backend/src/services/order.service.ts`

#### **9.3 Backend - API** (20 min)
- [ ] PATCH `/api/v1/orders/:id` - Modificar pedido
- [ ] POST `/api/v1/orders/:id/cancel` - Cancelar pedido
- [ ] GET `/api/v1/orders/:id/can-modify` - Verificar si se puede modificar

**Archivos:**
- `packages/backend/src/routes/order.routes.ts`
- `packages/backend/src/controllers/order.controller.ts`

#### **9.4 Frontend - Usuario** (30 min)
- [ ] OrderDetailUserPage:
  - Botón "Modificar Pedido" (si aplica)
  - Botón "Cancelar Pedido" (si aplica)
  - Modal de modificación
  - Modal de cancelación con aviso de penalización
  - Confirmación requerida

**Archivos:**
- `packages/frontend/src/pages/OrderDetailUserPage.tsx`

#### **9.5 Frontend - Admin** (20 min)
- [ ] OrderDetailPage (admin):
  - Botones para modificar/cancelar
  - Sin restricciones de tiempo
  - Historial de cambios

**Archivos:**
- `packages/frontend/src/pages/admin/OrderDetailPage.tsx`

**Tiempo Fase 9:** ~2.5 horas

---

## 💳 FASE 10: VIP - PAGO DIFERIDO Y BLOQUEO

### **Objetivo:** VIP puede pagar después, pero se bloquea si tiene deudas

### **Tareas:**

#### **10.1 Base de Datos** (15 min)
- [ ] Añadir campo `paymentDueDate` a Order
- [ ] Añadir campo `allowDeferredPayment` a Order (boolean)
- [ ] Índice en `User` para `userLevel`

**Archivos:**
- `packages/backend/prisma/schema.prisma`

#### **10.2 Backend - Lógica VIP** (40 min)
- [ ] Servicio: `canCreateOrder(userId)`:
  - Si es VIP, verificar si tiene pagos pendientes vencidos
  - Bloquear si tiene deudas
- [ ] Servicio: `calculatePaymentDueDate(orderDate, userLevel)`:
  - STANDARD: Pago inmediato
  - VIP/VIP_PLUS: 7 días después del evento
- [ ] Modificar `createOrder`:
  - Si es VIP, marcar como pago diferido
  - Calcular fecha de vencimiento
  - No requerir pago inmediato

**Archivos:**
- `packages/backend/src/services/order.service.ts`
- `packages/backend/src/services/user.service.ts`

#### **10.3 Backend - API** (15 min)
- [ ] GET `/api/v1/users/:id/can-create-order` - Verificar si puede crear pedido
- [ ] GET `/api/v1/users/:id/pending-payments` - Listar pagos pendientes

**Archivos:**
- `packages/backend/src/routes/users.routes.ts`

#### **10.4 Frontend - Checkout** (25 min)
- [ ] Verificar antes de mostrar checkout
- [ ] Si usuario VIP bloqueado:
  - Mostrar alerta de pagos pendientes
  - Lista de facturas vencidas
  - Bloquear checkout
- [ ] Si VIP activo:
  - Mostrar "Pago diferido disponible"
  - Fecha de vencimiento
  - Opción: Pagar ahora o después

**Archivos:**
- `packages/frontend/src/pages/CheckoutPage.tsx`

#### **10.5 Admin - Gestión Pagos** (20 min)
- [ ] Página de pagos pendientes
- [ ] Marcar como pagado
- [ ] Enviar recordatorio

**Archivos:**
- `packages/frontend/src/pages/admin/PendingPayments.tsx` (nuevo)

**Tiempo Fase 10:** ~2 horas

---

## 🏷️ FASE 11: REORGANIZAR SKU

### **Objetivo:** SKU formato CATEGORIA-MARCA-MODELO

### **Tareas:**

#### **11.1 Script de Análisis** (20 min)
- [ ] Leer todos los productos
- [ ] Extraer categoría de cada producto
- [ ] Parsear nombre para obtener marca y modelo
- [ ] Generar nuevo SKU
- [ ] Log de cambios

**Archivos:**
- `packages/backend/scripts/reorganize-skus.ts`

#### **11.2 Script de Actualización** (15 min)
- [ ] Actualizar SKU de cada producto
- [ ] Mantener referencia al SKU antiguo (campo `oldSku`)
- [ ] Backup antes de ejecutar

**Archivos:**
- `packages/backend/scripts/reorganize-skus.ts`

#### **11.3 Ejecución** (10 min)
- [ ] Ejecutar script
- [ ] Verificar resultados
- [ ] Validar integridad

**Tiempo Fase 11:** ~45 minutos

---

## 🧪 FASE 12: TESTING E2E

### **Objetivo:** Probar todos los flujos críticos

### **Tareas:**

#### **12.1 Setup Playwright** (20 min)
- [ ] Instalar Playwright
- [ ] Configurar
- [ ] Crear utils de testing

**Archivos:**
- `packages/frontend/playwright.config.ts`
- `packages/frontend/tests/setup.ts`

#### **12.2 Tests Responsive** (30 min)
- [ ] Test móvil: Navegación
- [ ] Test móvil: Crear pedido
- [ ] Test tablet: UI elements
- [ ] Test desktop: Full flow

**Archivos:**
- `packages/frontend/tests/e2e/responsive.spec.ts`

#### **12.3 Tests Perfil** (20 min)
- [ ] Guardar datos de facturación
- [ ] Validación de formulario

**Archivos:**
- `packages/frontend/tests/e2e/profile.spec.ts`

#### **12.4 Tests Facturas** (30 min)
- [ ] Admin: Crear factura manual
- [ ] Generar factura de pedido
- [ ] Descargar XML/PDF
- [ ] Numeración secuencial

**Archivos:**
- `packages/frontend/tests/e2e/invoices.spec.ts`

#### **12.5 Tests Pedidos** (40 min)
- [ ] Crear pedido STANDARD
- [ ] Crear pedido VIP (con descuento)
- [ ] Modificar pedido (dentro de 24h)
- [ ] Cancelar pedido (con penalización)
- [ ] Bloqueo VIP por deuda

**Archivos:**
- `packages/frontend/tests/e2e/orders.spec.ts`

#### **12.6 Tests VIP** (30 min)
- [ ] Cambiar nivel a VIP
- [ ] Verificar descuento
- [ ] Pago diferido
- [ ] Bloqueo por deuda

**Archivos:**
- `packages/frontend/tests/e2e/vip.spec.ts`

**Tiempo Fase 12:** ~3 horas

---

## 📊 RESUMEN DE TIEMPOS

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Diseño Responsive | 2.5h |
| 2 | Datos Facturación | 1.5h |
| 3 | Facturas Facturae | 3h |
| 4 | Imágenes Categorías | 1h |
| 5 | Datos Empresa | 40min |
| 6 | Eliminar Redes | 20min |
| 7 | Corregir Acentos | 40min |
| 8 | Navegación Admin | 15min |
| 9 | Editar Pedidos | 2.5h |
| 10 | VIP Pago Diferido | 2h |
| 11 | Reorganizar SKU | 45min |
| 12 | Testing E2E | 3h |
| **TOTAL** | | **~18 horas** |

---

## 🎯 PRIORIZACIÓN

### **Alta Prioridad (Crítico):**
1. Fase 5: Datos de empresa (40min) ⚡
2. Fase 7: Acentos (40min) ⚡
3. Fase 6: Eliminar redes (20min) ⚡
4. Fase 8: Navegación admin (15min) ⚡

### **Media Prioridad (Importante):**
5. Fase 1: Responsive (2.5h)
6. Fase 2: Datos facturación (1.5h)
7. Fase 11: SKU (45min)
8. Fase 4: Imágenes categorías (1h)

### **Baja Prioridad (Mejoras):**
9. Fase 9: Editar pedidos (2.5h)
10. Fase 10: VIP diferido (2h)
11. Fase 3: Facturas (3h)
12. Fase 12: Testing (3h)

---

## 📝 ORDEN DE EJECUCIÓN RECOMENDADO

1. **Sesión 1 (2h):** Fases 5, 6, 7, 8 - Correcciones rápidas
2. **Sesión 2 (3h):** Fase 1 - Responsive completo
3. **Sesión 3 (3h):** Fases 2, 11, 4 - Perfil, SKU, Imágenes
4. **Sesión 4 (5h):** Fases 9, 10 - Pedidos y VIP
5. **Sesión 5 (6h):** Fases 3, 12 - Facturas y Testing

**Total: ~19 horas de desarrollo**

---

_Plan creado: 19/11/2025 02:35_  
_Estimación total: 18-20 horas_  
_Fases: 12_  
_Tareas: 150+_
