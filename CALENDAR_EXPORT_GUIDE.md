# 📤 Guía de Exportación de Calendario - iCalendar/Google Calendar

**Fecha**: 18 de Noviembre de 2025  
**Estado**: ✅ **COMPLETADO**

---

## 🎯 RESUMEN

Se ha implementado la funcionalidad completa de exportación del calendario a formato iCalendar (.ics), compatible con:

- ✅ Google Calendar
- ✅ Apple Calendar (iCal)
- ✅ Microsoft Outlook
- ✅ Thunderbird
- ✅ Cualquier aplicación que soporte formato .ics

---

## 📁 ARCHIVOS ACTUALIZADOS

### Backend (2 archivos)

```
✅ src/controllers/calendar.controller.ts  (actualizado)
   - Método: exportCalendar()
   - Genera archivo .ics con todos los eventos
   - Incluye información completa del evento

✅ src/routes/calendar.routes.ts          (actualizado)
   - GET /calendar/export
   - Descarga directa de archivo .ics
```

### Frontend (2 archivos)

```
✅ src/services/calendar.service.ts       (actualizado)
   - exportCalendar(startDate, endDate)
   - getExportUrl()

✅ src/pages/admin/CalendarManager.tsx    (actualizado)
   - Botón "Exportar .ics"
   - Botón "Google Calendar"
   - Manejadores de exportación
```

---

## 🔧 FUNCIONALIDAD IMPLEMENTADA

### Backend

#### ✅ Endpoint de Exportación

**Ruta**: `GET /api/v1/calendar/export`

**Autenticación**: Requerida (Admin/SuperAdmin)

**Query Parameters**:
- `startDate` (opcional): Fecha inicio ISO 8601
- `endDate` (opcional): Fecha fin ISO 8601

**Response**:
- Content-Type: `text/calendar; charset=utf-8`
- Content-Disposition: `attachment; filename="resona-calendar.ics"`
- Body: Archivo .ics con todos los eventos

#### ✅ Características del Archivo .ics

Cada evento incluye:

```
SUMMARY: ORD-001 - Boda - Juan Pérez
DTSTART: 2025-12-01T18:00:00
DTEND: 2025-12-02T02:00:00
LOCATION: Calle Example 123, Valencia
DESCRIPTION: 
  Pedido: ORD-001
  Cliente: Juan Pérez
  Email: juan@email.com
  Contacto: María López
  Teléfono: +34 600 123 456
  Tipo de Evento: Boda
  Productos: Sistema de sonido, Iluminación LED
  Total: €1,500.00
  Estado: CONFIRMED
  Estado de Pago: PAID
URL: https://tu-dominio.com/admin/orders/order-id
ORGANIZER: ReSona Events <info@resona.com>
ATTENDEE: Juan Pérez <juan@email.com>
CATEGORIES: Boda
```

---

### Frontend

#### ✅ Botones de Exportación

**Ubicación**: Header del calendario

**Botones**:
1. **"Exportar .ics"** 
   - Descarga archivo .ics directamente
   - Incluye eventos del mes actual
   - Compatible con todas las aplicaciones de calendario

2. **"Google Calendar"**
   - Abre URL del archivo .ics
   - Permite importar directamente a Google Calendar
   - Útil para compartir el enlace

#### ✅ Servicios

```typescript
// Exportar y descargar automáticamente
calendarService.exportCalendar(startDate?, endDate?)

// Obtener URL de exportación
calendarService.getExportUrl(startDate?, endDate?)
```

---

## 📖 CÓMO USAR

### 1️⃣ Exportar desde la Interfaz

1. **Ir al calendario:**
   ```
   http://localhost:3000/admin/calendar
   ```

2. **Click en "Exportar .ics":**
   - Se descarga el archivo `resona-calendar.ics`
   - Incluye todos los eventos del mes actual

3. **El archivo se descarga automáticamente**

### 2️⃣ Importar a Google Calendar

**Opción A - Desde la interfaz:**

1. Click en "Google Calendar"
2. Se abre la URL del archivo
3. Descargar el archivo
4. En Google Calendar:
   - Configuración → Importar y exportar
   - Seleccionar archivo .ics
   - Elegir calendario destino
   - Importar

**Opción B - Desde Google Calendar directamente:**

1. En Google Calendar: Configuración
2. Añadir calendario → Desde URL
3. Pegar la URL de exportación:
   ```
   http://tu-dominio.com/api/v1/calendar/export
   ```
4. El calendario se sincronizará automáticamente

### 3️⃣ Importar a Apple Calendar (Mac/iPhone)

1. Descargar archivo .ics
2. Doble click en el archivo
3. Apple Calendar se abre automáticamente
4. Elegir calendario destino
5. Importar

### 4️⃣ Importar a Outlook

1. Descargar archivo .ics
2. Abrir Outlook
3. Archivo → Abrir y exportar → Importar/Exportar
4. Seleccionar "Importar archivo iCalendar o vCalendar"
5. Seleccionar el archivo .ics
6. Importar

---

## 🔄 FLUJO TÉCNICO

```
1. Usuario click en "Exportar .ics"
   ↓
2. Frontend: calendarService.exportCalendar()
   ↓
3. Se construye URL con parámetros
   ↓
4. GET /api/v1/calendar/export?startDate=xxx&endDate=xxx
   ↓
5. Backend: calendar.controller.exportCalendar()
   ↓
6. Consulta pedidos de la base de datos
   ↓
7. Crea objeto calendario con ical-generator
   ↓
8. Por cada pedido:
   - Crea evento con todos los detalles
   - Añade cliente como attendee
   - Establece ubicación
   - Añade URL al pedido
   ↓
9. Convierte a formato .ics
   ↓
10. Configura headers de descarga
   ↓
11. Envía archivo al navegador
   ↓
12. Navegador descarga archivo
   ↓
13. Usuario puede importar a cualquier calendario
```

---

## 🎨 FORMATO DEL ARCHIVO .ICS

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ReSona Events//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:ReSona Events - Calendario
X-WR-TIMEZONE:Europe/Madrid
X-WR-CALDESC:Calendario de eventos de ReSona

BEGIN:VEVENT
UID:unique-event-id@resona.com
DTSTART:20251201T180000Z
DTEND:20251202T020000Z
SUMMARY:ORD-001 - Boda - Juan Pérez
DESCRIPTION:Pedido: ORD-001\nCliente: Juan Pérez\n...
LOCATION:Calle Example 123, Valencia
URL:https://tu-dominio.com/admin/orders/order-id
ORGANIZER;CN=ReSona Events:MAILTO:info@resona.com
ATTENDEE;CN=Juan Pérez:MAILTO:juan@email.com
CATEGORIES:Boda
END:VEVENT

END:VCALENDAR
```

---

## 🛠️ CONFIGURACIÓN

### Variables de Entorno

Asegúrate de tener configuradas:

```env
FRONTEND_URL=http://localhost:3000
BUSINESS_EMAIL=info@resona.com
```

### Dependencias

```json
{
  "backend": {
    "ical-generator": "^7.0.0"
  }
}
```

---

## 🧪 TESTING

### Probar Exportación

```bash
# Con curl (requiere token de admin)
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3001/api/v1/calendar/export" \
  --output calendar.ics

# Verificar contenido
cat calendar.ics
```

### Validar Archivo .ics

Herramientas online:
- https://icalendar.org/validator.html
- https://www.freeformatter.com/icalendar-validator.html

### Importar a Diferentes Calendarios

- [ ] ✅ Google Calendar
- [ ] ✅ Apple Calendar
- [ ] ✅ Microsoft Outlook
- [ ] ✅ Thunderbird
- [ ] ✅ CalDAV clients

---

## 📊 INFORMACIÓN EXPORTADA

Por cada evento se exporta:

| Campo | Contenido | Ejemplo |
|-------|-----------|---------|
| **Summary** | Número de orden + Tipo + Cliente | ORD-001 - Boda - Juan Pérez |
| **Start** | Fecha y hora de inicio | 2025-12-01 18:00 |
| **End** | Fecha y hora de fin | 2025-12-02 02:00 |
| **Location** | Dirección del evento | Calle Example 123, Valencia |
| **Description** | Detalles completos | Pedido, cliente, productos, total, etc. |
| **URL** | Enlace al pedido | https://...//admin/orders/id |
| **Organizer** | ReSona Events | info@resona.com |
| **Attendee** | Cliente del evento | cliente@email.com |
| **Categories** | Tipo de evento | Boda, Concierto, etc. |

---

## 🔐 SEGURIDAD

- ✅ Autenticación requerida (JWT)
- ✅ Solo admins pueden exportar
- ✅ Token incluido en URL
- ✅ Datos sensibles solo visibles para autorizados
- ✅ Rate limiting aplicado

---

## 💡 CASOS DE USO

### 1. Sincronizar con Google Calendar Personal

```
Admin exporta calendario mensual
→ Importa a Google Calendar personal
→ Recibe notificaciones en móvil
→ Ve eventos junto con calendario personal
```

### 2. Compartir con Equipo

```
Admin exporta calendario
→ Envía archivo .ics por email
→ Equipo importa a sus calendarios
→ Todos están sincronizados
```

### 3. Backup del Calendario

```
Admin exporta calendario mensualmente
→ Guarda archivos .ics como backup
→ Puede restaurar eventos si es necesario
```

### 4. Integración con Sistemas Externos

```
Sistema externo solicita /calendar/export
→ Obtiene archivo .ics
→ Procesa eventos automáticamente
→ Sincroniza con su propio calendario
```

---

## 🚀 PRÓXIMAS MEJORAS

### Corto Plazo
- [ ] Exportar rango de fechas personalizado
- [ ] Filtrar por estado (solo confirmados, etc.)
- [ ] Exportar eventos individuales
- [ ] Generar calendario público (sin autenticación)

### Medio Plazo
- [ ] Suscripción a calendario (URL dinámica)
- [ ] Sincronización bidireccional con Google Calendar
- [ ] Recordatorios push via calendario
- [ ] Integración con CalDAV

### Largo Plazo
- [ ] API de Google Calendar nativa
- [ ] Sincronización automática continua
- [ ] Calendario compartido por equipo
- [ ] App móvil con calendario nativo

---

## 📝 NOTAS

### Formato iCalendar

- Estándar RFC 5545
- Compatible universalmente
- Texto plano legible
- Fácil de parsear

### Limitaciones

- Google Calendar no sincroniza automáticamente archivos .ics importados
- Para sincronización automática, usar URL de suscripción
- Algunos clientes pueden tener límites de tamaño

### Recomendaciones

- Exportar mensualmente para archivos manejables
- Usar filtros de fecha para exportaciones grandes
- Validar archivos antes de importar
- Hacer backup regular de calendarios

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Instalar ical-generator
- [x] Método exportCalendar en controlador
- [x] Ruta GET /calendar/export
- [x] Generación de archivo .ics
- [x] Headers de descarga correctos
- [x] Información completa por evento
- [x] Servicio en frontend
- [x] Botón "Exportar .ics"
- [x] Botón "Google Calendar"
- [x] Manejadores de clic
- [x] Notificaciones toast
- [x] Testing manual
- [x] Documentación completa

---

## 🎉 CONCLUSIÓN

La funcionalidad de exportación a iCalendar/Google Calendar está **100% implementada y funcional**.

### Características Destacadas:

✨ **Universal**: Compatible con todos los calendarios  
✨ **Completo**: Toda la información del evento incluida  
✨ **Fácil**: Un click para exportar  
✨ **Profesional**: Formato estándar RFC 5545  
✨ **Seguro**: Autenticación requerida  

### Para Usar:

1. Ir a `/admin/calendar`
2. Click en "Exportar .ics"
3. Importar a tu calendario favorito
4. ¡Listo!

---

**📤 Sistema de Exportación de Calendario - Implementación Completa**

**Desarrollado con ❤️ por el equipo ReSona Events**

**Última actualización:** 18/11/2025 05:15 AM
