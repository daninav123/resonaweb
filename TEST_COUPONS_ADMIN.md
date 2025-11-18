# TEST E2E - Admin UI de Cupones

## ✅ Tarea 1.1: Admin UI de Cupones

### Test: CRUD de Cupones desde Admin

1. **Login como Admin**
```bash
# Navegar a: http://localhost:3000/login
# Credenciales:
Email: admin@resona.com
Password: admin123
```

2. **Navegar a Gestión de Cupones**
```bash
# Ir a: http://localhost:3000/admin/coupons
```

3. **Crear Nuevo Cupón**
```bash
# Click en "Nuevo Cupón"
# Rellenar:
- Código: TEST2025
- Descripción: Cupón de prueba 20%
- Tipo: Porcentaje
- Valor: 20
- Monto Mínimo: 50
- Límite de Usos: 100
- Válido Desde: Hoy
- Válido Hasta: +30 días
- ✅ Activo

# Click en "Crear"
```

4. **Verificar Cupón Creado**
```bash
# Verificar en la tabla:
- ✅ Aparece TEST2025
- ✅ Muestra 20%
- ✅ Estado: Activo
- ✅ Usos: 0 / 100
```

5. **Editar Cupón**
```bash
# Click en icono editar
# Cambiar valor a 25%
# Click "Actualizar"
# Verificar: Ahora muestra 25%
```

6. **Eliminar Cupón**
```bash
# Click en icono eliminar
# Confirmar eliminación
# Verificar: Cupón ya no aparece en lista
```

### Resultado Esperado:
- ✅ Admin puede acceder a /admin/coupons
- ✅ Puede crear cupones nuevos
- ✅ Puede editar cupones existentes
- ✅ Puede eliminar cupones
- ✅ Los cambios se reflejan en la tabla

### Verificación en Base de Datos:
```bash
cd packages/backend
npx prisma studio
# Ir a tabla Coupon
# Verificar que los cupones creados están ahí
```

---

## ✅ Tarea 1.2: Integración en Checkout

### Test: Aplicar Cupón en Checkout

1. **Crear Cupón de Prueba**
```bash
POST http://localhost:3001/api/v1/coupons
Authorization: Bearer ADMIN_TOKEN
{
  "code": "CHECKOUT20",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "scope": "ALL_PRODUCTS",
  "minimumAmount": 0,
  "isActive": true,
  "validFrom": "2025-11-01",
  "validTo": "2025-12-31"
}
```

2. **Añadir Productos al Carrito**
```bash
# Ir a: http://localhost:3000/productos
# Añadir 2-3 productos al carrito
# Verificar total > €50
```

3. **Ir a Checkout**
```bash
# Click en carrito
# Click "Proceder al Pago"
# URL: http://localhost:3000/checkout
```

4. **Aplicar Cupón**
```bash
# En sección "Resumen del Pedido"
# Buscar campo "¿Tienes un cupón de descuento?"
# Introducir: CHECKOUT20
# Click "Aplicar"
```

5. **Verificar Descuento Aplicado**
```bash
# Verificar:
- ✅ Mensaje "¡Cupón aplicado!"
- ✅ Aparece línea de descuento: -20%
- ✅ Total se actualiza con descuento
- ✅ Cupón aparece como aplicado
```

6. **Completar Orden**
```bash
# Rellenar datos de envío
# Completar pedido
# Verificar en orden creada:
- ✅ couponCode: "CHECKOUT20"
- ✅ discountAmount: (valor calculado)
```

### Resultado Esperado:
- ✅ CouponInput aparece en checkout
- ✅ Valida cupón correctamente
- ✅ Aplica descuento al total
- ✅ Guarda cupón en la orden

---

## Estado Actual: ✅ FASE 1 COMPLETADA

### Completado:
1. ✅ Admin UI de Cupones funcional
2. ✅ Integración en Checkout funcional
3. ✅ Cupones validándose correctamente
4. ✅ Descuentos aplicándose al total

### Progreso:
```
Antes:  65%
Ahora:  80% (+15%)
```

### Siguiente: FASE 2 - Gestión de Stock UI
