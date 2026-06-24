# 🚨 Sistema de Alertas de Stock

## 📋 Descripción

Nueva funcionalidad que **reemplaza el Catálogo Virtual** con un sistema inteligente de alertas de stock que detecta automáticamente cuándo necesitas comprar más inventario para cubrir pedidos confirmados.

---

## ✨ Características

### **Detección Automática**
- Analiza pedidos confirmados
- Compara con stock disponible
- Calcula conflictos de fechas
- Determina déficit exacto

### **Priorización Inteligente**
- **Alta**: Déficit > 5 unidades
- **Media**: Déficit 3-5 unidades  
- **Baja**: Déficit 1-2 unidades

### **Dashboard Completo**
- Total de alertas
- Alertas de alta prioridad
- Unidades faltantes totales
- Filtros por prioridad

---

## 🎯 Ejemplo de Uso

### Caso Real:
```
Pedido RES-2025-0015
Producto: Truss Aluminio 2m
Fecha: 31/12/2025

Solicitado: 10 unidades
Disponible: 4 unidades

⚠️ ALERTA: Necesitas comprar 6 unidades
```

---

## 🔧 Implementación

### **Backend**
```typescript
GET /api/v1/stock-alerts

Respuesta:
{
  "alerts": [
    {
      "productId": "...",
      "productName": "Truss Aluminio 2m",
      "sku": "SKU-...",
      "orderNumber": "RES-2025-0015",
      "startDate": "2025-12-31",
      "quantityRequested": 10,
      "availableStock": 4,
      "deficit": 6,
      "priority": "high"
    }
  ],
  "summary": {
    "totalAlerts": 15,
    "highPriority": 3,
    "totalDeficit": 45
  }
}
```

### **Frontend**
```
http://localhost:3000/admin/stock-alerts
```

---

## 📊 Interfaz

### **Estadísticas Principales**
- 🚨 **Total Alertas**: Número total de alertas activas
- 📈 **Alta Prioridad**: Alertas urgentes
- 📦 **Unidades Faltantes**: Total de unidades a comprar

### **Filtros**
- **Todas**: Ver todas las alertas
- **Alta**: Solo alertas críticas
- **Media**: Prioridad media
- **Baja**: Prioridad baja

### **Tarjetas de Alertas**
Cada alerta muestra:
- Nombre del producto y SKU
- Número de pedido
- Fecha del evento
- Stock disponible vs solicitado
- **Cantidad exacta a comprar**

---

## 🔄 Cambios Realizados

### ❌ **Eliminado**
- `/admin/on-demand` (Catálogo Virtual)
- Componente `OnDemandDashboard`

### ✅ **Añadido**
- `/admin/stock-alerts` (Alertas de Stock)
- Componente `StockAlerts`
- Backend route `/stock-alerts`
- Cálculo automático de déficit
- Sistema de prioridades

### 🔧 **Actualizado**
- `App.tsx`: Nueva ruta
- `Dashboard.tsx`: Nuevo enlace en menú
- Navegación del panel admin

---

## 🚀 Cómo Funciona

### **1. Detección**
```
Para cada pedido CONFIRMADO:
  Para cada producto en el pedido:
    1. Buscar pedidos que se solapan en fechas
    2. Calcular stock reservado
    3. Calcular stock disponible = stock total - reservado
    4. Si solicitado > disponible:
       ⚠️ Crear alerta con déficit
```

### **2. Priorización**
```
Déficit > 5 unidades  → Alta prioridad (rojo)
Déficit 3-5 unidades  → Media prioridad (amarillo)
Déficit 1-2 unidades  → Baja prioridad (azul)
```

### **3. Visualización**
```
Dashboard mostrando:
- Alertas ordenadas por prioridad
- Información completa del pedido
- Acción requerida (cantidad a comprar)
```

---

## 💡 Beneficios

### **Para el Negocio**
✅ Evita cancelaciones por falta de stock
✅ Planificación de compras basada en demanda real
✅ Optimización de inventario
✅ Mejor servicio al cliente

### **Para el Admin**
✅ Vista clara de necesidades
✅ Priorización automática
✅ Sin cálculos manuales
✅ Decisiones informadas

---

## 📱 Acceso Rápido

### **Desde el Dashboard Admin**
```
Panel Admin → Alertas de Stock (botón rojo con badge "Beta")
```

### **Directamente**
```
http://localhost:3000/admin/stock-alerts
```

---

## 🎨 Diseño

### **Colores por Prioridad**
- 🔴 **Alta**: Rojo (#DC2626)
- 🟡 **Media**: Amarillo (#CA8A04)
- 🔵 **Baja**: Azul (#2563EB)

### **Iconos**
- 🚨 AlertTriangle: Alertas
- 📈 TrendingUp: Prioridades
- 📦 Package: Unidades
- 🛒 ShoppingCart: Comprar

---

## 🔐 Seguridad

- ✅ Solo accesible para ADMIN y SUPERADMIN
- ✅ Autenticación requerida
- ✅ Cálculos en servidor
- ✅ Datos en tiempo real

---

## 📈 Próximas Mejoras

- [ ] Exportar lista de compras a PDF/Excel
- [ ] Integración con proveedores
- [ ] Historial de alertas resueltas
- [ ] Cálculo de costes estimados
- [ ] Notificaciones automáticas
- [ ] Sugerencias de compra por patrón

---

_Última actualización: 18/11/2025 19:50_
