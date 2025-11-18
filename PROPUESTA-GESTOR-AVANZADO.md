# 🎯 PROPUESTA: GESTOR AVANZADO DE CALCULADORA

## 📊 NUEVA ESTRUCTURA

### **CONCEPTO:**
Cada tipo de evento tiene sus propias PARTES, y cada parte tiene configuración específica.

```
BODA
  ├─ Ceremonia
  │   ├─ Sonido: Profesional (€350/día)
  │   ├─ Iluminación: Básico (€80/día)
  │   └─ Duración sugerida: 1 hora
  │
  ├─ Cóctel
  │   ├─ Sonido: Intermedio (€200/día)
  │   ├─ Iluminación: Premium (€500/día)
  │   └─ Duración sugerida: 2 horas
  │
  ├─ Banquete
  │   ├─ Sonido: Premium (€600/día)
  │   ├─ Iluminación: Profesional (€280/día)
  │   └─ Duración sugerida: 4 horas
  │
  └─ Disco/Fiesta
      ├─ Sonido: Premium (€600/día)
      ├─ Iluminación: Premium (€500/día)
      └─ Duración sugerida: 4 horas

CONFERENCIA
  ├─ Registro
  ├─ Ponencias
  ├─ Coffee Break
  └─ Networking

CONCIERTO
  ├─ Prueba de Sonido
  └─ Actuación Principal
```

---

## 🎨 INTERFAZ PROPUESTA

### **SIDEBAR (Izquierda):**
```
┌─────────────────────┐
│ TIPOS DE EVENTOS    │
├─────────────────────┤
│ > 💒 Boda          │ ← Seleccionado
│   🎤 Conferencia    │
│   🎵 Concierto      │
│   💼 Corporativo    │
│                     │
│ [+ Añadir Tipo]     │
└─────────────────────┘
```

### **CONTENIDO PRINCIPAL (Centro-Derecha):**
```
┌────────────────────────────────────────────┐
│ 💒 BODA                                    │
│ Multiplicador: [1.5]                       │
├────────────────────────────────────────────┤
│                                            │
│ PARTES DE ESTE EVENTO:                     │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ 💒 CEREMONIA                [Expandir]││
│ └────────────────────────────────────────┘│
│   ├─ Icono: [💒]                          │
│   ├─ Nombre: [Ceremonia]                  │
│   ├─ Descripción: [Ceremonia civil...]    │
│   ├─ Duración: [1] horas                  │
│   ├─ Sonido: [Profesional ▼]              │
│   └─ Iluminación: [Básico ▼]              │
│                                            │
│ ┌────────────────────────────────────────┐│
│ │ 🍸 CÓCTEL                  [Expandir]  ││
│ └────────────────────────────────────────┘│
│                                            │
│ [+ Añadir Parte]                           │
└────────────────────────────────────────────┘
```

---

## ⚙️ FUNCIONALIDADES

### **1. GESTIÓN DE TIPOS DE EVENTOS**
- ➕ Crear nuevo tipo
- ✏️ Editar nombre, icono, multiplicador
- 🗑️ Eliminar tipo

### **2. GESTIÓN DE PARTES POR EVENTO**
- ➕ Añadir parte al evento seleccionado
- ✏️ Editar cada parte:
  - Icono
  - Nombre
  - Descripción
  - Duración sugerida
  - Nivel de Sonido (Básico/Inter/Prof/Premium)
  - Nivel de Iluminación (Básico/Inter/Prof/Premium)
- 🗑️ Eliminar parte
- 🔄 Reordenar partes (drag & drop)

### **3. PRECIOS GLOBALES**
- Editar precios base de Sonido
- Editar precios base de Iluminación

---

## 💾 DATOS A GUARDAR

```typescript
{
  eventTypes: [
    {
      id: 'boda',
      name: 'Boda',
      icon: '💒',
      multiplier: 1.5,
      parts: [
        {
          id: 'ceremony',
          name: 'Ceremonia',
          icon: '💒',
          description: 'Ceremonia religiosa o civil',
          defaultDuration: 1,
          soundLevel: 'professional',
          lightingLevel: 'basic'
        }
      ]
    }
  ],
  servicePrices: {
    sound: { basic: 100, intermediate: 200, professional: 350, premium: 600 },
    lighting: { basic: 80, intermediate: 150, professional: 280, premium: 500 }
  }
}
```

---

## 🚀 PRÓXIMOS PASOS

1. ¿Te gusta este diseño?
2. ¿Quieres que lo implemente así?
3. ¿Algún cambio en la interfaz?

**Una vez confirmes, creo el componente completo.**
