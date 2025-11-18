# 🧪 TEST MANUAL COMPLETO - Validación de Stock

Sigue estos pasos EXACTAMENTE para probar la funcionalidad:

## 📋 PREPARACIÓN

### 1. Abre la Consola del Navegador
```
Presiona F12
Ve a la pestaña "Console"
```

### 2. Limpia el Carrito Actual
Pega esto en la consola y presiona Enter:
```javascript
localStorage.removeItem('guest_cart');
console.log('✅ Carrito limpiado');
```

### 3. Refresca la Página
```
Ctrl + F5
```

---

## 🛒 PASO 1: Crear Producto con Stock 0

### Desde Admin, crea un producto:
- **Nombre:** `Test Stock Cero`
- **SKU:** `TEST-STOCK-0`
- **Stock:** `0` ⚠️ (IMPORTANTE)
- **Precio por día:** `100`
- **Categoría:** Cualquiera

**O ejecuta esto en la consola del navegador MIENTRAS estás en `/productos`:**

```javascript
// Nota: Este código no creará el producto, solo te indica qué buscar
console.log('🔍 Busca un producto que tenga Stock: 0');
console.log('Si no existe, créalo desde /admin/productos');
```

---

## 🛍️ PASO 2: Añadir al Carrito

1. Ve a la página del producto con stock 0
2. Click en "Añadir al carrito"
3. **Verifica en consola:**

```javascript
const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
console.log('📦 Productos en carrito:', cart.length);
console.log('📊 Datos del producto:');
cart.forEach(item => {
    console.log({
        nombre: item.product.name,
        stock: item.product.stock,
        realStock: item.product.realStock,
        tieneStock: item.product.stock !== undefined || item.product.realStock !== undefined
    });
});
```

**Resultado esperado:**
```
📦 Productos en carrito: 1
📊 Datos del producto:
{
  nombre: "Test Stock Cero",
  stock: 0,
  realStock: 0,
  tieneStock: true
}
```

❌ Si ves `stock: undefined` → **EL PROBLEMA ESTÁ AQUÍ**

---

## 📅 PASO 3: Ir al Carrito y Asignar Fechas

1. Ve a `/carrito`
2. **Verifica en consola si se ejecuta la migración:**

Busca estos mensajes:
```
🔄 Actualizando producto sin stock: ...
✅ Stock actualizado: ...
```

3. **En el carrito, selecciona una fecha dentro de 10 días**

Por ejemplo, si hoy es 17 de noviembre, selecciona:
- Fecha inicio: `2025-11-27` (10 días)
- Fecha fin: `2025-11-28`

4. Click en el campo de fecha y cambia la fecha

---

## ✅ RESULTADO ESPERADO

Cuando cambies la fecha de inicio a una fecha < 30 días:

```
❌ Toast de error:
"Este producto no tiene stock disponible. Para reservas con menos 
de 30 días de antelación, necesitamos tenerlo en stock. Por favor, 
contacta con nosotros o selecciona una fecha posterior."
```

---

## 🔍 DEBUGGING

Si NO aparece el error, ejecuta esto en la consola:

```javascript
// 1. Ver el carrito
const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
console.log('=== ANÁLISIS DEL CARRITO ===');
console.log('Productos:', cart.length);

cart.forEach((item, i) => {
    console.log(`\nProducto ${i + 1}:`);
    console.log('  Nombre:', item.product?.name);
    console.log('  ID:', item.productId);
    console.log('  Stock:', item.product?.stock);
    console.log('  RealStock:', item.product?.realStock);
    console.log('  Tiene stock definido:', item.product?.stock !== undefined || item.product?.realStock !== undefined);
});

// 2. Simular validación
const item = cart[0];
if (item) {
    const productStock = item.product?.stock || item.product?.realStock || 0;
    console.log('\n=== SIMULACIÓN DE VALIDACIÓN ===');
    console.log('Stock del producto:', productStock);
    
    const testDate = '2025-11-27'; // Ajusta a 10 días desde hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(testDate);
    start.setHours(0, 0, 0, 0);
    const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('Fecha seleccionada:', testDate);
    console.log('Días de antelación:', daysUntilStart);
    console.log('Stock es 0:', productStock === 0);
    console.log('Días < 30:', daysUntilStart < 30);
    console.log('DEBE RECHAZAR:', productStock === 0 && daysUntilStart < 30);
}
```

---

## 📸 COPIA LOS RESULTADOS

Después de ejecutar el debugging, **copia TODO el output de la consola** y compártelo.

---

## 🆘 SI NADA FUNCIONA

Ejecuta esto para crear un reporte completo:

```javascript
const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
const report = {
    timestamp: new Date().toISOString(),
    cartLength: cart.length,
    products: cart.map(item => ({
        name: item.product?.name,
        id: item.productId,
        stock: item.product?.stock,
        realStock: item.product?.realStock,
        hasStockData: item.product?.stock !== undefined || item.product?.realStock !== undefined,
        startDate: item.startDate,
        endDate: item.endDate
    }))
};
console.log('📋 REPORTE COMPLETO:');
console.log(JSON.stringify(report, null, 2));
```

Copia el JSON que aparece y compártelo.
