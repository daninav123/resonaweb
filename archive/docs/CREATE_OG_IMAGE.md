# 📸 CREAR IMAGEN OG (Open Graph)

## ¿Qué es?
La imagen OG es la que aparece cuando compartes tu web en redes sociales (Facebook, LinkedIn, Twitter, WhatsApp).

## Especificaciones Técnicas

### **Dimensiones:**
- **1200 x 630 píxeles** (ratio 1.91:1)
- Formato: JPG o PNG
- Tamaño máximo: 8 MB (recomendado < 1 MB)

### **Área Segura:**
- Evita texto/logos en los bordes (50px de margen)
- Contenido importante en el centro

---

## 🎨 Diseño Recomendado para Resona

### **Elementos a Incluir:**

#### 1. **Fondo**
- Color: Gradiente de #5ebbff a #0ea5e9
- O fondo blanco con elementos de marca

#### 2. **Logo**
- Logo Resona Events grande
- Posición: Centro o superior izquierda

#### 3. **Texto Principal**
```
Resona Events
Alquiler de Material para Eventos
```

#### 4. **Subtexto**
```
Sonido • Iluminación • Foto • Video
Presupuesto Online en Minutos
```

#### 5. **Call-to-Action (Opcional)**
```
www.resona.com
```

---

## 🛠️ Cómo Crear la Imagen

### **Opción 1: Canva (Recomendado - Gratis)**

1. Ir a https://canva.com
2. Crear diseño personalizado: 1200 x 630 px
3. Usar plantilla "Facebook Post" o "LinkedIn Post"
4. Agregar elementos:
   - Fondo con color corporativo #5ebbff
   - Logo Resona (subir el SVG)
   - Textos con tipografía limpia
5. Descargar como JPG de alta calidad

### **Opción 2: Figma (Profesional - Gratis)**

1. Crear nuevo frame: 1200 x 630 px
2. Diseñar con colores corporativos
3. Exportar como JPG @2x

### **Opción 3: Photoshop/GIMP**

1. Nuevo documento: 1200 x 630 px, 72 DPI
2. Diseñar según mockup
3. Guardar como JPG calidad 90%

---

## 📐 Mockup Sugerido

```
┌─────────────────────────────────────────┐
│                                         │
│     [Logo Resona]                       │
│                                         │
│     RESONA EVENTS                       │
│     Alquiler de Material para Eventos   │
│                                         │
│     🎵 Sonido  💡 Iluminación           │
│     📷 Foto    🎥 Video                 │
│                                         │
│     Presupuesto Online · www.resona.com │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💾 Guardar la Imagen

### **Nombre del archivo:**
```
og-image.jpg
```

### **Ubicación:**
```
packages/frontend/public/og-image.jpg
```

---

## ✅ Verificar la Imagen

### **1. Tamaño del Archivo:**
```bash
# Debería ser < 1 MB
# Si es muy grande, comprimir en:
# https://tinypng.com/
```

### **2. Test en Facebook:**
https://developers.facebook.com/tools/debug/

### **3. Test en Twitter:**
https://cards-dev.twitter.com/validator

### **4. Test en LinkedIn:**
https://www.linkedin.com/post-inspector/

---

## 🎨 Colores a Usar

```css
/* Color Corporativo Principal */
#5ebbff

/* Colores Complementarios */
#7dd3ff  /* Light */
#0ea5e9  /* Dark */

/* Neutros */
#ffffff  /* Blanco */
#0f172a  /* Negro/Gris oscuro */
```

---

## 📝 Textos Sugeridos

### **Título:**
- "Resona Events"
- "Alquiler de Material para Eventos"

### **Subtítulo:**
- "Sonido • Iluminación • Foto • Video"
- "Presupuesto Online en Minutos"
- "Equipos Profesionales para tu Evento"

### **Footer:**
- "www.resona.com"
- "+34 600 123 456"

---

## ✨ Tips para un Buen Diseño

1. **Simplicidad:** No sobrecargues la imagen
2. **Contraste:** Texto legible sobre el fondo
3. **Branding:** Logo visible y reconocible
4. **Jerarquía:** Título más grande que subtítulo
5. **Profesional:** Evita cliparts genéricos

---

## 🚀 Una Vez Creada

1. Guardar en: `packages/frontend/public/og-image.jpg`
2. La imagen ya está referenciada en `index.html`
3. Reiniciar el frontend
4. Verificar con las herramientas de test

---

## 📱 Versiones Adicionales (Opcional)

### **Twitter Card (más cuadrada):**
- 1200 x 600 px
- Guardar como: `twitter-card.jpg`

### **WhatsApp (más vertical):**
- 800 x 800 px  
- Guardar como: `whatsapp-share.jpg`

---

## ⚡ Quick Template (Texto Simple)

Si necesitas algo rápido, usa una imagen con:
- Fondo degradado azul (#5ebbff → #0ea5e9)
- Logo en PNG blanco centro
- Texto blanco grande: "RESONA EVENTS"
- Subtexto: "Alquiler Material Eventos"

---

**Total tiempo estimado: 15-30 minutos** ⏱️

¡Una buena imagen OG puede aumentar el CTR en redes sociales hasta un 40%! 📈
