# 📦 GUÍA: CÓMO CREAR PACKS DESDE EL PANEL ADMIN

_Fecha: 20/11/2025 03:34_  
_Estado: LISTO PARA USAR_

---

## 🎯 **OBJETIVO:**

Convertir productos existentes en **packs** y definir qué productos incluye cada pack, todo desde el panel de administración.

---

## 📋 **PASO A PASO:**

### **1. Editar un Producto Existente**

```
1. Ve al Panel Admin → Productos
2. Busca el producto que quieres convertir en pack
3. Click en el icono ✏️ (Editar)
4. Se abre el modal de edición
```

### **2. Marcar como Pack**

```
5. Baja hasta encontrar la checkbox:
   
   ┌─────────────────────────────────────┐
   │ ☑️ 🎁 Este producto es un Pack     │
   └─────────────────────────────────────┘

6. Marca la casilla
7. Aparece una nueva sección azul: "Componentes del Pack"
```

### **3. Añadir Componentes al Pack**

```
8. Click en "Añadir Componente"
9. Selecciona el producto del dropdown
10. Especifica la cantidad (ej: 2 para 2 unidades)
11. Click "Añadir"
12. El componente aparece en la lista
13. Repite para añadir más componentes
```

### **4. Guardar**

```
14. Click "Guardar Cambios"
15. ✅ El producto ahora es un pack con sus componentes
```

---

## 🎨 **INTERFAZ:**

### **Modal de Edición con Pack:**

```
┌──────────────────────────────────────────────┐
│ Editar Producto                         [X]  │
├──────────────────────────────────────────────┤
│                                              │
│ Nombre: Pack Boda Premium                   │
│ SKU: PACK-BODA-001                          │
│ Precio/día: €200                            │
│ ...                                          │
│                                              │
│ ☑️ 🎁 Este producto es un Pack              │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │ Componentes del Pack                 │    │
│ ├──────────────────────────────────────┤    │
│ │                                      │    │
│ │ 2x Luces LED                    [🗑️] │    │
│ │ 1x Sistema de Sonido            [🗑️] │    │
│ │ 4x Altavoces                    [🗑️] │    │
│ │                                      │    │
│ │ [+ Añadir Componente]                │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ [Cancelar] [Guardar Cambios]                │
└──────────────────────────────────────────────┘
```

### **Añadir Componente:**

```
┌──────────────────────────────────────────────┐
│ Componentes del Pack                         │
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐    │
│ │ Seleccionar producto...         [▼]  │    │
│ │ - Luces LED                          │    │
│ │ - Sistema de Sonido                  │    │
│ │ - Altavoces JBL                      │    │
│ │                                      │    │
│ │ Cantidad: [2]                        │    │
│ │                                      │    │
│ │ [Añadir] [Cancelar]                  │    │
│ └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

---

## 💡 **EJEMPLO COMPLETO:**

### **Situación:**
Tienes un producto llamado "Pack Boda Premium" que quieres convertir en pack.

### **Acción:**

**1. Estado Inicial:**
- Producto: "Pack Boda Premium"
- Precio: €200/día
- isPack: ❌ false

**2. Editar:**
- Click ✏️ en "Pack Boda Premium"
- Modal se abre

**3. Marcar como Pack:**
- ☑️ Este producto es un Pack
- Aparece sección de componentes

**4. Añadir Componentes:**

```
Click "Añadir Componente"
→ Seleccionar: "Luces LED"
→ Cantidad: 2
→ Click "Añadir"
→ Aparece: "2x Luces LED [🗑️]"

Click "Añadir Componente"
→ Seleccionar: "Sistema de Sonido"
→ Cantidad: 1
→ Click "Añadir"
→ Aparece: "1x Sistema de Sonido [🗑️]"

Click "Añadir Componente"
→ Seleccionar: "Altavoces"
→ Cantidad: 4
→ Click "Añadir"
→ Aparece: "4x Altavoces [🗑️]"
```

**5. Guardar:**
- Click "Guardar Cambios"
- ✅ Toast: "Producto actualizado exitosamente"

**6. Resultado:**
- Producto: "Pack Boda Premium"
- isPack: ✅ true
- Componentes:
  - 2x Luces LED
  - 1x Sistema de Sonido
  - 4x Altavoces

---

## 🔄 **GESTIÓN DE COMPONENTES:**

### **Añadir más componentes:**
```
1. Editar el pack de nuevo
2. Los componentes existentes se cargan automáticamente
3. Click "Añadir Componente"
4. Seleccionar nuevo producto
5. Guardar
```

### **Eliminar componente:**
```
1. Editar el pack
2. Click en 🗑️ junto al componente
3. El componente desaparece
4. Guardar
```

### **Cambiar cantidad:**
```
1. Eliminar componente existente
2. Añadirlo de nuevo con nueva cantidad
3. Guardar
```

### **Desmarcar como Pack:**
```
1. Editar el producto
2. Desmarcar ☑️ Este producto es un Pack
3. Los componentes se ocultan (pero no se borran)
4. Guardar
5. El producto vuelve a ser normal
```

---

## ✅ **VERIFICACIONES AUTOMÁTICAS:**

El sistema hace estas verificaciones automáticas:

```
✅ No puedes añadir el mismo pack como componente de sí mismo
✅ Al marcar isPack, aparece sección de componentes
✅ Al desmarcar isPack, se oculta sección
✅ Los componentes se guardan solo si isPack=true
✅ La lista de productos excluye el pack actual
```

---

## 🎯 **CONTROL DE STOCK AUTOMÁTICO:**

Una vez creado el pack:

```
Cliente quiere reservar "Pack Boda Premium"
↓
Sistema verifica automáticamente:
  ✅ ¿Hay 2x Luces LED disponibles? → SÍ
  ✅ ¿Hay 1x Sistema Sonido disponible? → SÍ  
  ✅ ¿Hay 4x Altavoces disponibles? → SÍ
↓
Pack disponible → Cliente puede reservar
```

Si falta algún componente:
```
❌ Solo hay 1x Sistema de Sonido disponible
↓
Pack NO disponible
↓
Muestra: "Sistema de Sonido: requiere 1, solo 0 disponibles"
```

---

## 📊 **FLUJO VISUAL:**

```
Producto Normal                   Pack
┌──────────────┐                 ┌──────────────┐
│ Pack Boda    │  [Editar] →     │ Pack Boda    │
│ €200/día     │                 │ €200/día     │
│              │                 │              │
│ isPack: ❌   │  ☑️ Pack →      │ isPack: ✅   │
│              │                 │              │
│ (sin         │  Añadir →       │ Componentes: │
│ componentes) │  componentes    │ • 2x Luces   │
│              │                 │ • 1x Sonido  │
│              │                 │ • 4x Altavoz │
└──────────────┘                 └──────────────┘
```

---

## ⚠️ **IMPORTANTE:**

### **El pack debe estar en categoría "Packs":**
```
Para que los packs aparezcan organizados:
1. Crea una categoría llamada "Packs"
2. Asigna el producto a esa categoría
3. Marca isPack=true
4. Añade componentes
```

### **Los componentes pueden ser productos normales:**
```
✅ Puedes usar cualquier producto como componente
✅ Un producto puede estar en varios packs
✅ Puedes mezclar categorías en los componentes
```

---

## 🎉 **RESULTADO FINAL:**

```
Panel Admin → Productos → Pack Boda Premium
                          ↓
                    [✏️ Editar]
                          ↓
          ┌───────────────────────────────┐
          │ ☑️ Este producto es un Pack   │
          ├───────────────────────────────┤
          │ Componentes:                  │
          │ • 2x Luces LED                │
          │ • 1x Sistema de Sonido        │
          │ • 4x Altavoces                │
          │                               │
          │ Control automático de stock   │
          │ Verificación de disponibilidad│
          └───────────────────────────────┘
```

---

_¡Ya puedes convertir productos en packs desde el panel admin!_ 🎁✨
