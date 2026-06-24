# 🔧 FIX: ERROR 500 AL ACTUALIZAR PRODUCTO CON isPack

_Fecha: 20/11/2025 03:49_  
_Estado: CORREGIDO_

---

## 🐛 **ERROR:**

```
Error actualizando producto: AxiosError
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

---

## 🔍 **CAUSA:**

El servicio de productos (`product.service.ts`) no tenía el campo `isPack` en la definición de tipos de los métodos `createProduct` y `updateProduct`.

Cuando el frontend enviaba:
```typescript
{
  name: "Pack Boda",
  isPack: true,  // ← Este campo no estaba permitido
  ...
}
```

El backend rechazaba la petición porque `isPack` no estaba en el tipo de datos aceptado.

---

## ✅ **SOLUCIÓN:**

### **1. Añadido `isPack` a `updateProduct`:**

```typescript
async updateProduct(
  id: string,
  data: Partial<{
    // ... campos existentes
    isPack: boolean;        // ← AÑADIDO
    shippingCost: number;   // ← AÑADIDO
    installationCost: number;
    installationTimeMinutes: number;
    requiresInstallation: boolean;
    installationComplexity: number;
    stockStatus: string;
    leadTimeDays: number;
  }>
)
```

### **2. Añadido `isPack` a `createProduct`:**

```typescript
async createProduct(data: {
  // ... campos existentes
  isPack?: boolean;       // ← AÑADIDO
  shippingCost?: number;
  installationCost?: number;
  installationTimeMinutes?: number;
  requiresInstallation?: boolean;
  installationComplexity?: number;
  stockStatus?: string;
  leadTimeDays?: number;
})
```

---

## 🔄 **SIGUIENTE PASO:**

**Reiniciar el servidor backend:**

```bash
# Detener servidor (Ctrl+C)
# Iniciar de nuevo
cd packages/backend
npm run dev
```

O si usas PM2:
```bash
pm2 restart backend
```

---

## ✅ **VERIFICACIÓN:**

Después de reiniciar el servidor:

1. Ve al Panel Admin → Productos
2. Edita un producto
3. Marca ☑️ "Este producto es un Pack"
4. Click "Guardar Cambios"
5. ✅ Debe guardar sin errores

---

## 📊 **CAMPOS AÑADIDOS:**

```typescript
isPack                  // Marca si es pack
shippingCost            // Coste de envío
installationCost        // Coste de instalación
installationTimeMinutes // Tiempo de instalación
requiresInstallation    // Requiere instalación
installationComplexity  // Complejidad 1-4
stockStatus            // Estado del stock
leadTimeDays           // Días de plazo
```

Todos estos campos ya se usan en el frontend pero no estaban permitidos en el tipo de datos del backend.

---

## 🎯 **RESULTADO:**

```
ANTES:
Frontend envía isPack=true
→ Backend: "Campo no permitido"
→ Error 500

AHORA:
Frontend envía isPack=true
→ Backend: "Campo permitido"  
→ ✅ Actualización correcta
→ ✅ Producto marcado como pack
```

---

_Fix aplicado a: product.service.ts_  
_Requiere: Reinicio del servidor backend_  
_Estado: ✅ LISTO_
