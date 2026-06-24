# 🔧 FIX: MENSAJES DE PRESUPUESTO VS FACTURA

_Fecha: 20/11/2025 04:43_  
_Estado: CORREGIDO_

---

## 🐛 **PROBLEMA:**

Al descargar un presupuesto (antes de la fecha del evento), el sistema mostraba:
```
❌ "Descargando factura..."
❌ "Factura descargada correctamente"
❌ Nombre del archivo: "factura-..."
```

Pero debería mostrar:
```
✅ "Descargando presupuesto..."
✅ "Presupuesto descargado correctamente"
✅ Nombre del archivo: "presupuesto-..."
```

---

## 🎯 **LÓGICA CORRECTA:**

### **Antes de la fecha del evento:**
- Documento: **Presupuesto**
- Es una cotización/propuesta
- Cliente aún no ha recibido el servicio

### **Después de la fecha del evento:**
- Documento: **Factura**
- Servicio ya prestado
- Documento contable oficial

---

## ✅ **SOLUCIÓN IMPLEMENTADA:**

### **1. Determinación Dinámica del Tipo:**

```typescript
const docType = order.startDate && new Date(order.startDate) <= new Date() 
  ? 'Factura'      // Evento ya pasó
  : 'Presupuesto'; // Evento futuro

const docTypeLower = docType.toLowerCase();
```

### **2. Mensajes Actualizados:**

```typescript
// Generando
toast.loading(`Generando ${docTypeLower}...`);

// Éxito
toast.success(`${docType} descargado correctamente`);

// Error
toast.error(`Error al descargar el ${docTypeLower}`);

// Nombre del archivo
link.download = `${docTypeLower}-${invoiceNumber}.pdf`;
```

---

## 📁 **ARCHIVOS MODIFICADOS:**

### **1. OrderDetailUserPage.tsx** (Vista del Cliente)
```typescript
✅ handleDownloadInvoice() - Descarga con mensaje correcto
✅ handleSendInvoiceEmail() - Email con mensaje correcto
✅ Nombres de archivo dinámicos
```

### **2. OrdersPage.tsx** (Lista de Pedidos del Cliente)
```typescript
✅ handleDownloadInvoice(order) - Recibe objeto completo
✅ Todos los mensajes dinámicos
✅ Console logs actualizados
```

### **3. OrderDetailPage.tsx** (Vista Admin)
```typescript
✅ handleDownloadInvoice() - Mensajes dinámicos
✅ Console logs actualizados
```

---

## 🔄 **COMPARACIÓN ANTES/DESPUÉS:**

### **Escenario 1: Evento Futuro (2026-01-02)**

#### **ANTES:**
```
Cliente descarga documento:
→ "Generando factura..."
→ "Factura descargada correctamente"
→ Archivo: "factura-INV-2025-0015.pdf"
```

#### **AHORA:**
```
Cliente descarga documento:
→ "Generando presupuesto..."
→ "Presupuesto descargado correctamente"
→ Archivo: "presupuesto-INV-2025-0015.pdf"
```

### **Escenario 2: Evento Pasado (2024-11-15)**

#### **ANTES:**
```
Cliente descarga documento:
→ "Generando factura..."
→ "Factura descargada correctamente"
→ Archivo: "factura-INV-2024-0120.pdf"
```

#### **AHORA (Sin cambios):**
```
Cliente descarga documento:
→ "Generando factura..."
→ "Factura descargada correctamente"
→ Archivo: "factura-INV-2024-0120.pdf"
```

---

## 💡 **EJEMPLOS DE USO:**

### **Caso 1: Presupuesto**
```
Pedido #RES-2025-0015
Fecha evento: 2026-01-02 (futuro)
Fecha actual: 2025-11-20

→ new Date("2026-01-02") > new Date("2025-11-20")
→ Evento es FUTURO
→ Mostrar: "Presupuesto"
```

### **Caso 2: Factura**
```
Pedido #RES-2024-0120
Fecha evento: 2024-11-15 (pasado)
Fecha actual: 2025-11-20

→ new Date("2024-11-15") <= new Date("2025-11-20")
→ Evento es PASADO
→ Mostrar: "Factura"
```

### **Caso 3: Evento Hoy**
```
Pedido #RES-2025-0200
Fecha evento: 2025-11-20 (hoy)
Fecha actual: 2025-11-20

→ new Date("2025-11-20") <= new Date("2025-11-20")
→ Evento es HOY (se considera pasado)
→ Mostrar: "Factura"
```

---

## 🎨 **EXPERIENCIA DE USUARIO:**

### **Vista Cliente (OrderDetailUserPage):**

```
┌─────────────────────────────────────┐
│ Pedido #RES-2025-0015               │
│ Fecha: 2 Enero 2026                 │
│                                     │
│ [📄 Descargar Presupuesto]         │
│ [✉️ Enviar Presupuesto por Email]  │
└─────────────────────────────────────┘

Vs (después del evento):

┌─────────────────────────────────────┐
│ Pedido #RES-2025-0015               │
│ Fecha: 2 Enero 2026                 │
│                                     │
│ [📄 Descargar Factura]              │
│ [✉️ Enviar Factura por Email]      │
└─────────────────────────────────────┘
```

### **Notificaciones Toast:**

```
Antes del evento:
→ 🔄 Generando presupuesto...
→ ✅ Presupuesto descargado correctamente
→ 📧 Presupuesto enviado por email

Después del evento:
→ 🔄 Generando factura...
→ ✅ Factura descargada correctamente
→ 📧 Factura enviada por email
```

---

## 🧪 **TESTING:**

### **Test 1: Presupuesto (Evento Futuro)**
```typescript
// Setup
orderStartDate = "2026-01-02"
currentDate = "2025-11-20"

// Action
handleDownloadInvoice()

// Expect
toast.loading("Generando presupuesto...")
toast.success("Presupuesto descargado correctamente")
filename = "presupuesto-INV-2025-0015.pdf"
```

### **Test 2: Factura (Evento Pasado)**
```typescript
// Setup
orderStartDate = "2024-11-15"
currentDate = "2025-11-20"

// Action
handleDownloadInvoice()

// Expect
toast.loading("Generando factura...")
toast.success("Factura descargada correctamente")
filename = "factura-INV-2024-0120.pdf"
```

### **Test 3: Envío por Email**
```typescript
// Setup (evento futuro)
orderStartDate = "2026-01-02"

// Action
handleSendInvoiceEmail()

// Expect
toast.loading("Enviando presupuesto por email...")
toast.success("Presupuesto enviado por email")
```

---

## 📋 **UTILIDADES YA EXISTENTES:**

El proyecto ya tiene utilidades en `invoiceHelper.ts`:

```typescript
// Determinar si es factura o presupuesto
canDownloadInvoice(orderStartDate: string): boolean

// Obtener tipo de documento
getDocumentType(orderStartDate: string): 'invoice' | 'quote'

// Obtener etiqueta del documento
getDocumentLabel(orderStartDate: string): string
// Retorna: 'Factura' o 'Presupuesto'

// Obtener texto del botón
getDocumentAction(orderStartDate: string): string
// Retorna: 'Descargar Factura' o 'Descargar Presupuesto'
```

**Nota:** Usamos la lógica inline por simplicidad, pero podríamos refactorizar para usar estas utilidades.

---

## ✅ **BENEFICIOS:**

```
✅ Terminología correcta según el contexto
✅ Mejor experiencia de usuario
✅ Nombres de archivo más claros
✅ Confusión evitada (presupuesto ≠ factura)
✅ Consistencia en toda la aplicación
✅ Código más mantenible
```

---

## 🔮 **FUTURAS MEJORAS:**

### **1. Refactorizar usando utilidades:**
```typescript
// En lugar de:
const docType = order.startDate && new Date(order.startDate) <= new Date() 
  ? 'Factura' : 'Presupuesto';

// Usar:
const docType = getDocumentLabel(order.startDate);
```

### **2. Añadir visual distinción:**
```typescript
// Presupuestos: color gris/azul
<button className="bg-blue-600">
  📄 Descargar Presupuesto
</button>

// Facturas: color verde (documento oficial)
<button className="bg-green-600">
  📄 Descargar Factura
</button>
```

### **3. Backend consistency:**
```typescript
// El PDF generado también debe tener título correcto:
- Presupuesto #INV-2025-0015 (antes del evento)
- Factura #INV-2025-0015 (después del evento)
```

---

## 📊 **IMPACTO:**

```
Usuarios afectados: Todos
Archivos modificados: 3
Líneas de código: ~100
Tipo de cambio: UX improvement
Breaking changes: Ninguno
Retrocompatibilidad: ✅ Completa
```

---

## ✅ **RESULTADO:**

```
ANTES:
- Siempre mostraba "factura"
- Confusión para clientes
- Archivos mal nombrados

AHORA:
- Muestra "presupuesto" antes del evento
- Muestra "factura" después del evento
- Terminología correcta
- Archivos bien nombrados
- Experiencia de usuario mejorada
```

---

_Fix aplicado a:_
- `OrderDetailUserPage.tsx`
- `OrdersPage.tsx`
- `OrderDetailPage.tsx` (admin)

_Estado: ✅ COMPLETADO_
