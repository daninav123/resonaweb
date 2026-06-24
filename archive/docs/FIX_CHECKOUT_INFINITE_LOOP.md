# 🔄 FIX: LOOP INFINITO EN CHECKOUT

_Fecha: 20/11/2025 04:25_  
_Estado: CORREGIDO_

---

## 🐛 **PROBLEMA:**

```
Error en consola:
"Demasiadas peticiones, por favor intenta más tarde"

Página de checkout en loop infinito:
- Se refresca continuamente
- Nunca carga completamente
- Rate limit se activa
```

---

## 🔍 **CAUSA RAÍZ:**

### **useEffect con dependencia incorrecta**

```typescript
// ❌ ANTES - INCORRECTO
useEffect(() => {
  // ... código que valida carrito ...
  
  if (items.length === 0) {
    navigate('/carrito');  // ← Esto cambia navigate
    return;
  }
  
  // Más validaciones que también llaman navigate()
  
}, [navigate]);  // ← Dependencia de navigate
```

**El Problema:**

1. El `useEffect` depende de `navigate`
2. Dentro del `useEffect` se llama a `navigate('/carrito')`
3. Llamar a `navigate` puede causar que cambie la referencia de `navigate`
4. Al cambiar `navigate`, el `useEffect` se ejecuta de nuevo
5. Loop infinito 🔄

**Ciclo del Loop:**
```
1. useEffect se ejecuta
   ↓
2. Llama navigate('/carrito')
   ↓
3. navigate cambia (o React piensa que cambia)
   ↓
4. useEffect detecta cambio en dependencia
   ↓
5. useEffect se ejecuta de nuevo
   ↓
(Volver al paso 2)
```

---

## ✅ **SOLUCIÓN:**

### **Cambiar dependencias a array vacío**

```typescript
// ✅ AHORA - CORRECTO
useEffect(() => {
  // ... código que valida carrito ...
  
  if (items.length === 0) {
    navigate('/carrito');
    return;
  }
  
  // Más validaciones...
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Solo ejecutar al montar el componente
```

**Por qué funciona:**

1. **Dependencias vacías `[]`** = Solo se ejecuta **una vez** al montar
2. No se re-ejecuta cuando cambian otras variables
3. La validación del carrito solo necesita ejecutarse al entrar a la página
4. No necesita re-validar continuamente

---

## 🔄 **COMPARACIÓN:**

### **ANTES (Loop Infinito):**

```typescript
useEffect(() => {
  const items = guestCart.getCart();
  
  if (items.length === 0) {
    navigate('/carrito');  // Causa loop
  }
}, [navigate]);  // ← Dependencia problemática
```

**Flujo:**
```
Mount → useEffect → navigate → 
navigate cambia → useEffect → navigate → 
navigate cambia → useEffect → navigate → 
... INFINITO
```

### **AHORA (Ejecuta Una Vez):**

```typescript
useEffect(() => {
  const items = guestCart.getCart();
  
  if (items.length === 0) {
    navigate('/carrito');  // Solo una vez
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);  // ← Solo al montar
```

**Flujo:**
```
Mount → useEffect → navigate → 
(fin - no se re-ejecuta)
```

---

## 💡 **REGLA GENERAL:**

### **Cuándo usar `[]` vs `[navigate]`:**

```typescript
// ✅ USA [] cuando:
useEffect(() => {
  // - Solo necesitas ejecutar AL MONTAR
  // - Cargas datos iniciales
  // - Validaciones one-time
  // - Setup inicial
}, []);

// ⚠️ USA [navigate] cuando:
useEffect(() => {
  // - REALMENTE necesitas re-ejecutar si navigate cambia
  // - Nota: Esto es MUY RARO
  // - Casi nunca es necesario
}, [navigate]);

// ✅ MEJOR: No uses navigate como dependencia
// En su lugar, usa las variables que realmente importan:
useEffect(() => {
  if (someCondition) {
    navigate('/somewhere');
  }
}, [someCondition]); // Solo la condición, no navigate
```

---

## 🎯 **EN ESTE CASO:**

```typescript
// El useEffect valida el carrito al entrar a checkout
// Solo necesita ejecutarse UNA VEZ al montar
// Por tanto: dependencias vacías []

useEffect(() => {
  const items = guestCart.getCart();
  
  // Validaciones que solo importan al entrar:
  // 1. ¿Hay items?
  // 2. ¿Tienen fechas?
  // 3. ¿Son fechas válidas?
  
  // Si algo falla → navigate('/carrito')
  // Esto solo debe pasar UNA VEZ al montar
  
}, []); // Perfecto para este caso
```

---

## ⚠️ **NOTA IMPORTANTE:**

### **ESLint Warning:**

```
React Hook useEffect has a missing dependency: 'navigate'
```

**Por qué lo ignoramos:**
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

- ESLint sugiere añadir `navigate` a las dependencias
- Pero en este caso **causaría un loop infinito**
- Es seguro ignorar la advertencia aquí
- navigate es estable y no cambia (teoría)
- Pero React a veces piensa que sí cambia
- Para evitar problemas, usamos `[]`

---

## 🧪 **VERIFICACIÓN:**

Después del fix:

```
✅ Checkout carga una sola vez
✅ No hay loop infinito
✅ No hay rate limit
✅ Validaciones se ejecutan al entrar
✅ Si carrito vacío → redirige a /carrito UNA VEZ
✅ Si todo OK → muestra formulario
```

---

## 📊 **OTROS useEffects EN CHECKOUT:**

```typescript
// ✅ CORRECTO - Carga usuario cuando cambia
useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      firstName: user.firstName,
      email: user.email,
    }));
  }
}, [user]); // Dependencia: user (correcto)

// ✅ CORRECTO - Solo al montar
useEffect(() => {
  checkUserAuth();
}, []); // Solo una vez (correcto)

// ⚠️ CUIDADO - Muchas dependencias
useEffect(() => {
  calculateShipping();
}, [distance, items, delivery, ...]);
// OK si realmente necesitas recalcular
```

---

## ✅ **RESULTADO:**

```
ANTES:
- Loop infinito
- Demasiadas peticiones
- Página no usable

AHORA:
- Se carga una vez
- Validación correcta
- Checkout funcional
```

---

_Fix aplicado a: CheckoutPage.tsx_  
_Línea: 242_  
_Cambio: `[navigate]` → `[]`_  
_Estado: ✅ CORREGIDO_
