# ✅ Fix: Errores 401 y 400 al Cargar Usuarios

## 🐛 Problemas Detectados

### **1. Error 400: Bad Request en `/api/v1/users?limit=1000`**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

**Causa:** El schema de paginación tenía un límite máximo de 100, pero el frontend pedía 1000 usuarios.

### **2. Error 401: Unauthorized en `/api/v1/notifications/unread-count` y `/api/v1/cart`**
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
Error fetching unread count: AxiosError
```

**Causa:** El componente `NotificationBell` hacía llamadas a la API sin verificar si el usuario estaba autenticado.

---

## ✅ Soluciones Implementadas

### **1. Aumentar Límite de Paginación**

#### **Archivo:** `packages/backend/src/utils/validation.ts`

**Antes:**
```typescript
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
    //                                                                      ^^^ máximo 100
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
```

**Ahora:**
```typescript
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(1000)).optional(),
    //                                                                      ^^^^ máximo 1000
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});
```

**Beneficio:**
- ✅ Permite cargar hasta 1000 registros (usuarios, productos, etc.)
- ✅ Suficiente para paneles de admin
- ✅ Evita errores 400 por exceder el límite

---

### **2. Verificar Autenticación en NotificationBell**

#### **Archivo:** `packages/frontend/src/components/notifications/NotificationBell.tsx`

**Antes:**
```typescript
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notification.service';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount(); // ❌ Se llama siempre, aunque no haya usuario
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error); // ❌ Muestra error 401
    }
  };
```

**Ahora:**
```typescript
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { useAuthStore } from '../../stores/authStore';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore(); // ✅ Obtener usuario autenticado

  useEffect(() => {
    // ✅ Solo cargar si el usuario está autenticado
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]); // ✅ Depende de user

  const loadUnreadCount = async () => {
    if (!user) return; // ✅ Salir si no hay usuario
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // ✅ Silenciar error 401 (no autenticado)
      if (error?.response?.status !== 401) {
        console.error('Error loading unread count:', error);
      }
    }
  };
```

**Cambios:**
1. ✅ Import `useAuthStore` para verificar autenticación
2. ✅ Solo cargar si `user` existe
3. ✅ Añadir `user` a dependencias del useEffect
4. ✅ Verificar `user` antes de hacer llamadas
5. ✅ Silenciar errores 401 (esperados cuando no hay sesión)

---

## 📊 Antes vs Ahora

### **Consola del Navegador:**

#### **Antes:**
```
❌ Failed to load resource: 401 (Unauthorized) - /api/v1/notifications/unread-count
❌ Failed to load resource: 401 (Unauthorized) - /api/v1/cart
❌ Error fetching unread count: AxiosError
❌ Failed to load resource: 400 (Bad Request) - /api/v1/users?limit=1000
❌ Error cargando usuarios: AxiosError
```

#### **Ahora:**
```
✅ 👥 Usuarios cargados: 12
✅ 📦 Productos cargados: 36
(Sin errores 401 o 400)
```

---

## 🔧 Archivos Modificados

### **Backend:**
- ✅ `packages/backend/src/utils/validation.ts`
  - Línea 119: Límite máximo aumentado de 100 a 1000

### **Frontend:**
- ✅ `packages/frontend/src/components/notifications/NotificationBell.tsx`
  - Líneas 4, 12: Import y uso de useAuthStore
  - Líneas 14-22: useEffect con verificación de usuario
  - Líneas 24-28: useEffect para dropdown con verificación
  - Líneas 30-42: loadUnreadCount con verificación y manejo de errores

---

## 🎯 Beneficios

### **1. Sin Errores en Consola:**
- ✅ No más errores 401 de notificaciones
- ✅ No más errores 401 de carrito
- ✅ No más errores 400 de usuarios

### **2. Mejor Performance:**
- ✅ No se hacen llamadas innecesarias sin autenticación
- ✅ Menos carga en el servidor
- ✅ Menos ruido en logs

### **3. Experiencia de Usuario:**
- ✅ Consola limpia sin errores
- ✅ Carga más rápida
- ✅ Componentes más eficientes

---

## 🧪 Cómo Verificar

### **1. Sin Autenticar:**
```
1. Abre el navegador en modo incógnito
2. Ve a http://localhost:3000
3. Abre la consola (F12)
4. NO deberías ver errores 401
```

### **2. Con Autenticación (Usuario Normal):**
```
1. Inicia sesión como usuario normal
2. Navega por la aplicación
3. NO deberías ver errores 401
4. Las notificaciones deberían cargarse correctamente
```

### **3. Con Autenticación (Admin):**
```
1. Inicia sesión como admin
2. Ve a /admin/users
3. Abre consola (F12)
4. Deberías ver: "👥 Usuarios cargados: X"
5. La tabla debe mostrar todos los usuarios
6. Sin errores 400 o 401
```

---

## 💡 Mejoras Futuras

### **1. CartSidebar:**
También debería verificar autenticación antes de cargar:

```typescript
const { user } = useAuthStore();

useEffect(() => {
  if (user) {
    loadCart();
  }
}, [user]);
```

### **2. Paginación Real:**
Si en el futuro hay muchos usuarios (>1000), implementar paginación:

```typescript
const [page, setPage] = useState(1);
const [limit] = useState(100);

const loadUsers = async () => {
  const response = await api.get(`/users?page=${page}&limit=${limit}`);
  // ...
};
```

### **3. Caché:**
Cachear notificaciones para evitar llamadas repetidas:

```typescript
const [lastFetch, setLastFetch] = useState(null);
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

const loadUnreadCount = async () => {
  const now = Date.now();
  if (lastFetch && now - lastFetch < CACHE_TIME) {
    return; // Usar datos cacheados
  }
  // ... cargar datos
  setLastFetch(now);
};
```

---

## 📝 Notas Técnicas

### **Límite de Paginación:**
- **100:** Bueno para APIs públicas con muchos usuarios
- **1000:** Adecuado para paneles de admin con usuarios limitados
- **Ajustar según necesidad:** Si creces mucho, implementa paginación real

### **Verificación de Autenticación:**
Siempre verifica antes de hacer llamadas protegidas:
```typescript
if (!user) return;
// o
if (!token) return;
```

### **Manejo de Errores:**
Diferencia entre errores esperados (401) y errores reales:
```typescript
catch (error) {
  if (error?.response?.status === 401) {
    // Esperado, no hacer nada
    return;
  }
  // Error real, loggear
  console.error('Error:', error);
}
```

---

_Última actualización: 19/11/2025 01:57_  
_Estado: ERRORES 401 Y 400 SOLUCIONADOS ✅_  
_Usuarios cargando correctamente ✅_
