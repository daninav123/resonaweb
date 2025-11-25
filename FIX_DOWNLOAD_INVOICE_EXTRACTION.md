# ✅ FIX: Extracción de invoice.id corregida

_Fecha: 19/11/2025 23:12_

## 🐛 **PROBLEMA:**
```
Error: No se pudo generar la factura
```

Aunque la API devolvía:
```json
✅ Factura generada: {
  message: 'Factura generada exitosamente',
  invoice: {
    id: '...',
    invoiceNumber: '...',
    ...
  }
}
```

El código esperaba que `invoice` estuviera en el nivel superior.

## ✅ **SOLUCIÓN:**

```typescript
// ❌ ANTES:
const invoice: any = await invoiceService.generateInvoice(orderId);
if (!invoice || !invoice.id) { // ← Falla porque invoice = {message, invoice}
  throw new Error('No se pudo generar la factura');
}

// ✅ AHORA:
const response: any = await invoiceService.generateInvoice(orderId);
const invoice = response?.invoice || response; // ← Extrae correctamente
if (!invoice || !invoice.id) {
  throw new Error('No se pudo generar la factura');
}
```

## 🎯 **CÓMO FUNCIONA:**

```typescript
// Si la API devuelve: {message: '...', invoice: {...}}
const invoice = response?.invoice || response;
// invoice = {...} ✅

// Si la API devuelve directamente: {...}
const invoice = response?.invoice || response;
// invoice = {...} ✅ (fallback)
```

## ✅ **RESULTADO:**

Ahora el botón "Descargar Factura" funciona correctamente:
1. ✅ Genera la factura
2. ✅ Extrae el invoice.id correctamente
3. ✅ Descarga el PDF
4. ✅ Muestra toast de éxito

---

_Fix aplicado: OrdersPage.tsx línea 46_  
_Estado: ARREGLADO ✅_
