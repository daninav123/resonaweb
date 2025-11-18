# 🚀 IMPLEMENTACIÓN: GESTOR AVANZADO DE CALCULADORA

## ✅ ARCHIVOS YA CREADOS

1. ✅ **calculator.types.ts** - Tipos y configuración por defecto
   - Ubicación: `packages/frontend/src/types/calculator.types.ts`
   - Contiene toda la estructura de datos

---

## 📝 PRÓXIMOS PASOS

### **OPCIÓN 1: USAR EL GESTOR ACTUAL MEJORADO**

El CalculatorManager.tsx actual ya funciona. Solo necesitas:

1. **Reemplazar completamente** el archivo CalculatorManager.tsx con este contenido:

```
Archivo: packages/frontend/src/pages/admin/CalculatorManager.tsx
URL repo: https://github.com/Daniel-Navarro-Campos/mywed360
```

Te envío el contenido completo en el siguiente mensaje.

---

### **OPCIÓN 2: CREAR DESDE CERO**

Si prefieres crear un nuevo archivo limpio:

1. **Elimina** `CalculatorManager.tsx`
2. **Crea** `CalculatorManagerAdvanced.tsx`
3. **Actualiza** la ruta en `App.tsx`:
   ```typescript
   const CalculatorManager = lazy(() => import('./pages/admin/CalculatorManagerAdvanced'));
   ```

---

## 🎯 QUÉ NECESITAS

### **Componente Principal:**
```
packages/frontend/src/pages/admin/CalculatorManager.tsx
```

**Estructura:**
```typescript
import { calculator.types }
↓
Component con:
  - Sidebar (lista de tipos de eventos)
  - Editor de tipo de evento (icono, nombre, multiplicador)
  - Lista de partes (expandibles)
  - Editor de cada parte (icono, nombre, desc, duración, niveles)
  - Precios base (sidebar)
  - Botón guardar
```

---

## 📊 ESTRUCTURA DE DATOS

```typescript
{
  eventTypes: [
    {
      id: "boda",
      name: "Boda",
      icon: "💒",
      multiplier: 1.5,
      parts: [
        {
          id: "ceremony",
          name: "Ceremonia",
          icon: "💒",
          description: "...",
          defaultDuration: 1,
          soundLevel: "professional",
          lightingLevel: "basic"
        }
      ]
    }
  ],
  servicePrices: {
    sound: { basic: 100, ... },
    lighting: { basic: 80, ... }
  }
}
```

---

## 🎨 INTERFAZ ESPERADA

```
┌──────────────┬────────────────────────────────────┐
│ SIDEBAR      │ CONTENIDO PRINCIPAL               │
├──────────────┼────────────────────────────────────┤
│ Tipos:       │ 💒 BODA                           │
│ > 💒 Boda   │ Multiplicador: [1.5]              │
│   🎤 Conf    │                                    │
│   🎵 Conc    │ PARTES:                           │
│              │ ┌──────────────────────────────┐ │
│ [+ Añadir]   │ │ 💒 Ceremonia      [Expandir]│ │
│              │ └──────────────────────────────┘ │
│              │   Icono: [💒]                    │
│ Precios:     │   Nombre: [Ceremonia]            │
│ 🎵 Sonido    │   Duración: [1]h                 │
│  Básico: 100 │   Sonido: [Profesional ▼]       │
│  ...         │   Iluminación: [Básico ▼]       │
│              │                                    │
│ 💡 Ilum      │ [+ Añadir Parte]                 │
│  Básico: 80  │                                    │
│  ...         │                                    │
└──────────────┴────────────────────────────────────┘
```

---

## ⚙️ FUNCIONES CLAVE

```typescript
// Eventos
- addEventType()
- removeEventType(index)
- updateEventType(index, field, value)
- selectEvent(index)

// Partes
- addEventPart(eventIndex)
- removeEventPart(eventIndex, partIndex)
- updateEventPart(eventIndex, partIndex, field, value)
- togglePartExpanded(partId)

// Precios
- updateServicePrice(service, level, value)

// Guardar
- handleSave() → localStorage.setItem('advancedCalculatorConfig', ...)
```

---

## 🔧 PASOS PARA ARREGLAR ERRORES ACTUALES

El archivo CalculatorManager.tsx tiene errores porque está mezclando código viejo y nuevo.

### **SOLUCIÓN RÁPIDA:**

1. **Abre:** `packages/frontend/src/pages/admin/CalculatorManager.tsx`

2. **Busca y elimina** estas líneas (causan errores):
   ```typescript
   interface EventType { ... }  // Eliminar
   interface ServicePrices { ... }  // Eliminar  
   interface WeddingPart { ... }  // Eliminar
   interface CalculatorConfig { ... }  // Eliminar
   ```

3. **Asegúrate de tener solo:**
   ```typescript
   import { AdvancedCalculatorConfig, EventTypeConfig, EventPart, DEFAULT_CALCULATOR_CONFIG, SERVICE_LEVEL_LABELS } from '../../types/calculator.types';
   ```

4. **Actualiza imports de iconos:**
   ```typescript
   import { Calculator, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
   ```

5. **Guarda y verifica** que compila.

---

## 📂 ARCHIVOS FINALES

```
✅ types/calculator.types.ts              → Tipos
⏳ pages/admin/CalculatorManager.tsx      → Componente (necesita limpieza)
✅ App.tsx                                 → Ruta (ya configurada)
✅ pages/admin/Dashboard.tsx               → Enlace (ya configurado)
```

---

## 🎯 SIGUIENTE PASO

¿Quieres que:

**A)** Te envíe el contenido COMPLETO del CalculatorManager.tsx limpio y funcional para que lo copies

**B)** Te ayude a arreglar el archivo actual paso a paso

**C)** Creemos un archivo nuevo desde cero (CalculatorManagerAdvanced.tsx)

**Elige una opción y continúo** 🚀
