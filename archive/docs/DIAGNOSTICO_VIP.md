# 🔍 DIAGNÓSTICO VIP - GUÍA PASO A PASO

_Fecha: 19/11/2025 03:45_

---

## 🐛 **PROBLEMA REPORTADO:**

- ✅ Funciona un momento
- ❌ Al recargar la página deja de funcionar
- ✅ En panel admin sigue mostrando VIP
- ❌ Dropdown de niveles se ve mal

---

## ✅ **FIXES APLICADOS:**

1. **CSS del Dropdown:** Arreglado - ahora tiene ancho mínimo y opciones legibles
2. **Tests E2E:** Creados para diagnosticar

---

## 🔬 **DIAGNÓSTICO MANUAL - SIGUE ESTOS PASOS:**

### **PASO 1: Verificar userLevel en localStorage**

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Pega este código y presiona Enter:

```javascript
// Ver el auth storage
const authData = JSON.parse(localStorage.getItem('auth-storage'));
console.log('=== AUTH STORAGE ===');
console.log('Full data:', authData);
if (authData && authData.state && authData.state.user) {
  console.log('User:', authData.state.user);
  console.log('UserLevel:', authData.state.user.userLevel);
  console.log('Email:', authData.state.user.email);
} else {
  console.log('❌ NO USER DATA');
}
```

**¿Qué deberías ver?**
```
UserLevel: "VIP"
```

**Si ves `undefined` o `null`:**
- ❌ El problema es que el backend no está devolviendo userLevel

---

### **PASO 2: Verificar respuesta del backend**

1. En la consola del navegador, pega:

```javascript
// Obtener el token
const authData = JSON.parse(localStorage.getItem('auth-storage'));
const token = authData?.state?.accessToken;
console.log('Token:', token ? 'Exists' : 'Missing');

// Hacer llamada a /auth/me
fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== /auth/me RESPONSE ===');
  console.log(JSON.stringify(data, null, 2));
  if (data.user) {
    console.log('UserLevel in response:', data.user.userLevel);
  }
})
.catch(err => console.error('Error:', err));
```

**¿Qué deberías ver?**
```json
{
  "user": {
    "id": "...",
    "email": "danielnavarrocampos@icloud.com",
    "userLevel": "VIP",  // <-- DEBE ESTAR AQUÍ
    ...
  }
}
```

**Si NO ves `userLevel`:**
- ❌ El backend no está devolviendo el campo
- ✅ **SOLUCIÓN:** Reinicia el servidor backend

---

### **PASO 3: Verificar en tiempo real**

1. Con la consola abierta, ve a la pestaña "Network"
2. Filtra por "me" o "auth/me"
3. Recarga la página (F5)
4. Busca la petición a `/auth/me`
5. Haz clic en ella
6. Ve a la pestaña "Response"

**¿Qué deberías ver?**
```json
{
  "user": {
    "userLevel": "VIP"  // <-- DEBE ESTAR AQUÍ
  }
}
```

---

### **PASO 4: Test del Checkout**

1. Ve al checkout: `http://localhost:3000/checkout`
2. Abre la consola (F12)
3. Pega este código:

```javascript
// Verificar si hay user y su nivel
const checkVIP = () => {
  const authData = JSON.parse(localStorage.getItem('auth-storage'));
  const user = authData?.state?.user;
  
  console.log('=== VIP CHECK ===');
  console.log('User:', user);
  console.log('UserLevel:', user?.userLevel);
  console.log('Is VIP:', user?.userLevel === 'VIP' || user?.userLevel === 'VIP_PLUS');
  
  // Verificar elementos VIP en la página
  const vipAlert = document.querySelector('[class*="yellow"]');
  const discountText = document.body.innerText.includes('Descuento VIP');
  const deferredPayment = document.body.innerText.includes('Pago Diferido');
  
  console.log('VIP alert in DOM:', !!vipAlert);
  console.log('Discount text in page:', discountText);
  console.log('Deferred payment text in page:', deferredPayment);
};

checkVIP();
```

**¿Qué deberías ver?**
```
UserLevel: "VIP"
Is VIP: true
VIP alert in DOM: true
Discount text in page: true
Deferred payment text in page: true
```

---

## 🔧 **SOLUCIONES SEGÚN EL DIAGNÓSTICO:**

### **Problema 1: userLevel es `undefined` en localStorage**

**Causa:** El backend no devuelve userLevel en `/auth/me`

**Solución:**
```bash
# Reiniciar el servidor backend
cd packages/backend
# Detener el servidor (Ctrl+C)
npm run dev
```

---

### **Problema 2: userLevel está en localStorage pero no en el checkout**

**Causa:** El frontend no está leyendo correctamente el userLevel

**Solución:**
1. Borra la caché del navegador (Ctrl + Shift + Delete)
2. Cierra sesión
3. Inicia sesión de nuevo
4. Ve al checkout

---

### **Problema 3: Backend devuelve userLevel pero se pierde al recargar**

**Causa:** El `checkAuth()` sobrescribe el user sin userLevel

**Diagnóstico avanzado:**
```javascript
// En la consola, antes de recargar:
const before = JSON.parse(localStorage.getItem('auth-storage'));
console.log('BEFORE:', before.state.user.userLevel);

// Recarga la página (F5)

// Después de recargar, en la consola:
const after = JSON.parse(localStorage.getItem('auth-storage'));
console.log('AFTER:', after.state.user.userLevel);

// ¿Son iguales?
```

**Solución:**
```bash
# El backend ya está arreglado, solo necesitas reiniciarlo
cd packages/backend
npm run dev
```

---

## 🧪 **EJECUTAR TESTS E2E**

```bash
cd packages/frontend

# Test de debug básico
npx playwright test tests/e2e/vip-system.spec.ts -g "Check authStore" --headed

# Test de network requests
npx playwright test tests/e2e/vip-system.spec.ts -g "Network requests" --headed

# Test de elementos VIP en DOM
npx playwright test tests/e2e/vip-system.spec.ts -g "Check VIP elements" --headed
```

---

## 📋 **CHECKLIST DE VERIFICACIÓN:**

Antes de reportar el problema de nuevo, verifica:

- [ ] Servidor backend reiniciado
- [ ] Servidor frontend reiniciado  
- [ ] Caché del navegador borrada
- [ ] Sesión cerrada y reiniciada
- [ ] localStorage tiene `userLevel: "VIP"`
- [ ] `/auth/me` devuelve `userLevel: "VIP"`
- [ ] Dropdown de niveles se ve bien
- [ ] Checkout muestra alerta VIP
- [ ] Checkout muestra descuento 50%
- [ ] Checkout muestra "€0.00" a pagar ahora

---

## 🎯 **EJECUCIÓN RÁPIDA:**

Pega este código completo en la consola del navegador:

```javascript
(async () => {
  console.clear();
  console.log('🔍 DIAGNÓSTICO VIP COMPLETO\n');
  
  // 1. Check localStorage
  const authData = JSON.parse(localStorage.getItem('auth-storage'));
  const user = authData?.state?.user;
  const token = authData?.state?.accessToken;
  
  console.log('1️⃣ LOCAL STORAGE:');
  console.log('   User:', user?.email);
  console.log('   UserLevel:', user?.userLevel);
  console.log('   Token:', token ? 'EXISTS' : 'MISSING');
  console.log('');
  
  // 2. Check backend
  if (token) {
    console.log('2️⃣ BACKEND /auth/me:');
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('   Status:', response.status);
      console.log('   UserLevel:', data.user?.userLevel);
      console.log('   Full response:', data);
      console.log('');
    } catch (err) {
      console.error('   ERROR:', err.message);
      console.log('');
    }
  }
  
  // 3. Check DOM
  console.log('3️⃣ DOM ELEMENTS:');
  const pageText = document.body.innerText;
  console.log('   VIP text:', pageText.includes('VIP'));
  console.log('   Discount text:', pageText.includes('Descuento'));
  console.log('   Deferred payment:', pageText.includes('Diferido'));
  console.log('');
  
  // 4. Conclusion
  console.log('🎯 CONCLUSIÓN:');
  if (user?.userLevel === 'VIP') {
    console.log('   ✅ userLevel está en localStorage');
  } else {
    console.log('   ❌ userLevel NO está en localStorage');
    console.log('   💡 SOLUCIÓN: Reinicia backend y vuelve a iniciar sesión');
  }
})();
```

---

## 📞 **REPORTAR RESULTADOS:**

Después de ejecutar el diagnóstico, reporta:

1. ¿Qué dice "LOCAL STORAGE - UserLevel"?
2. ¿Qué dice "BACKEND /auth/me - UserLevel"?
3. ¿Los textos VIP aparecen en el DOM?
4. Screenshot del resultado del diagnóstico completo

---

_Diagnóstico creado: 19/11/2025 03:45_  
_Tests E2E: `tests/e2e/vip-system.spec.ts`_
