# ✅ IMPLEMENTACIÓN: FACTURA/PRESUPUESTO SEGÚN FECHA DEL EVENTO

_Fecha: 20/11/2025 02:27_  
_Estado: COMPLETADO_

---

## 🎯 **FUNCIONALIDAD IMPLEMENTADA:**

### **1. Presupuesto ANTES del evento**
- Si la fecha del evento aún no ha llegado → Botón "Descargar Presupuesto"
- Icono: 📄 FileText
- Color: Gris

### **2. Factura DESPUÉS del evento**
- Si la fecha del evento ya pasó → Botón "Descargar Factura"
- Icono: ⬇️ Download
- Color: Azul
- Opción adicional: "Enviar por Email"

---

## 📋 **LÓGICA IMPLEMENTADA:**

### **Archivo: invoiceHelper.ts**

```typescript
export const canDownloadInvoice = (orderStartDate: string): boolean => {
  const eventDate = new Date(orderStartDate);
  const now = new Date();
  
  // Solo factura después de la fecha del evento
  return now >= eventDate;
};

export const getDocumentAction = (orderStartDate: string): string => {
  return canDownloadInvoice(orderStartDate) 
    ? 'Descargar Factura' 
    : 'Descargar Presupuesto';
};
```

---

## 🎨 **CAMBIOS EN LA UI:**

### **OrderDetailUserPage (Cliente):**

#### **ANTES del evento:**
```
┌────────────────────────────────┐
│ [📄 Descargar Presupuesto]    │ ← Gris
└────────────────────────────────┘
```

#### **DESPUÉS del evento:**
```
┌────────────────────────────────┐
│ [⬇️ Descargar Factura]        │ ← Azul
│ [✉️ Enviar por Email]          │ ← Solo aparece después
└────────────────────────────────┘
```

### **OrderDetailPage (Admin):**

#### **ANTES del evento:**
```
┌────────────────────────────────┐
│ [📄 Descargar Presupuesto PDF]│ ← Gris
└────────────────────────────────┘
```

#### **DESPUÉS del evento:**
```
┌────────────────────────────────┐
│ [⬇️ Descargar Factura PDF]    │ ← Azul
└────────────────────────────────┘
```

---

## 💻 **CÓDIGO IMPLEMENTADO:**

### **OrderDetailUserPage.tsx:**

```tsx
import { canDownloadInvoice, getDocumentAction } from '../utils/invoiceHelper';

<button
  className={`${
    canDownloadInvoice(order.startDate) 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-gray-600 hover:bg-gray-700'
  }`}
>
  {canDownloadInvoice(order.startDate) ? (
    <Download className="w-4 h-4" />
  ) : (
    <FileText className="w-4 h-4" />
  )}
  {getDocumentAction(order.startDate)}
</button>

{/* Email solo después del evento */}
{canDownloadInvoice(order.startDate) && (
  <button onClick={handleSendInvoiceEmail}>
    <Mail className="w-4 h-4" />
    Enviar por Email
  </button>
)}
```

### **OrderDetailPage.tsx (Admin):**

```tsx
import { canDownloadInvoice, getDocumentAction } from '../../utils/invoiceHelper';

<button
  className={`${
    canDownloadInvoice(order.startDate)
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-gray-600 hover:bg-gray-700'
  }`}
>
  {canDownloadInvoice(order.startDate) ? (
    <Download className="w-4 h-4" />
  ) : (
    <FileText className="w-4 h-4" />
  )}
  {getDocumentAction(order.startDate)} PDF
</button>
```

---

## 🔄 **FLUJO COMPLETO:**

```
Usuario crea pedido para 30 de Nov
   ↓
Hoy: 20 de Nov (10 días antes)
   ↓
Ve detalle del pedido
   ↓
Botón: "📄 Descargar Presupuesto" (gris)
   ↓
Click → Descarga presupuesto.pdf
───────────────────────────────────
Pasan 10 días...
   ↓
Hoy: 1 de Dic (1 día después del evento)
   ↓
Ve detalle del pedido
   ↓
Botón: "⬇️ Descargar Factura" (azul)
Botón: "✉️ Enviar por Email"
   ↓
Click → Descarga factura.pdf
```

---

## 📊 **EJEMPLO CON FECHAS:**

### **Pedido creado:**
```
ID: ABC123
Fecha evento: 2025-12-01
```

### **Verificación el 2025-11-20:**
```typescript
orderStartDate = "2025-12-01"
now = 2025-11-20

canDownloadInvoice(orderStartDate)
→ new Date("2025-12-01") > new Date("2025-11-20")
→ false

Resultado: "Descargar Presupuesto"
```

### **Verificación el 2025-12-02:**
```typescript
orderStartDate = "2025-12-01"
now = 2025-12-02

canDownloadInvoice(orderStartDate)
→ new Date("2025-12-02") >= new Date("2025-12-01")
→ true

Resultado: "Descargar Factura"
```

---

## ✅ **BENEFICIOS:**

```
✅ Cumple normativa contable
✅ Evita facturas antes del servicio
✅ Presupuestos claros para clientes
✅ Mismo comportamiento cliente y admin
✅ UI intuitiva con colores diferenciados
✅ Email solo cuando es factura definitiva
```

---

## 🎯 **CASOS DE USO:**

### **Caso 1: Cliente planea evento futuro**
```
Cliente crea pedido para boda en 3 meses
→ Durante 3 meses: Ve "Descargar Presupuesto"
→ Día de la boda: Evento sucede
→ Después: Ve "Descargar Factura"
```

### **Caso 2: Admin gestiona pedidos**
```
Admin ve pedido de evento futuro
→ Botón gris: "Descargar Presupuesto PDF"
→ Puede enviar presupuesto al cliente
→ Después del evento: Botón azul "Descargar Factura PDF"
→ Puede generar factura definitiva
```

### **Caso 3: Evento el mismo día**
```
Pedido para HOY a las 18:00
Hora actual: 10:00
→ Aún se ve "Presupuesto"

Hora actual: 19:00 (pasó la medianoche)
→ Ahora se ve "Factura"
```

---

## 📁 **ARCHIVOS MODIFICADOS:**

```
✅ NUEVO: utils/invoiceHelper.ts
   - canDownloadInvoice()
   - getDocumentAction()
   - getDocumentLabel()
   - getDocumentType()

✅ MODIFICADO: pages/OrderDetailUserPage.tsx
   - Import invoiceHelper
   - Botón dinámico según fecha
   - Email condicional

✅ MODIFICADO: pages/admin/OrderDetailPage.tsx
   - Import invoiceHelper
   - Botón dinámico según fecha
```

---

## 🚀 **LISTO PARA USAR:**

La funcionalidad ya está activa. Para probar:

1. **Crear pedido para evento futuro:**
   - Botón debe decir "Descargar Presupuesto"
   - Color gris
   - Icono documento

2. **Ver pedido de evento pasado:**
   - Botón debe decir "Descargar Factura"
   - Color azul
   - Icono descarga
   - Aparece botón "Enviar por Email"

3. **Como admin:**
   - Misma lógica en panel de administración
   - Presupuesto antes, Factura después

---

## ⚠️ **NOTA IMPORTANTE:**

### **Modificaciones y Pago:**

El sistema ya está preparado para modificaciones:
- ✅ Añadir items → Genera cargo adicional Stripe
- ✅ Eliminar items → Genera reembolso Stripe
- ✅ Backend maneja errores de Stripe
- ⏳ **PENDIENTE:** UI de pago frontend para cargos adicionales

### **Siguiente paso recomendado:**
Crear flujo de pago en frontend cuando hay cargo adicional tras modificación.

---

_Implementado: 20/11/2025_  
_Archivos: 1 nuevo, 2 modificados_  
_Estado: ✅ PRODUCTION READY_
