# 📅 FECHAS GLOBALES EN CARRITO

**Fecha:** 13 de Noviembre de 2025  
**Estado:** ✅ COMPLETADO

---

## 🎯 CONCEPTO

### **Sistema Híbrido:**
```
1. Fechas Globales (Default)
   → Se aplican a TODOS los productos
   
2. Fechas Personalizadas (Opcional)
   → Se aplican a productos específicos
```

---

## 🎨 NUEVO DISEÑO

### **Layout del Carrito:**

```
┌──────────────────────────────────────┐
│  📅 FECHAS DEL PEDIDO               │
│  ─────────────────────────────────  │
│  Estas fechas se aplicarán a todos  │
│                                      │
│  [Fecha Inicio] [Fecha Fin]         │
│  [Aplicar a todos los productos] ✅  │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  🛒 PRODUCTOS EN EL CARRITO         │
│  ─────────────────────────────────  │
│                                      │
│  [IMG] Producto 1              [🗑] │
│        €X/día × cantidad            │
│                                      │
│  📅 Usando fechas globales           │
│     [✎ Personalizar fechas]         │
│  ──────────────────────────────────  │
│  5 días × €45 × 2 uds    €450.00   │
│                                      │
│  ────────────────────────────────    │
│                                      │
│  [IMG] Producto 2              [🗑] │
│        €X/día × cantidad            │
│                                      │
│  📅 Fechas personalizadas            │
│     [✕ Usar fechas globales]        │
│  [Fecha inicio] [Fecha fin]         │
│  ──────────────────────────────────  │
│  3 días × €30 × 1 ud     €90.00    │
└──────────────────────────────────────┘
```

---

## ⚙️ FUNCIONAMIENTO

### **1. Fechas Globales (Por Defecto)**

```typescript
// Estado global
const [globalDates, setGlobalDates] = useState({ 
  start: '', 
  end: '' 
});

// Aplicar a todos
applyGlobalDates() {
  items.forEach(item => {
    if (!customDatesItems.has(item.id)) {
      updateDates(item.id, globalDates.start, globalDates.end);
    }
  });
}
```

**Flujo:**
1. Usuario selecciona fechas globales
2. Click "Aplicar a todos los productos"
3. Todos los productos reciben esas fechas
4. Precios se calculan automáticamente

---

### **2. Fechas Personalizadas (Opcional)**

```typescript
// Tracking de items personalizados
const [customDatesItems, setCustomDatesItems] = useState<Set<string>>(new Set());

// Toggle personalización
toggleCustomDates(itemId) {
  if (customDatesItems.has(itemId)) {
    customDatesItems.delete(itemId); // Volver a globales
  } else {
    customDatesItems.add(itemId);    // Usar personalizadas
  }
}
```

**Flujo:**
1. Usuario click "✎ Personalizar fechas" en un producto
2. Aparecen selectores de fecha para ese producto
3. Usuario selecciona fechas específicas
4. Ese producto usa sus fechas personalizadas
5. Click "✕ Usar fechas globales" para volver al default

---

### **3. Cálculo de Precios**

```typescript
// Obtener fechas efectivas (globales o personalizadas)
getEffectiveDates(item) {
  if (customDatesItems.has(item.id) && item.startDate) {
    return { start: item.startDate, end: item.endDate };
  }
  return globalDates; // Default a globales
}

// Calcular precio
calculateItemPrice(item) {
  const dates = getEffectiveDates(item);
  const days = calculateDays(dates.start, dates.end);
  return item.product.pricePerDay × days × item.quantity;
}
```

---

## 📊 CASOS DE USO

### **Caso 1: Evento Simple (Fechas Iguales)**

```
Usuario: Alquila 10 productos para un evento
Fechas: 15/12/2025 - 18/12/2025 (TODAS iguales)

Proceso:
1. Selecciona fechas globales
2. Click "Aplicar a todos"
3. Todos los productos: 15/12 - 18/12
4. Checkout directo

✅ Rápido y simple
```

### **Caso 2: Múltiples Eventos (Fechas Diferentes)**

```
Usuario: Alquila productos para 2 eventos
  - Evento A: 15/12 - 18/12
  - Evento B: 20/12 - 22/12

Proceso:
1. Selecciona fechas globales: 15/12 - 18/12
2. Aplica a todos
3. Productos del Evento B:
   → Click "✎ Personalizar fechas"
   → Selecciona 20/12 - 22/12
4. Checkout

✅ Flexible para casos complejos
```

### **Caso 3: Producto Necesita Más Tiempo**

```
Usuario: Alquila equipo para evento
  - La mayoría: 15/12 - 17/12
  - Cámara especial: Necesita 14/12 - 18/12 (setup + desmont)

Proceso:
1. Fechas globales: 15/12 - 17/12
2. Aplica a todos
3. Cámara especial:
   → "✎ Personalizar fechas"
   → 14/12 - 18/12
4. Checkout

✅ Control granular cuando se necesita
```

---

## 🔧 VALIDACIONES

### **Al Checkout:**

```typescript
allItemsHaveDates() {
  // Verificar fechas globales
  if (globalDates.start && globalDates.end) {
    return true; // OK
  }
  
  // O todos los items tienen fechas personalizadas
  return items.every(item => 
    customDatesItems.has(item.id) && 
    item.startDate && 
    item.endDate
  );
}
```

### **Mensajes:**

```
❌ Sin fechas globales ni personalizadas:
   "⚠️ Selecciona las fechas del pedido arriba"

✅ Con fechas globales:
   [Proceder al checkout]

✅ Todos con fechas personalizadas:
   [Proceder al checkout]
```

---

## 💡 VENTAJAS

### **Para el Usuario:**

```
✅ Simplicidad por defecto
   → Una sola selección de fechas para todo

✅ Flexibilidad cuando se necesita
   → Personalizar productos específicos

✅ Visual claro
   → Se ve qué usa fechas globales vs personalizadas

✅ Ahorro de tiempo
   → No repetir fechas para cada producto
```

### **Para el Negocio:**

```
✅ Menos errores
   → Usuario no olvida poner fechas

✅ Proceso más rápido
   → Menos clicks para completar

✅ Conversión mayor
   → Menos fricción = más ventas

✅ Casos complejos soportados
   → Clientes con múltiples eventos
```

---

## 🎨 DISEÑO VISUAL

### **Indicadores:**

```
Usando fechas globales:
  📅 Usando fechas globales
     [✎ Personalizar fechas]

Fechas personalizadas:
  📅 Fechas personalizadas  
     [✕ Usar fechas globales]
     [Selector fecha inicio]
     [Selector fecha fin]
```

### **Colores:**

```
Fechas globales: 
  - Fondo: bg-gray-50
  - Texto: text-gray-700
  - Link: text-blue-600

Fechas personalizadas:
  - Fondo: bg-gray-50
  - Inputs: border-gray-300
  - Link: text-blue-600
```

---

## 📱 RESPONSIVE

### **Mobile:**
```
Fechas globales: Stack vertical
[Fecha inicio]
[Fecha fin]
[Aplicar]
```

### **Desktop:**
```
Fechas globales: 2 columnas
[Fecha inicio] [Fecha fin]
[Aplicar a todos]
```

---

## 🔄 FLUJO COMPLETO

### **Paso 1: Llegar al Carrito**
```
- Usuario tiene productos añadidos
- No hay fechas aún
- ⚠️ Mensaje: "Selecciona fechas del pedido arriba"
```

### **Paso 2: Seleccionar Fechas Globales**
```
- Usuario elige fecha inicio: 15/12/2025
- Usuario elige fecha fin: 18/12/2025
- Click "Aplicar a todos los productos"
- ✅ Todas las fechas actualizadas
- ✅ Precios calculados automáticamente
```

### **Paso 3: (Opcional) Personalizar Producto**
```
- Usuario ve que un producto necesita más días
- Click "✎ Personalizar fechas" en ese producto
- Aparecen inputs de fecha
- Selecciona fechas específicas
- ✅ Ese producto usa sus propias fechas
- ✅ Precio recalculado
```

### **Paso 4: Checkout**
```
- Usuario ve totales correctos
- Click "Proceder al checkout"
- ✅ Validación pasó
- → Redirige a /checkout
```

---

## 🧪 TESTING

### **Test 1: Fechas Globales**
```bash
1. Añadir 3 productos al carrito
2. Ir a /carrito
3. Seleccionar fechas globales
4. Click "Aplicar a todos"

✅ ESPERADO:
- Todos muestran "Usando fechas globales"
- Precios calculados correctamente
- Botón checkout habilitado
```

### **Test 2: Personalizar Un Producto**
```bash
1. Carrito con fechas globales aplicadas
2. Click "✎ Personalizar fechas" en producto
3. Seleccionar fechas diferentes

✅ ESPERADO:
- Aparecen inputs de fecha
- Muestra "Fechas personalizadas"
- Precio recalculado para ese producto
- Otros productos siguen con fechas globales
```

### **Test 3: Volver a Fechas Globales**
```bash
1. Producto con fechas personalizadas
2. Click "✕ Usar fechas globales"

✅ ESPERADO:
- Inputs desaparecen
- Muestra "Usando fechas globales"
- Precio vuelve a usar fechas globales
```

### **Test 4: Validación Checkout**
```bash
1. Carrito sin fechas globales
2. Click "Proceder al checkout"

✅ ESPERADO:
- Mensaje: "Selecciona fechas del pedido arriba"
- No redirige
- Botón deshabilitado
```

---

## 🔐 PERSISTENCIA

### **Guest Cart:**
```typescript
// Fechas se guardan en localStorage
guestCart.updateDates(itemId, startDate, endDate);

// Fechas globales NO se persisten
// (Se pierden al recargar)
```

### **User Cart:**
```typescript
// Fechas se guardan en backend
updateDates.mutate({ itemId, startDate, endDate });

// Fechas globales NO se persisten
// (Se pierden al recargar)
```

### **Mejora Futura:**
```typescript
// Guardar preferencia de fechas globales
localStorage.setItem('globalDates', JSON.stringify(globalDates));

// Al cargar
const saved = localStorage.getItem('globalDates');
if (saved) setGlobalDates(JSON.parse(saved));
```

---

## 📊 ESTADÍSTICAS RECOMENDADAS

### **Métricas:**
```javascript
// Capturar eventos
track('global_dates_applied', {
  itemCount: cartItems.length,
  startDate, endDate
});

track('custom_dates_enabled', {
  itemId, productName
});

track('checkout_with_custom_dates', {
  customItemsCount,
  totalItems
});
```

### **KPIs:**
```
1. % usuarios que usan fechas globales
2. % usuarios que personalizan algún producto
3. Productos más personalizados
4. Tiempo promedio para seleccionar fechas
5. Tasa de abandono después de fechas
```

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [x] Estado globalDates
- [x] Estado customDatesItems
- [x] Función applyGlobalDates
- [x] Función toggleCustomDates
- [x] Función getEffectiveDates
- [x] UI fechas globales
- [x] UI fechas personalizadas por producto
- [x] Indicador visual (globales vs custom)
- [x] Botón toggle personalización
- [x] Cálculo de precios actualizado
- [x] Validación checkout
- [x] Mensajes de error actualizados
- [x] Documentación

---

## 🎯 RESUMEN

```
PROBLEMA:
- Repetir fechas para cada producto era tedioso

SOLUCIÓN:
- Fechas globales por defecto
- Opción de personalizar cuando se necesita

RESULTADO:
✅ Proceso más rápido (1 click vs N clicks)
✅ Menos errores (fechas consistentes)
✅ Flexible (personalizar si se necesita)
✅ UX mejorada (clara y simple)

TIEMPO: 45 minutos
COMPLEJIDAD: Media-Alta
CALIDAD: Alta
ESTADO: ✅ LISTO
```

---

**¡Sistema de fechas globales implementado!** 📅✨

**El usuario puede:**
1. ✅ Seleccionar fechas una vez para todos
2. ✅ Aplicar con un click
3. ✅ Personalizar productos específicos si necesita
4. ✅ Volver a fechas globales fácilmente
5. ✅ Ver claramente qué usa fechas globales vs personalizadas
