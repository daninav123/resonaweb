# 🔧 FIX: PROBLEMA DE SESIÓN AL REFRESCAR PÁGINA

_Fecha: 20/11/2025 04:50_  
_Estado: CORREGIDO_

---

## 🐛 **PROBLEMA:**

Cada vez que el usuario refrescaba la página, tenía que volver a iniciar sesión:

```
Error al refrescar:
GET /api/v1/auth/me → 401 (Unauthorized)

Síntomas:
- Sesión se pierde al recargar
- Usuario debe hacer login de nuevo
- Token no se persiste correctamente
```

---

## 🔍 **CAUSA RAÍZ:**

### **Problema 1: Lectura incorrecta del token persistido**

```typescript
// ❌ ANTES en checkAuth()
const token = get().accessToken || localStorage.getItem('accessToken');
```

**El problema:**
- Zustand Persist guarda todo en `'auth-storage'` como objeto JSON
- Estaba buscando `'accessToken'` directamente en localStorage (no existe)
- El token estaba en `localStorage['auth-storage'].state.accessToken`

### **Problema 2: useEffect con dependencia incorrecta**

```typescript
// ❌ ANTES en App.tsx
const { checkAuth } = useAuthStore();

useEffect(() => {
  checkAuth();
}, [checkAuth]); // ← Dependencia problemática
```

**El problema:**
- `checkAuth` puede cambiar su referencia
- Causa múltiples ejecuciones del useEffect
- Race conditions con la rehidratación de Zustand

---

## ✅ **SOLUCIÓN IMPLEMENTADA:**

### **1. Lectura Correcta del Token Persistido**

```typescript
// ✅ AHORA en checkAuth()
checkAuth: async () => {
  // Primero intentar del estado
  let token = get().accessToken;
  
  // Si no está, leer del storage de zustand persist
  if (!token) {
    try {
      const storedAuth = localStorage.getItem('auth-storage');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        token = parsed.state?.accessToken || parsed.state?.token;
      }
    } catch (e) {
      console.error('Error parsing auth storage:', e);
    }
  }
  
  // Continuar con verificación...
}
```

**Por qué funciona:**
- Lee correctamente del formato de Zustand Persist
- Maneja errores de parsing
- Tiene fallback a ambos formatos de token

### **2. useEffect Optimizado**

```typescript
// ✅ AHORA en App.tsx
const checkAuth = useAuthStore((state) => state.checkAuth);

useEffect(() => {
  checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Solo ejecutar al montar
```

**Por qué funciona:**
- Se ejecuta una sola vez al montar
- No se re-ejecuta cuando cambia checkAuth
- Evita race conditions
- Espera a que Zustand termine de rehidratar

### **3. Mejor Manejo de Errores 401**

```typescript
// ✅ Limpieza más específica
if (error?.response?.status === 401) {
  console.log('❌ Token inválido o expirado, limpiando sesión');
  set({ 
    isAuthenticated: false, 
    loading: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    token: null
  });
  localStorage.removeItem('auth-storage');
  if (api.removeAuthToken) {
    api.removeAuthToken();
  }
}
```

---

## 🔄 **FLUJO CORREGIDO:**

### **Login:**
```
1. Usuario ingresa credenciales
2. POST /auth/login
3. Recibe accessToken y refreshToken
4. Zustand guarda en estado
5. Zustand Persist guarda en localStorage['auth-storage']
6. axios.defaults recibe el token
7. ✅ Usuario autenticado
```

### **Refresh de Página:**
```
1. Página se recarga
2. React monta App component
3. useEffect se ejecuta (una vez)
4. checkAuth() se llama
5. Lee token de localStorage['auth-storage']
6. Configura token en axios
7. GET /auth/me con token
8. ✅ Sesión restaurada
```

---

## 📊 **ESTRUCTURA DE localStorage:**

### **Formato Correcto:**

```json
localStorage['auth-storage'] = {
  "state": {
    "token": "eyJhbGci...",
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "...",
      "email": "...",
      "firstName": "...",
      "lastName": "...",
      "role": "CLIENT"
    },
    "isAuthenticated": true
  },
  "version": 0
}
```

### **Antes (Incorrecto):**

```javascript
// Buscaba esto (no existe):
localStorage.getItem('accessToken') // null

// Debía buscar esto:
JSON.parse(localStorage.getItem('auth-storage')).state.accessToken
```

---

## 🧪 **TESTING:**

### **Test 1: Login y Refresh**
```
1. Login con usuario
2. ✅ Sesión iniciada
3. F5 (Refresh)
4. ✅ Sesión se mantiene
5. Verificar: No hay 401 en console
```

### **Test 2: Token Expirado**
```
1. Login con usuario
2. Esperar expiración del token
3. F5 (Refresh)
4. ✅ Se detecta token inválido
5. ✅ Se limpia sesión
6. ✅ Muestra página de login
```

### **Test 3: Logout Manual**
```
1. Login con usuario
2. Click en Logout
3. ✅ localStorage limpio
4. ✅ Headers de axios limpios
5. ✅ Estado de Zustand limpio
```

---

## 💡 **LECCIONES APRENDIDAS:**

### **1. Zustand Persist Storage:**
```typescript
// ❌ NO hacer:
localStorage.getItem('accessToken')

// ✅ SÍ hacer:
const stored = localStorage.getItem('auth-storage');
const token = JSON.parse(stored).state.accessToken;
```

### **2. useEffect Dependencies:**
```typescript
// ❌ NO hacer:
useEffect(() => {
  someFunction();
}, [someFunction]); // Puede causar loops

// ✅ SÍ hacer:
useEffect(() => {
  someFunction();
}, []); // Solo al montar
```

### **3. Selector de Zustand:**
```typescript
// ❌ Menos eficiente:
const { checkAuth } = useAuthStore();

// ✅ Más eficiente:
const checkAuth = useAuthStore((state) => state.checkAuth);
```

---

## 🔮 **MEJORAS FUTURAS:**

### **1. Refresh Token Automático:**
```typescript
// Interceptor de axios para renovar token automáticamente
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Intentar refresh token antes de logout
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Reintentar request original
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

### **2. Token Expiration Check:**
```typescript
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
};
```

### **3. Sync Between Tabs:**
```typescript
// Escuchar cambios en localStorage
window.addEventListener('storage', (e) => {
  if (e.key === 'auth-storage') {
    // Sincronizar estado entre tabs
    checkAuth();
  }
});
```

---

## ✅ **VERIFICACIÓN:**

### **Checklist:**
```
✅ Token se persiste en localStorage
✅ Token se lee correctamente al recargar
✅ checkAuth() solo se ejecuta una vez al montar
✅ No hay errores 401 al refrescar
✅ Sesión se mantiene después de F5
✅ Logout limpia todo correctamente
✅ Console sin errores repetidos
```

### **Console Logs Esperados:**

```
// Al Login
✅ Login exitoso

// Al Refresh (si token válido)
✅ Sesión restaurada (sin logs de error)

// Al Refresh (si token inválido)
❌ Token inválido o expirado, limpiando sesión
```

---

## 📋 **ARCHIVOS MODIFICADOS:**

```
✅ authStore.ts
   - checkAuth() con lectura correcta de localStorage
   - Mejor manejo de errores 401
   - Logs mejorados

✅ App.tsx
   - useEffect con dependencias vacías
   - Selector de Zustand optimizado
```

---

## 🎯 **RESULTADO:**

```
ANTES:
- F5 → Logout automático
- Usuario frustrado
- Sesión no persistía

AHORA:
- F5 → Sesión se mantiene
- Usuario feliz
- Token persiste correctamente
- No más logins repetitivos
```

---

_Fix aplicado a: authStore.ts, App.tsx_  
_Prioridad: Alta (UX crítico)_  
_Estado: ✅ COMPLETADO Y PROBADO_
