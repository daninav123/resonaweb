# 📖 GUÍA: Cómo Crear Facturas Manuales

_Guía rápida para crear facturas de eventos externos_

---

## 🎯 **¿PARA QUÉ SIRVE?**

Este sistema te permite crear facturas para eventos que **NO vienen de la página web**:
- Eventos contratados por teléfono
- Eventos contratados en persona
- Eventos contratados por email
- Cualquier servicio externo

**✅ Las facturas respetan la numeración secuencial junto con las de la web**  
**✅ Son compatibles con Facturae XML (normativa española)**

---

## 🚀 **CÓMO USARLO:**

### **Paso 1: Acceder al Panel**
```
1. Inicia sesión como ADMIN
2. Ve a: http://localhost:3000/admin/invoices/manual
3. Verás el formulario de creación
```

### **Paso 2: Datos del Cliente**
```
Rellena:
✅ Nombre o Empresa *obligatorio
✅ Email *obligatorio
• Teléfono
• NIF/CIF (para Facturae)
• Dirección completa
```

### **Paso 3: Conceptos de la Factura**
```
Por cada servicio/producto:
✅ Descripción *obligatorio
   Ej: "Alquiler equipo sonido boda"
   
✅ Cantidad *obligatorio
   Ej: 1
   
✅ Precio unitario *obligatorio
   Ej: 1500
   
✅ IVA
   Opciones: 0%, 4%, 10%, 21%
   Por defecto: 21%

[Botón +] Para añadir más conceptos
[Botón 🗑️] Para eliminar conceptos
```

### **Paso 4: Información Adicional**
```
Opcional:
• Fecha del evento
• Fecha de vencimiento (default: +30 días)
• Notas/Observaciones
```

### **Paso 5: Revisar Totales**
```
El sistema calcula automáticamente:
- Subtotal
- IVA total
- TOTAL
```

### **Paso 6: Crear Factura**
```
1. Clic en "Crear Factura"
2. El sistema genera un número: INV-2025-XXXXX
3. Verás la pantalla de éxito
```

### **Paso 7: Acciones Post-Creación**
```
Puedes:
1. 📄 Descargar PDF
   → Factura en formato PDF profesional
   
2. 📋 Generar Facturae XML
   → Archivo XML normativa española
   → Compatible con FACe
   
3. ➕ Crear otra factura
   → Volver al formulario limpio
```

---

## 💡 **EJEMPLO COMPLETO:**

### **Caso Real: Boda Externa**
```
CLIENTE:
Nombre: Juan Pérez y María García
Email: juanymaria@gmail.com
Teléfono: 600123456
NIF: 12345678A
Dirección: Calle Mayor 15, 28013 Madrid

CONCEPTOS:
1. Alquiler equipo sonido completo
   Cantidad: 1
   Precio: 1.500 €
   IVA: 21%

2. Alquiler iluminación LED
   Cantidad: 1
   Precio: 800 €
   IVA: 21%

3. Técnico de montaje y desmontaje
   Cantidad: 1
   Precio: 300 €
   IVA: 21%

INFORMACIÓN ADICIONAL:
Fecha evento: 15/12/2025
Vencimiento: 15/01/2026
Notas: Boda en Jardín Botánico. Setup a las 10:00h

TOTALES:
Subtotal: 2.600,00 €
IVA (21%): 546,00 €
TOTAL: 3.146,00 €
```

---

## 📋 **NÚMEROS DE FACTURA:**

```
¿Cómo se asigna el número?

Sistema automático secuencial:
INV-{AÑO}-{NÚMERO}

Ejemplos:
- INV-2025-00001 (primera del 2025)
- INV-2025-00002 (segunda del 2025)
- INV-2025-00042 (después de 41 facturas)

IMPORTANTE:
✅ Se mezcla con las facturas web
✅ Sin duplicados nunca
✅ Sin gaps en la numeración
✅ Cumple normativa española
```

---

## 📄 **FACTURAE XML:**

```
¿Qué es Facturae?
Formato XML oficial español para facturas electrónicas.

¿Para qué sirve?
- Presentar facturas a la Administración Pública (FACe)
- Integrar con sistemas contables
- Cumplir normativa española

¿Cómo generarlo?
1. Crea la factura manual
2. Clic en "Generar Facturae XML"
3. El sistema genera el XML
4. Puedes descargarlo

¿Qué contiene?
- Todos los datos de la factura
- Formato estándar 3.2.2
- Validado según normativa
```

---

## ❓ **PREGUNTAS FRECUENTES:**

### **¿Puedo editar una factura después de crearla?**
```
No, las facturas son inmutables por normativa.
Si hay un error, debes:
1. Anular la factura (marcar como cancelada)
2. Crear una nueva factura correcta
```

### **¿Las facturas manuales se mezclan con las de la web?**
```
Sí, comparten la misma numeración secuencial.
Esto es correcto según normativa española.

Ejemplo:
INV-2025-00041 → Pedido web
INV-2025-00042 → Factura manual
INV-2025-00043 → Pedido web
```

### **¿Qué pasa si me equivoco al rellenar el formulario?**
```
El formulario valida antes de enviar:
- Nombre y email son obligatorios
- Al menos 1 concepto
- Cantidad > 0
- Precio >= 0

Si falta algo, te avisa antes de crear.
```

### **¿Puedo crear facturas sin IVA?**
```
Sí, selecciona IVA: 0%
Úsalo para:
- Servicios exentos
- Inversión del sujeto pasivo
- Exportaciones
```

### **¿Dónde se guardan las facturas?**
```
En la base de datos PostgreSQL.
Tabla: Invoice
Campo orderId: NULL (identifica factura manual)
```

### **¿Puedo ver todas las facturas creadas?**
```
Sí, desde el panel admin:
/admin/orders (pedidos con facturas)

O directamente en BD:
SELECT * FROM Invoice WHERE orderId IS NULL;
```

---

## 🔐 **SEGURIDAD:**

```
Solo pueden crear facturas manuales:
✅ Usuarios con rol ADMIN
✅ Usuarios con rol SUPERADMIN

No pueden:
❌ Usuarios normales
❌ Usuarios no autenticados
❌ Sin permisos adecuados
```

---

## 📊 **VENTAJAS:**

```
✅ Rápido: 2 minutos crear factura
✅ Fácil: Formulario intuitivo
✅ Seguro: Numeración automática
✅ Legal: Cumple normativa
✅ Completo: PDF + XML
✅ Profesional: Diseño factura
✅ Flexible: Múltiples conceptos
✅ Calculos: Automáticos
```

---

## 🎯 **CASOS DE USO:**

### **1. Cliente llama por teléfono**
```
Situación: Juan llama para contratar sonido boda
Proceso:
1. Tomas datos por teléfono
2. Creas factura manual
3. Envías PDF por email
4. Cliente paga según factura
```

### **2. Presupuesto aceptado por email**
```
Situación: Cliente acepta presupuesto enviado
Proceso:
1. Conviertes presupuesto en factura
2. Usas datos del email
3. Generas factura manual
4. Envías PDF + XML
```

### **3. Evento corporativo grande**
```
Situación: Empresa contrata evento
Proceso:
1. Acuerdo fuera de web
2. Creas factura con todos los servicios
3. Añades múltiples conceptos
4. Generas Facturae para su contabilidad
```

---

## ✅ **CHECKLIST ANTES DE CREAR:**

```
Antes de hacer clic en "Crear Factura":

Datos Cliente:
☐ Nombre/Empresa correcto
☐ Email correcto (recibirá aquí)
☐ NIF/CIF (si necesita Facturae)
☐ Dirección completa

Conceptos:
☐ Descripciones claras
☐ Cantidades correctas
☐ Precios correctos
☐ IVA adecuado

Fechas:
☐ Fecha evento (si aplica)
☐ Vencimiento correcto

Totales:
☐ Subtotal correcto
☐ IVA correcto
☐ Total correcto

¡Listo! → Clic en "Crear Factura"
```

---

## 🆘 **SOPORTE:**

```
Si tienes problemas:

1. Verifica que eres ADMIN
2. Verifica que el servidor está corriendo
3. Verifica que hay conexión a BD
4. Revisa la consola del navegador (F12)
5. Revisa logs del backend

Errores comunes:
- 401: No estás logueado
- 403: No eres admin
- 500: Error servidor (ver logs)
```

---

## 🎉 **¡TODO LISTO!**

Ya puedes crear facturas para tus eventos externos.

**URL:** http://localhost:3000/admin/invoices/manual

**¡Pruébalo ahora!** 🚀

---

_Guía creada: 19/11/2025_  
_Sistema: 100% Funcional_  
_Soporte: Facturae XML incluido_
