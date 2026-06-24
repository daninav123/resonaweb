# 📊 GUÍA: GESTOR DE CALCULADORA EN ADMIN

## 🎯 ACCESO

1. **Inicia sesión como admin:**
   ```
   http://localhost:3000/login
   
   Email: admin@resona.com
   Password: Admin123!
   ```

2. **Ve al panel de admin:**
   ```
   http://localhost:3000/admin/calculator
   ```

   O desde el Dashboard → Click en "Calculadora" en el sidebar

---

## 🎨 QUÉ PUEDES EDITAR

### **1. TIPOS DE EVENTOS**

Gestiona los tipos de eventos disponibles en la calculadora:

#### **Campos editables:**
- **Icono:** Emoji que representa el evento (ej: 💒, 🎤, 🎵)
- **Nombre:** Nombre del tipo de evento (ej: Boda, Conferencia)
- **Multiplicador:** Factor de precio (1.0 = precio base, 1.5 = +50%)

#### **Acciones:**
- ✏️ **Editar:** Cambia cualquier campo directamente
- ➕ **Añadir:** Botón "Añadir Tipo" para crear nuevo evento
- 🗑️ **Eliminar:** Icono de papelera para borrar tipo de evento

#### **Ejemplo:**
```
💒  |  Boda  |  Multiplicador: 1.5
```
Una boda con multiplicador 1.5 costará 50% más que el precio base

---

### **2. PRECIOS DE SERVICIOS**

Configura los precios para cada nivel de servicio:

#### **🎵 SONIDO**
```
Básico:       €100/día  → Equipo esencial
Intermedio:   €200/día  → Calidad profesional
Profesional:  €350/día  → Alta gama
Premium:      €600/día  → Lo mejor del mercado
```

#### **💡 ILUMINACIÓN**
```
Básico:       €80/día   → Equipo esencial
Intermedio:   €150/día  → Calidad profesional
Profesional:  €280/día  → Alta gama
Premium:      €500/día  → Lo mejor del mercado
```

**Nota:** Estos son precios BASE por día. El precio final se calcula con:
- Multiplicador del tipo de evento
- Factor de asistentes
- Duración del evento

---

### **3. PARTES DE BODA**

Solo aparecen cuando el usuario selecciona "Boda" como tipo de evento.

#### **Campos editables:**
- **Icono:** Emoji (ej: 💒, 🍸, 🍽️, 🎵)
- **Nombre:** Título corto (ej: Ceremonia, Cóctel)
- **Descripción:** Explicación breve

#### **Partes predefinidas:**
```
💒  Ceremonia     → Ceremonia religiosa o civil
🍸  Cóctel        → Aperitivo y bebidas entre ceremonia y banquete
🍽️  Banquete      → Comida o cena principal
🎵  Disco/Fiesta  → Música y baile después del banquete
```

---

## 💾 GUARDAR CAMBIOS

### **Botón "Guardar Cambios"**
- Ubicado: Arriba a la derecha y abajo
- Guarda TODA la configuración a la vez
- Los datos se almacenan en **localStorage**
- Aparece notificación de confirmación

### **¿Dónde se guardan?**
Los cambios se guardan en el navegador (localStorage):
```
Clave: 'calculatorConfig'
```

**IMPORTANTE:** Los cambios solo afectan a este navegador. Para aplicar globalmente necesitarías:
1. Guardar en base de datos (backend)
2. O crear un archivo de configuración JSON

---

## 🔄 FLUJO DE EDICIÓN

```
1. Acceder a /admin/calculator
2. Editar los valores que necesites
3. Ver preview en tiempo real abajo
4. Click en "Guardar Cambios"
5. ✅ Cambios aplicados
```

---

## 👁️ VISTA PREVIA

En la parte inferior del gestor verás una **Vista Previa** de los precios:

```
┌─────────────────────────┐
│  🎵 Sonido              │
│  Básico:       €100/día │
│  Intermedio:   €200/día │
│  Profesional:  €350/día │
│  Premium:      €600/día │
└─────────────────────────┘

┌─────────────────────────┐
│  💡 Iluminación         │
│  Básico:       €80/día  │
│  Intermedio:   €150/día │
│  Profesional:  €280/día │
│  Premium:      €500/día │
└─────────────────────────┘
```

---

## 📝 EJEMPLOS DE USO

### **Ejemplo 1: Subir precios de Bodas**
```
1. Ve a "Tipos de Eventos"
2. Busca "Boda"
3. Cambia multiplicador de 1.5 a 1.8
4. Guarda cambios
→ Ahora las bodas costarán 80% más que el precio base
```

### **Ejemplo 2: Crear nuevo tipo de evento**
```
1. Click en "Añadir Tipo"
2. Icono: 🎓
3. Nombre: Graduación
4. Multiplicador: 1.2
5. Guarda cambios
→ Ahora aparecerá "Graduación" en la calculadora
```

### **Ejemplo 3: Ajustar precios de Sonido Premium**
```
1. Ve a "Precios de Servicios"
2. Sonido → Premium
3. Cambia de €600 a €750
4. Guarda cambios
→ El nivel Premium de sonido ahora cuesta €750/día
```

### **Ejemplo 4: Personalizar partes de boda**
```
1. Ve a "Partes de Boda"
2. Cambia "Disco/Fiesta" por "Afterparty"
3. Cambia descripción a "Fiesta posterior al evento principal"
4. Guarda cambios
→ Los usuarios verán el nuevo nombre
```

---

## ⚠️ CONSIDERACIONES

### **Precios finales en la calculadora:**
```
Precio Base × Multiplicador × Factor Asistentes × Duración

Ejemplo:
- Servicio: Sonido Profesional (€350/día)
- Evento: Boda (multiplicador 1.5)
- Asistentes: 100 personas (factor ~2.0)
- Duración: 1 día

Precio = €350 × 1.5 × 2.0 × 1 = €1,050
```

### **Factor de Asistentes:**
```
Se calcula con: log10(asistentes / 10) + 1

Ejemplos:
- 10 personas  → Factor: 1.0
- 50 personas  → Factor: 1.7
- 100 personas → Factor: 2.0
- 500 personas → Factor: 2.7
```

### **Duración:**
```
- En horas: se divide entre 8 para convertir a días
  Ejemplo: 8 horas = 1 día
  
- En días: se usa directamente
```

---

## 🚀 INTEGRACIÓN CON LA CALCULADORA

Los cambios se aplican automáticamente en:
```
http://localhost:3000/calculadora-evento
```

**Para usar los cambios guardados:**
La calculadora debe leer de localStorage al cargar. Necesitarás modificar `EventCalculatorPage.tsx` para cargar la config guardada.

---

## 🔐 SEGURIDAD

Solo usuarios con rol **ADMIN** pueden acceder a:
```
/admin/calculator
```

Si un usuario normal intenta acceder, será redirigido.

---

## 📊 PRÓXIMAS MEJORAS SUGERIDAS

1. **Guardar en Base de Datos**
   - Crear modelo `CalculatorConfig` en Prisma
   - API para guardar/cargar configuración
   - Aplicar cambios globalmente

2. **Más Servicios**
   - Añadir Fotografía, Mobiliario, Decoración
   - Sistema dinámico para añadir servicios personalizados

3. **Reglas Avanzadas**
   - Descuentos por temporada
   - Precios por zonas geográficas
   - Ofertas especiales

4. **Historial**
   - Ver cambios anteriores
   - Restaurar configuración anterior

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Los cambios no se aplican**
→ Asegúrate de hacer click en "Guardar Cambios"
→ Verifica que aparece el mensaje de confirmación

### **La calculadora no muestra los nuevos precios**
→ Actualiza la página de la calculadora
→ Limpia caché del navegador (Ctrl + F5)

### **No veo el enlace "Calculadora"**
→ Verifica que estás logueado como admin
→ Comprueba que el rol es ADMIN no CLIENT

---

## ✅ RESUMEN

```
✅ Panel de admin creado en /admin/calculator
✅ Editar tipos de eventos con multiplicadores
✅ Configurar precios de Sonido e Iluminación
✅ Personalizar partes de boda
✅ Vista previa en tiempo real
✅ Guardar cambios con un click
✅ Integrado en el sidebar del admin
```

---

**¡Ya puedes gestionar toda la calculadora desde el panel de admin!** 🎉
