# 🌟 Cómo Convertir un Usuario en VIP

## 📋 Guía Completa para Administradores

---

## 🎯 Método 1: Desde el Panel de Admin (Recomendado)

### **Pasos:**

1. **Inicia sesión como admin**
   ```
   http://localhost:3000/login
   ```

2. **Ve al panel de usuarios**
   ```
   http://localhost:3000/admin/users
   ```

3. **Encuentra el usuario**
   - Busca el usuario en la lista
   - Verás todas sus columnas: Nombre, Rol, **Nivel**, Estado, Fecha

4. **Cambia el nivel usando el selector**
   - En la columna "Nivel", verás un selector dropdown
   - Opciones disponibles:
     - **Standard** (usuario normal)
     - **⭐ VIP (50% dto)** - Descuento 50% + Sin fianza
     - **👑 VIP PLUS (70% dto)** - Descuento 70% + Sin fianza

5. **Selecciona el nivel deseado**
   - Click en el dropdown
   - Selecciona VIP o VIP PLUS
   - El cambio se guarda automáticamente

6. **Confirmación**
   - Verás un mensaje: "Nivel de usuario actualizado a VIP"
   - El color del selector cambiará:
     - **Gris:** Standard
     - **Amarillo-Naranja:** ⭐ VIP
     - **Púrpura-Rosa:** 👑 VIP PLUS

---

## 🎨 Interfaz Visual

### **Lista de Usuarios:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Usuario         │ Rol     │ Nivel              │ Estado │ Fecha │
├─────────────────────────────────────────────────────────────────┤
│ John Doe        │ Cliente │ [Standard ▼]       │ Activo │ ...   │
│ john@email.com  │         │                     │        │       │
├─────────────────────────────────────────────────────────────────┤
│ María García    │ Cliente │ [⭐ VIP ▼]         │ Activo │ ...   │
│ maria@email.com │         │                     │        │       │
├─────────────────────────────────────────────────────────────────┤
│ Pedro López     │ Cliente │ [👑 VIP PLUS ▼]   │ Activo │ ...   │
│ pedro@email.com │         │                     │        │       │
└─────────────────────────────────────────────────────────────────┘
```

### **Selector Desplegado:**
```
┌────────────────────────┐
│ Nivel:                 │
│ ┌────────────────────┐│
│ │ Standard           ││
│ │ ⭐ VIP (50% dto)   ││ ← Click para cambiar
│ │ 👑 VIP PLUS (70%)  ││
│ └────────────────────┘│
└────────────────────────┘
```

---

## 🔧 Método 2: Desde Prisma Studio (Desarrollo)

### **Pasos:**

1. **Abre Prisma Studio**
   ```bash
   cd packages/backend
   npm run db:studio
   ```

2. **Navega a la tabla User**
   - Click en "User" en el menú lateral

3. **Encuentra el usuario**
   - Busca por email o nombre

4. **Edita el campo userLevel**
   - Click en el campo `userLevel`
   - Cambia el valor a:
     - `STANDARD` (normal)
     - `VIP` (50% descuento)
     - `VIP_PLUS` (70% descuento)

5. **Guarda los cambios**
   - Click en "Save 1 change"

---

## 💻 Método 3: SQL Directo (Avanzado)

### **Hacer un usuario VIP:**
```sql
UPDATE "User"
SET "userLevel" = 'VIP'
WHERE email = 'usuario@example.com';
```

### **Hacer un usuario VIP PLUS:**
```sql
UPDATE "User"
SET "userLevel" = 'VIP_PLUS'
WHERE email = 'usuario@example.com';
```

### **Volver a Standard:**
```sql
UPDATE "User"
SET "userLevel" = 'STANDARD'
WHERE email = 'usuario@example.com';
```

### **Ver todos los VIP:**
```sql
SELECT 
  "firstName",
  "lastName",
  email,
  "userLevel"
FROM "User"
WHERE "userLevel" IN ('VIP', 'VIP_PLUS')
ORDER BY "userLevel" DESC;
```

---

## 🔌 Método 4: API REST (Para Integraciones)

### **Endpoint:**
```
PATCH /api/v1/users/:userId/level
```

### **Headers:**
```json
{
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
```

### **Body:**
```json
{
  "userLevel": "VIP"
}
```

### **Ejemplo con cURL:**
```bash
curl -X PATCH http://localhost:3001/api/v1/users/user-id-123/level \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userLevel":"VIP"}'
```

### **Respuesta Exitosa:**
```json
{
  "message": "Usuario actualizado a nivel VIP",
  "data": {
    "id": "user-id-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userLevel": "VIP",
    "role": "CLIENT"
  }
}
```

---

## 📊 Niveles y Beneficios

### **STANDARD (Por defecto)**
```
Descuento:  0%
Fianza:     Sí (obligatoria)
Beneficios: Ninguno
Color:      Gris
```

### **VIP (⭐)**
```
Descuento:  50% en alquiler
Fianza:     NO (eliminada)
Beneficios: 
  - 50% de descuento en todos los productos
  - Sin fianza (€0)
  - Ahorro significativo
Color:      Amarillo-Naranja degradado
```

### **VIP PLUS (👑)**
```
Descuento:  70% en alquiler
Fianza:     NO (eliminada)
Beneficios:
  - 70% de descuento en todos los productos
  - Sin fianza (€0)
  - Máximo ahorro
Color:      Púrpura-Rosa degradado
```

---

## 💰 Ejemplo de Ahorro

### **Pedido de Ejemplo:**
```
Subtotal productos:  €1000
Envío:               €50
Instalación:         €100
────────────────────────
Subtotal:            €1150
```

### **Usuario STANDARD:**
```
Subtotal:            €1150
Descuento VIP:       €0
Fianza (en tienda):  €200
────────────────────────
Total a pagar:       €1150
Fianza adicional:    €200
TOTAL COMPLETO:      €1350
```

### **Usuario VIP:**
```
Subtotal productos:  €1000
Descuento VIP (50%): -€500
Envío:               €50
Instalación:         €100
────────────────────────
Total a pagar:       €650
Fianza:              €0 ✓
TOTAL COMPLETO:      €650
AHORRO:              €700 💰
```

### **Usuario VIP PLUS:**
```
Subtotal productos:  €1000
Descuento VIP (70%): -€700
Envío:               €50
Instalación:         €100
────────────────────────
Total a pagar:       €450
Fianza:              €0 ✓
TOTAL COMPLETO:      €450
AHORRO:              €900 💰
```

---

## 🔐 Seguridad

### **Permisos:**
- ✅ Solo ADMIN y SUPERADMIN pueden cambiar niveles
- ❌ Los usuarios normales NO pueden cambiar su propio nivel
- ✅ Todos los cambios quedan registrados en logs
- ✅ Autenticación requerida en todos los endpoints

### **Validación:**
```typescript
// Solo niveles válidos
'STANDARD' | 'VIP' | 'VIP_PLUS'

// Cualquier otro valor es rechazado
```

---

## 📝 Logs del Sistema

Cada cambio de nivel genera un log:

```
[INFO] User level updated: maria@example.com -> VIP
[INFO] User level updated: pedro@example.com -> VIP_PLUS
[INFO] User level updated: john@example.com -> STANDARD
```

---

## 🧪 Cómo Verificar el Cambio

### **1. En la Interfaz:**
```
1. Refresca la página de usuarios
2. El selector mostrará el nuevo nivel
3. El color habrá cambiado
```

### **2. En el Perfil del Usuario:**
```
1. El usuario inicia sesión
2. Ve a /cuenta
3. Verá su badge VIP en su perfil
```

### **3. En un Pedido:**
```
1. El usuario añade productos al carrito
2. Va al checkout
3. Verá el descuento VIP aplicado automáticamente
4. La sección de fianza NO aparecerá
```

---

## ⚠️ Notas Importantes

### **1. Cambio Inmediato:**
- El cambio es instantáneo
- No requiere que el usuario cierre sesión
- Se aplica en el siguiente pedido

### **2. Pedidos Anteriores:**
- Los pedidos ya creados NO se modifican
- El descuento solo aplica a nuevos pedidos

### **3. Reversión:**
- Puedes cambiar el nivel en cualquier momento
- No hay límites de cambios
- Puedes subir o bajar niveles libremente

### **4. Múltiples Usuarios:**
- Puedes hacer cambios masivos si es necesario
- Cada cambio es independiente
- No hay límite de usuarios VIP

---

## 🎯 Casos de Uso Comunes

### **1. Cliente Frecuente:**
```
Situación: Cliente hace muchos pedidos
Acción:    Cambiar a VIP como recompensa
Beneficio: Fidelización del cliente
```

### **2. Cliente Corporativo:**
```
Situación: Empresa con contrato
Acción:    Cambiar a VIP_PLUS
Beneficio: Precios especiales corporativos
```

### **3. Promoción Temporal:**
```
Situación: Campaña de marketing
Acción:    Cambiar grupo a VIP temporalmente
Beneficio: Incentivar ventas
```

### **4. Error de Facturación:**
```
Situación: Cliente pagó de más
Acción:    Cambiar a VIP para compensar
Beneficio: Satisfacción del cliente
```

---

## 🚀 Próximas Mejoras

### **Funcionalidades Futuras:**
- [ ] Fecha de expiración de VIP
- [ ] Auto-upgrade basado en gastos
- [ ] Notificación al usuario del cambio
- [ ] Historial de cambios de nivel
- [ ] Descuentos personalizados (%)
- [ ] Beneficios adicionales configurables

---

## 📚 Documentación Relacionada

- `SISTEMA_VIP_COMPLETO.md` - Especificaciones técnicas
- `FIX_USUARIOS_REALES_ADMIN.md` - Panel de usuarios
- `VERIFICACION_FINAL_TODO_FUNCIONANDO.md` - Testing general

---

## ❓ FAQ

### **¿Puedo tener usuarios VIP ilimitados?**
Sí, no hay límite. Puedes hacer VIP a todos los usuarios si quieres.

### **¿Los descuentos se aplican automáticamente?**
Sí, en cuanto cambies el nivel, el próximo pedido tendrá el descuento.

### **¿Puedo crear niveles personalizados?**
Por ahora solo STANDARD, VIP y VIP_PLUS. Para más niveles, hay que modificar el código.

### **¿Se puede automatizar el upgrade?**
Sí, se puede crear una tarea programada que auto-upgrade usuarios según criterios.

### **¿El usuario recibe una notificación?**
Actualmente no, pero se puede implementar fácilmente.

---

_Última actualización: 19/11/2025 02:03_  
_Método recomendado: Panel de Admin ✅_  
_Estado: Completamente Funcional 🚀_
