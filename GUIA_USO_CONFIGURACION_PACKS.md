# 📦 GUÍA DE USO: CONFIGURACIÓN DE PACKS

_Cómo configurar packs recomendados para cada tipo de evento_

---

## ✅ **IMPLEMENTACIÓN COMPLETA**

Se han implementado todos los componentes visuales para configurar packs desde el panel de administración.

### **Archivos Creados:**
```
✅ PackSelector.tsx
✅ PackRecommendationEditor.tsx
✅ Integración en CalculatorManagerNew.tsx
✅ Tipos actualizados en calculator.types.ts
✅ Lógica de recomendación en EventCalculatorPage.tsx
```

---

## 🎯 **CÓMO USAR**

### **Paso 1: Crear Packs**

Antes de configurar, necesitas tener packs creados:

1. **Admin → Productos**
2. **Click "Crear Producto"**
3. **Rellenar información del pack**
4. **✅ Marcar "Es Pack"**
5. **Añadir componentes del pack**
6. **Guardar**

---

### **Paso 2: Ir al Gestor de Calculadora**

1. **Admin → Gestor de Calculadora**
2. **Seleccionar tipo de evento** (Ej: "Boda")
3. **Scroll hacia abajo** hasta la sección **"📦 Configuración de Packs"**

---

### **Paso 3: Seleccionar Packs Disponibles**

En la sección **"Packs Disponibles para este Evento"**:

```
✅ Marca los packs que quieres que estén disponibles
   para este tipo de evento

Por ejemplo, para "Bodas":
☑️ Pack Boda Básico
☑️ Pack Boda Premium
☑️ Pack Boda Luxury
☐ Pack Concierto (no relevante para bodas)
```

**Resultado:**
- Solo los packs marcados aparecerán en la calculadora
- Los clientes solo verán opciones relevantes para su tipo de evento

---

### **Paso 4: Configurar Recomendaciones**

En la sección **"Reglas de Recomendación"**:

#### **A. Añadir Nueva Regla**

Click en **"+ Añadir Regla de Recomendación"**

#### **B. Configurar la Regla**

```
1. Pack a Recomendar: [Seleccionar pack]
   Ejemplo: Pack Boda Básico

2. Mínimo Asistentes: 0
   Máximo Asistentes: 100
   → Se recomendará para eventos de 0-100 personas

3. Prioridad: 1
   → Cuanto menor el número, mayor prioridad
   → Prioridad 1 = se muestra primero

4. Razón (opcional): "Perfecto para bodas íntimas"
   → Texto que verá el cliente explicando por qué se recomienda
```

#### **C. Ejemplo Completo para Bodas**

```
Regla 1:
├─ Pack: Pack Boda Básico
├─ Asistentes: 0 - 100
├─ Prioridad: 1
└─ Razón: "Perfecto para bodas íntimas"

Regla 2:
├─ Pack: Pack Boda Premium
├─ Asistentes: 100 - 200
├─ Prioridad: 1
└─ Razón: "Ideal para bodas medianas"

Regla 3:
├─ Pack: Pack Boda Luxury
├─ Asistentes: 200 - 9999
├─ Prioridad: 1
└─ Razón: "Para grandes celebraciones"
```

---

### **Paso 5: Guardar**

Click en **"💾 Guardar Cambios"** (botón arriba a la derecha)

---

## 🎨 **LO QUE VERÁ EL CLIENTE**

### **En la Calculadora (Step 4):**

```
Cliente selecciona "Boda" y indica "150 personas"

La calculadora muestra:

✨ Packs Recomendados para tu evento
┌────────────────────────────────────┐
│ 📦 Pack Boda Premium               │
│ ⭐ Recomendado                      │
│                                    │
│ Ideal para bodas medianas          │
│                                    │
│ €450/día • 5 disponibles           │
│ [Checkbox seleccionado]            │
└────────────────────────────────────┘

📦 Otros Packs Disponibles
┌────────────────────────────────────┐
│ Pack Boda Básico                   │
│ €250/día                           │
│ [Checkbox]                         │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Pack Boda Luxury                   │
│ €800/día                           │
│ [Checkbox]                         │
└────────────────────────────────────┘
```

---

## 🎯 **CASOS DE USO**

### **Caso 1: Evento con rangos claros**

**Boda:**
- 0-100 personas → Pack Básico
- 100-200 personas → Pack Premium
- 200+ personas → Pack Luxury

### **Caso 2: Evento con un solo pack recomendado**

**Concierto:**
- 0-99999 personas → Pack Concierto Profesional
- (Siempre se recomienda el mismo, independiente del tamaño)

### **Caso 3: Sin recomendaciones**

**Evento Corporativo:**
- Disponibles: Pack A, Pack B, Pack C
- Sin reglas de recomendación
- (Todos aparecen en "Otros Packs Disponibles")

---

## ⚙️ **CARACTERÍSTICAS AVANZADAS**

### **Múltiples Reglas para el Mismo Rango**

Puedes tener varias reglas para el mismo rango con diferentes prioridades:

```
Asistentes: 100-200

Regla A:
├─ Pack Premium Sonido
├─ Prioridad: 1  ← Se muestra primero
└─ "Mejor calidad de audio"

Regla B:
├─ Pack Premium Iluminación
├─ Prioridad: 2  ← Se muestra segundo
└─ "Iluminación profesional"
```

### **Solapamiento de Rangos**

Si los rangos se solapan, se muestran TODAS las reglas que apliquen:

```
Cliente: 150 personas

Regla 1: 100-200 → Pack A ✅
Regla 2: 150-300 → Pack B ✅
Regla 3: 0-100 → Pack C ❌

Resultado: Se recomiendan Pack A y Pack B
```

---

## 🧪 **TESTING**

### **Test 1: Verificar Filtrado**

```
1. Config: Boda tiene 3 packs disponibles
2. Cliente: Selecciona "Boda" en calculadora
3. Esperado: Solo esos 3 packs aparecen en Step 4
4. Otros packs del catálogo NO aparecen ✅
```

### **Test 2: Verificar Recomendación**

```
1. Config: Pack A recomendado para 0-100
2. Cliente: Boda, 50 personas
3. Esperado: Pack A aparece en "✨ Packs Recomendados"
4. Otros aparecen en "📦 Otros Packs"
```

### **Test 3: Verificar Razón**

```
1. Config: Razón = "Perfecto para bodas íntimas"
2. Cliente: Ve el pack recomendado
3. Esperado: Texto aparece debajo del nombre ✅
```

### **Test 4: Múltiples Recomendaciones**

```
1. Config: 2 reglas para 100-200 personas
2. Cliente: 150 personas
3. Esperado: Ambos packs en "Recomendados"
4. Ordenados por prioridad (1 primero, 2 después)
```

---

## ⚠️ **VALIDACIONES**

### **1. Pack No Disponible**

Si una regla usa un pack que NO está en disponibles:

```
❌ Warning en la interfaz:
"⚠️ Este pack no está en la lista de packs disponibles"

Fondo rojo en la regla
```

**Solución:** Añadir el pack a la lista de disponibles

### **2. Sin Packs Disponibles**

Si no hay packs marcados:

```
📦 Reglas de Recomendación
┌────────────────────────────────────┐
│ ⚠️ Primero selecciona packs        │
│    disponibles arriba              │
└────────────────────────────────────┘
```

### **3. Sin Packs en el Catálogo**

Si no hay packs creados:

```
📦 Packs Disponibles
┌────────────────────────────────────┐
│ 📦 No hay packs disponibles        │
│ Crea packs en "Gestión de         │
│ Productos"                         │
└────────────────────────────────────┘
```

---

## 🎓 **TIPS Y MEJORES PRÁCTICAS**

### **✅ DO (Hacer)**

1. **Usar rangos lógicos**
   - 0-100, 100-200, 200-500
   - Sin gaps entre rangos

2. **Razones descriptivas**
   - "Perfecto para bodas íntimas"
   - "Ideal para grandes eventos"
   - NO: "Pack bueno", "Comprar este"

3. **Prioridades claras**
   - 1 para el más recomendado
   - 2, 3, etc. para alternativas

4. **Mantener actualizado**
   - Revisar cuando añadas nuevos packs
   - Actualizar precios en razones si cambian

### **❌ DON'T (No hacer)**

1. **Rangos inconsistentes**
   - ❌ 0-100, 150-200 (gap de 100-150)

2. **Demasiadas reglas**
   - ❌ 10 packs recomendados para el mismo rango
   - ✅ Máximo 3-4 recomendaciones

3. **Razones genéricas**
   - ❌ "Pack bueno"
   - ✅ "Incluye sonido premium y DJ profesional"

4. **Olvidar guardar**
   - Siempre click en "Guardar Cambios"

---

## 📊 **EJEMPLO REAL COMPLETO**

### **Configuración: Bodas**

```json
{
  "eventType": "Boda",
  "availablePacks": [
    "pack-boda-basico-2024",
    "pack-boda-premium-2024",
    "pack-boda-luxury-2024",
    "pack-ceremonia-civil"
  ],
  "recommendedPacks": [
    {
      "packId": "pack-boda-basico-2024",
      "minAttendees": 0,
      "maxAttendees": 100,
      "priority": 1,
      "reason": "Perfecto para bodas íntimas con ceremonia y cóctel"
    },
    {
      "packId": "pack-ceremonia-civil",
      "minAttendees": 0,
      "maxAttendees": 50,
      "priority": 2,
      "reason": "Ideal para ceremonias pequeñas"
    },
    {
      "packId": "pack-boda-premium-2024",
      "minAttendees": 100,
      "maxAttendees": 200,
      "priority": 1,
      "reason": "Ideal para bodas medianas con banquete completo"
    },
    {
      "packId": "pack-boda-luxury-2024",
      "minAttendees": 200,
      "maxAttendees": 9999,
      "priority": 1,
      "reason": "Para grandes celebraciones con iluminación arquitectónica"
    }
  ]
}
```

### **Resultado para Cliente:**

**50 personas:**
- ✨ Pack Boda Básico (Prioridad 1)
- ✨ Pack Ceremonia Civil (Prioridad 2)
- 📦 Pack Boda Premium
- 📦 Pack Boda Luxury

**150 personas:**
- ✨ Pack Boda Premium
- 📦 Pack Boda Básico
- 📦 Pack Boda Luxury
- 📦 Pack Ceremonia Civil

**300 personas:**
- ✨ Pack Boda Luxury
- 📦 Pack Boda Básico
- 📦 Pack Boda Premium
- 📦 Pack Ceremonia Civil

---

## 🎉 **¡TODO LISTO!**

Ahora puedes:
- ✅ Configurar packs por tipo de evento
- ✅ Recomendar packs según asistentes
- ✅ Personalizar razones de recomendación
- ✅ Controlar qué ve cada cliente
- ✅ Todo desde el panel de admin

---

**¿Preguntas? Revisa la documentación en `CONFIGURACION_PACKS_ADMIN.md`**
