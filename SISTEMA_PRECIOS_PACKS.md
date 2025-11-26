# 💰 SISTEMA DE PRECIOS DE PACKS

## 📐 FÓRMULA DE CÁLCULO:

```
Precio Final = (basePrice + priceExtra) × (1 - discount/100)

Donde:
- basePrice  = Suma automática de todos los productos del pack
- priceExtra = Cantidad editable que puedes añadir (ej: gastos de montaje)
- discount   = Porcentaje de descuento (0-100)
```

---

## 🔧 CAMPOS EN LA BASE DE DATOS:

### **Pack Model:**

```prisma
model Pack {
  // Cálculo de precios
  basePrice     Decimal   // Suma automática de productos
  priceExtra    Decimal   // Extra editable
  autoCalculate Boolean   // Si calcula automáticamente
  
  // Precio final
  pricePerDay   Decimal   // Precio total (base + extra - descuento)
  discount      Decimal   // Descuento en porcentaje
}
```

---

## 📊 EJEMPLO PRÁCTICO:

### **Pack "Sonido Completo":**

**Productos incluidos:**
- 2x Altavoz DAS 515A @ €50/día = **€100**
- 1x Mesa Mezclas @ €30/día = **€30**
- 2x Micrófono @ €10/día = **€20**

```
basePrice  = €150  (suma automática)
priceExtra = €25   (gastos de montaje)
discount   = 10%   (descuento del pack)

Cálculo:
(150 + 25) = €175
175 × (1 - 10/100) = 175 × 0.9 = €157.50

Precio Final = €157.50/día
```

---

## ⚙️ MODOS DE FUNCIONAMIENTO:

### **1. Modo Automático (autoCalculate = true)**

El sistema calcula automáticamente el precio cuando:
- ✅ Se crea el pack
- ✅ Se actualiza el pack
- ✅ Se añaden/quitan productos
- ✅ Se cambia `priceExtra`
- ✅ Se cambia `discount`

**Ejemplo:**
```javascript
await packService.createPack({
  name: "Pack Sonido",
  items: [{ productId: "...", quantity: 2 }],
  priceExtra: 25,
  discount: 10,
  autoCalculate: true  // ← Por defecto
});
// El sistema calcula automáticamente pricePerDay
```

### **2. Modo Manual (autoCalculate = false)**

Puedes establecer el precio manualmente:

```javascript
await packService.createPack({
  name: "Pack Sonido",
  items: [...],
  autoCalculate: false,
  pricePerDay: 200  // ← Precio fijo manual
});
```

---

## 🛠️ API DISPONIBLE:

### **1. Calcular precio de un pack**

```typescript
import { packPricingService } from './services/pack-pricing.service';

const pricing = await packPricingService.calculatePackPrice(packId);

console.log(pricing);
// {
//   basePrice: 150,
//   priceExtra: 25,
//   discount: 10,
//   finalPrice: 157.50,
//   breakdown: {
//     itemsTotal: 150,
//     extra: 25,
//     discountAmount: 17.50
//   }
// }
```

### **2. Actualizar precio de un pack**

```typescript
// Actualiza automáticamente si autoCalculate = true
await packPricingService.updatePackPrice(packId);
```

### **3. Actualizar todos los packs**

```typescript
// Actualiza todos los packs con autoCalculate = true
const updated = await packPricingService.updateAllPackPrices();
console.log(`${updated} packs actualizados`);
```

---

## 📝 SCRIPT DE ACTUALIZACIÓN MASIVA:

```bash
cd packages/backend
node scripts/update-pack-prices.js
```

**Este script:**
- 📊 Lee todos los packs existentes
- 🔢 Calcula `basePrice` (suma de productos)
- 💰 Aplica `priceExtra` y `discount`
- 💾 Actualiza `pricePerDay` en la BD
- ✅ Muestra resumen detallado

---

## 🎯 CASOS DE USO:

### **Caso 1: Pack básico sin extras**

```javascript
{
  items: [productos...],
  priceExtra: 0,      // Sin extra
  discount: 0,        // Sin descuento
  autoCalculate: true
}
// Precio = Suma de productos
```

### **Caso 2: Pack con gastos de montaje**

```javascript
{
  items: [productos...],
  priceExtra: 50,     // €50 por montaje
  discount: 0,
  autoCalculate: true
}
// Precio = Suma productos + €50
```

### **Caso 3: Pack con descuento**

```javascript
{
  items: [productos...],
  priceExtra: 0,
  discount: 15,       // 15% descuento
  autoCalculate: true
}
// Precio = Suma productos - 15%
```

### **Caso 4: Pack completo**

```javascript
{
  items: [productos...],
  priceExtra: 30,     // Montaje
  discount: 10,       // 10% descuento
  autoCalculate: true
}
// Precio = (Suma + €30) - 10%
```

---

## 🔄 ACTUALIZACIÓN AUTOMÁTICA:

### **Eventos que disparan recálculo:**

1. **Al crear pack:** Se calcula automáticamente
2. **Al actualizar items:** Se recalcula si `autoCalculate = true`
3. **Al cambiar priceExtra:** Se recalcula si `autoCalculate = true`
4. **Al cambiar discount:** Se recalcula si `autoCalculate = true`

### **Qué NO dispara recálculo:**

- ❌ Cambiar nombre/descripción/imagen
- ❌ Cambiar featured/isActive
- ❌ Si `autoCalculate = false`

---

## 📱 EN EL FRONTEND (Admin):

### **Formulario de Pack:**

```tsx
<Form>
  {/* Selección de productos */}
  <ProductSelector items={items} onChange={setItems} />
  
  {/* Mostrar precio base calculado */}
  <div>
    <label>Precio Base (automático)</label>
    <input value={calculateBasePrice(items)} disabled />
  </div>
  
  {/* Extra editable */}
  <div>
    <label>Precio Extra</label>
    <input 
      type="number"
      value={priceExtra}
      onChange={e => setPriceExtra(e.target.value)}
    />
    <small>Ej: gastos de montaje, transporte, etc.</small>
  </div>
  
  {/* Descuento */}
  <div>
    <label>Descuento (%)</label>
    <input 
      type="number"
      value={discount}
      onChange={e => setDiscount(e.target.value)}
      min="0"
      max="100"
    />
  </div>
  
  {/* Precio final calculado */}
  <div>
    <label>Precio Final (automático)</label>
    <input value={calculateFinalPrice()} disabled />
  </div>
  
  {/* Toggle cálculo automático */}
  <label>
    <input 
      type="checkbox"
      checked={autoCalculate}
      onChange={e => setAutoCalculate(e.target.checked)}
    />
    Calcular precio automáticamente
  </label>
</Form>
```

---

## 🔍 VERIFICACIÓN:

### **Comprobar precios actuales:**

```sql
SELECT 
  name,
  basePrice,
  priceExtra,
  discount,
  pricePerDay,
  autoCalculate
FROM "Pack"
ORDER BY name;
```

### **Productos de un pack:**

```sql
SELECT 
  p.name as pack_name,
  pr.name as product_name,
  pi.quantity,
  pr."pricePerDay" as product_price,
  (pi.quantity * pr."pricePerDay") as subtotal
FROM "Pack" p
JOIN "PackItem" pi ON pi."packId" = p.id
JOIN "Product" pr ON pr.id = pi."productId"
WHERE p.id = 'PACK_ID_AQUI';
```

---

## ✅ RESUMEN:

```
✅ basePrice  → Calculado automáticamente (suma productos)
✅ priceExtra → Editable (gastos adicionales)
✅ discount   → Editable (descuento en %)
✅ pricePerDay → Calculado: (base + extra) - descuento
✅ autoCalculate → Activar/desactivar cálculo automático
✅ Script disponible para actualización masiva
✅ API para cálculos manuales
```

---

## 🚀 PRÓXIMOS PASOS:

1. **Ejecuta el script de actualización:**
   ```bash
   node scripts/update-pack-prices.js
   ```

2. **Verifica los precios en la BD**

3. **Actualiza el frontend admin** para mostrar estos campos

4. **Documenta para el cliente** cómo usar el sistema

---

**El sistema está listo para usar. Los precios se calcularán automáticamente según los productos, extras y descuentos.** ✅
