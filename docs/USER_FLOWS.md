# 👥 Flujos de Usuario - ReSona

## 1. Flujo de Registro y Login

### Registro de Nuevo Cliente
1. Usuario visita página principal
2. Click en "Registrarse"
3. Formulario de registro:
   - Email
   - Contraseña (mínimo 8 caracteres)
   - Nombre y apellidos
   - Teléfono
   - Empresa (opcional)
   - CIF/NIF (opcional)
4. Verificación de email
5. Acceso al sistema

### Login
1. Email + contraseña
2. Opción "Recordarme"
3. Recuperación de contraseña si olvida

## 2. Flujo de Búsqueda y Selección de Productos

### Exploración del Catálogo
1. Landing page muestra categorías principales
2. Usuario selecciona categoría o usa buscador
3. Filtros disponibles:
   - Categoría
   - Rango de precio
   - Tipo de evento
4. Vista de productos con:
   - Imagen principal
   - Nombre
   - Precio por día
   - Botón "Ver detalles"

### Detalle de Producto
1. Galería de imágenes
2. Descripción completa
3. Especificaciones técnicas
4. Precio según duración
5. Selector de fechas para verificar disponibilidad
6. Cantidad disponible
7. Valoraciones de clientes
8. Productos relacionados
9. Botones:
   - "Añadir a favoritos"
   - "Añadir al carrito"

## 3. Flujo de Creación de Pedido

### Carrito de Alquiler
1. Usuario añade productos al carrito
2. Vista del carrito muestra:
   - Productos seleccionados
   - Cantidad de cada uno
   - Selector de fechas (inicio y fin del evento)
   - Cálculo automático de días
   - Precio subtotal por producto
3. Botón "Proceder al checkout"

### Checkout - Paso 1: Datos del Evento
1. Tipo de evento (dropdown)
2. Fecha y hora exacta del evento
3. Ubicación del evento (autocompletado con Google Maps)
4. Número de asistentes
5. Persona de contacto en el sitio
6. Teléfono de contacto
7. Notas especiales

### Checkout - Paso 2: Logística
1. Selección de tipo de entrega:
   - **Recogida en almacén:**
     - Muestra dirección del almacén
     - Selector de horario de recogida
     - Selector de horario de devolución
   - **Transporte a ubicación:**
     - Dirección de entrega (prellenada del evento)
     - Cálculo automático de distancia
     - Coste de transporte
     - Horario preferido de entrega
     - Horario preferido de recogida

### Checkout - Paso 3: Resumen y Confirmación
1. Resumen completo:
   - Productos y cantidades
   - Fechas
   - Datos del evento
   - Tipo de entrega
2. Desglose de precios:
   - Subtotal productos
   - Transporte (si aplica)
   - IVA
   - **Total**
3. Depósito requerido (si aplica)
4. Aceptación de términos y condiciones
5. Botón "Confirmar pedido"

### Post-Confirmación
1. Pantalla de éxito con número de pedido
2. Email de confirmación automático con:
   - Resumen del pedido
   - Factura adjunta en PDF
   - Instrucciones de pago
   - Datos de contacto
3. Redirección a "Mis pedidos"

## 4. Flujo de Gestión de Pedidos (Cliente)

### Mis Pedidos
1. Lista de todos los pedidos:
   - Activos (próximos eventos)
   - En curso
   - Completados
   - Cancelados
2. Cada pedido muestra:
   - Número de pedido
   - Fecha del evento
   - Estado actual
   - Total
3. Click en pedido → Detalle completo

### Detalle de Pedido
1. Timeline del estado actual
2. Productos alquilados
3. Fechas y ubicación
4. Datos de contacto
5. Factura descargable
6. Botones según estado:
   - "Cancelar pedido" (si está pendiente)
   - "Contactar soporte"
   - "Repetir pedido"

## 5. Flujo de Administrador - Dashboard

### Login Admin
1. Login con rol ADMIN o superior
2. Redirección a dashboard administrativo

### Dashboard Principal
1. Vista de KPIs:
   - Pedidos hoy
   - Ingresos del mes
   - Ocupación de inventario
   - Alertas pendientes
2. Gráficos:
   - Evolución de ingresos
   - Productos más alquilados
3. Acciones rápidas:
   - Nuevo pedido manual
   - Nuevo producto
   - Ver calendario de eventos
4. Lista de pedidos pendientes de confirmar
5. Notificaciones de sistema

## 6. Flujo de Gestión de Pedidos (Admin)

### Lista de Pedidos
1. Tabla con todos los pedidos
2. Filtros:
   - Estado
   - Fecha
   - Cliente
   - Método de entrega
3. Búsqueda por número de pedido
4. Acciones en lote:
   - Confirmar múltiples
   - Exportar a Excel

### Detalle y Gestión de Pedido
1. Vista completa del pedido
2. Información del cliente (con historial)
3. Productos con estado de preparación
4. Selector de estado:
   - Pendiente → Confirmado (envía email)
   - Confirmado → En preparación
   - En preparación → Listo
   - Listo → En tránsito (si es delivery)
   - En tránsito → Entregado
   - Entregado → Devuelto
   - Devuelto → Completado
5. Asignación de recursos:
   - Personal asignado
   - Vehículo asignado
6. Notas internas del admin
7. Control de devolución:
   - Checklist de productos
   - Registro de daños
   - Cálculo de penalizaciones
8. Gestión de pagos:
   - Registrar pago recibido
   - Método de pago
   - Referencia

## 7. Flujo de Gestión de Productos (Admin)

### Lista de Productos
1. Vista de todos los productos
2. Filtros por categoría, estado, stock
3. Búsqueda
4. Botón "Crear producto"

### Crear/Editar Producto
1. Formulario completo:
   - Información básica (nombre, SKU, descripción)
   - Categoría
   - Especificaciones técnicas (campos dinámicos)
   - Precios (día, fin de semana, semana)
   - Stock disponible
   - Estado (disponible, mantenimiento, retirado)
   - Ubicación en almacén
   - Depósito requerido
2. Gestión de imágenes:
   - Upload múltiple
   - Reordenar
   - Establecer imagen principal
3. Mantenimiento:
   - Última revisión
   - Próxima revisión
   - Notas
4. Guardar como borrador o publicar

## 8. Flujo de Calendario de Eventos (Admin)

### Vista de Calendario
1. Vista mensual/semanal/diaria
2. Eventos mostrados:
   - Color según estado
   - Nombre del cliente
   - Número de pedido
3. Click en evento → Detalle rápido
4. Detección de conflictos de disponibilidad
5. Arrastrar para reprogramar
6. Filtros por tipo de entrega, estado

## 9. Flujo de Gestión de Clientes (Admin)

### Lista de Clientes
1. Tabla con todos los clientes
2. Filtros: tipo (particular/empresa), estado
3. Click en cliente → Perfil completo

### Perfil de Cliente
1. Datos personales y empresa
2. Historial de pedidos
3. Total facturado
4. Valoración como cliente (interno)
5. Notas del administrador
6. Documentos adjuntos
7. Botón "Crear pedido para este cliente"

## 10. Flujo de Integración API Externa

### Configuración Inicial
1. Desarrollador externo solicita API key
2. Admin genera API key desde panel
3. Descarga de documentación y ejemplos

### Uso de la API
1. Aplicación externa consulta disponibilidad
2. Crea pedido mediante POST
3. Recibe confirmación con ID de pedido
4. Webhook notifica cambios de estado
5. Descarga factura cuando está lista

## 11. Flujo de Facturación

### Generación Automática
1. Al confirmar pedido → Se genera factura borrador
2. Admin revisa y confirma factura
3. PDF se genera automáticamente
4. Email con factura adjunta al cliente
5. Factura visible en "Mis pedidos"

### Gestión de Pagos
1. Admin registra pago recibido
2. Sistema actualiza estado de factura
3. Si pago parcial, registra pendiente
4. Si pago completo, marca como pagado
5. Recordatorio automático si vence sin pagar

## 12. Consideraciones UX

### Responsive Design
- Diseño adaptado a móvil, tablet y desktop
- Navegación optimizada para táctil
- Imágenes responsive

### Feedback Visual
- Loading spinners durante operaciones
- Mensajes de éxito/error (toasts)
- Validación en tiempo real en formularios
- Confirmaciones para acciones destructivas

### Accesibilidad
- Navegación por teclado
- Labels descriptivos
- Contraste adecuado
- Textos alternativos en imágenes
