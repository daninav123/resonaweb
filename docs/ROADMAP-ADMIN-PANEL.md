# ROADMAP - Panel de Administración Completo para Empresa de Eventos

> Documento de referencia para la mejora integral del panel de admin de ReSona Events.
> Cada fase se ejecuta secuencialmente. No se avanza a la siguiente hasta completar la actual.

---

## FASE 1: DASHBOARD INTELIGENTE (Centro de Control)
**Estado: PENDIENTE**
**Prioridad: CRITICA - Es lo primero que ve el admin cada dia**

### 1.1 - Widget "Hoy / Esta Semana"
- [ ] Eventos de hoy: que hay que montar, que esta en curso, que hay que desmontar
- [ ] Eventos de esta semana: vista previa de los proximos 7 dias
- [ ] Indicador de carga de trabajo (alto/medio/bajo)

### 1.2 - Widget "Alertas Activas"
- [ ] Pagos pendientes de cobro (con dias de retraso)
- [ ] Stock bajo (productos por debajo del minimo)
- [ ] Devoluciones atrasadas (equipos no devueltos)
- [ ] Presupuestos sin responder (>48h)
- [ ] Mantenimiento pendiente de equipos

### 1.3 - Widget "Pipeline de Ventas"
- [ ] Funnel visual: Leads -> Presupuestos -> Aceptados -> Convertidos
- [ ] Valor total en cada fase
- [ ] Tasa de conversion

### 1.4 - Widget "KPIs del Mes"
- [ ] Ingresos del mes vs mes anterior
- [ ] Ticket medio
- [ ] Ocupacion del stock (% de equipos alquilados)
- [ ] Numero de eventos realizados
- [ ] Tasa de conversion presupuestos

### 1.5 - Widget "Facturacion Pendiente"
- [ ] Total por cobrar
- [ ] Desglose: proximos 7 dias, 30 dias, vencido
- [ ] Acceso rapido a facturas pendientes

### 1.6 - Widget "Acciones Rapidas"
- [ ] Crear presupuesto rapido
- [ ] Registrar gasto
- [ ] Nuevo evento
- [ ] Escanear codigo de barras

---

## FASE 2: GESTION DE EVENTOS / PROYECTOS (Core del negocio)
**Estado: PENDIENTE**
**Prioridad: CRITICA - Es el corazon de una empresa de eventos**

### 2.1 - Modelo de datos "Event"
- [ ] Schema Prisma: Event con fases, timeline, checklist
- [ ] Relacion Event -> Order, Event -> Budget, Event -> Staff
- [ ] Migracion de base de datos

### 2.2 - Pagina "Lista de Eventos"
- [ ] Tabla con filtros: fecha, tipo, estado, cliente
- [ ] Vista kanban por estado (planificacion/preparacion/en_curso/completado)
- [ ] Busqueda rapida

### 2.3 - Pagina "Detalle de Evento"
- [ ] Cabecera: nombre, cliente, fecha, ubicacion, tipo
- [ ] Tabs: Resumen | Timeline | Equipos | Personal | Logistica | Documentos | Notas
- [ ] Tab Resumen: briefing del evento, datos clave, estado actual
- [ ] Tab Timeline: cronograma del dia (hora montaje, prueba sonido, evento, desmontaje)
- [ ] Tab Equipos: lista de equipos asignados (del inventario)
- [ ] Tab Personal: trabajadores asignados con horarios
- [ ] Tab Logistica: vehiculos, rutas, cargas
- [ ] Tab Documentos: presupuesto, contrato, factura, riders tecnicos
- [ ] Tab Notas: comunicacion interna del equipo

### 2.4 - Checklist de Evento
- [ ] Plantillas de checklist por tipo de evento (boda, concierto, corporativo)
- [ ] Checkpoints obligatorios antes de cada fase
- [ ] Progreso visual (barra de progreso)

### 2.5 - Hoja de Ruta / Run Sheet
- [ ] Timeline del dia del evento hora a hora
- [ ] Responsable de cada tarea
- [ ] Estado en tiempo real (completado/pendiente/en curso)

### 2.6 - Registro de Incidencias
- [ ] Formulario rapido de incidencia durante evento
- [ ] Clasificacion: equipo roto, retraso, queja cliente, etc.
- [ ] Fotos adjuntas
- [ ] Resolucion y seguimiento

---

## FASE 3: CRM DE CLIENTES (Relacion con el cliente)
**Estado: PENDIENTE**
**Prioridad: CRITICA**

### 3.1 - Ficha de Cliente Completa
- [ ] Datos personales/empresa, NIF, direccion
- [ ] Tipo: particular, empresa, agencia, venue
- [ ] Tags/etiquetas personalizables
- [ ] Scoring automatico (frecuencia, ticket medio, antiguedad)

### 3.2 - Historial del Cliente
- [ ] Timeline unificado: eventos, presupuestos, pedidos, pagos, comunicaciones
- [ ] Total gastado historico
- [ ] Ultimo contacto y proximo follow-up

### 3.3 - Segmentacion y Filtros
- [ ] Filtrar por tipo, scoring, ultimo pedido, zona geografica
- [ ] Listas personalizadas (ej: "Clientes VIP", "Empresas Tech")
- [ ] Exportar segmentos a CSV

### 3.4 - Comunicaciones
- [ ] Log de llamadas/emails/whatsapp por cliente
- [ ] Notas de seguimiento con recordatorios
- [ ] Tareas pendientes por cliente

---

## FASE 4: CALENDARIO AVANZADO (Vista de Recursos)
**Estado: PENDIENTE**
**Prioridad: ALTA**

### 4.1 - Vista de Recursos (Resource View)
- [ ] Eje Y: equipos/personal, Eje X: fechas
- [ ] Ver de un vistazo que esta ocupado y que esta libre
- [ ] Colores por tipo de evento

### 4.2 - Vista de Personal
- [ ] Disponibilidad de cada trabajador
- [ ] Asignaciones por dia
- [ ] Horas acumuladas en el mes

### 4.3 - Conflictos y Overbooking
- [ ] Deteccion automatica de conflictos (mismo equipo, mismo dia)
- [ ] Alertas visuales en rojo
- [ ] Sugerencias de alternativas

### 4.4 - Drag & Drop
- [ ] Reprogramar eventos arrastrando
- [ ] Reasignar personal arrastrando
- [ ] Confirmacion antes de aplicar cambios

---

## FASE 5: GESTION DE PERSONAL / RRHH
**Estado: PENDIENTE**
**Prioridad: ALTA**

### 5.1 - Base de Datos de Trabajadores
- [ ] Schema Prisma: StaffMember (nombre, contacto, especialidad, tarifa/hora)
- [ ] Tipos: empleado fijo, freelancer, eventual
- [ ] Documentacion: DNI, contrato, seguro, formacion PRL
- [ ] Estado: activo, inactivo, vacaciones

### 5.2 - Disponibilidad y Asignaciones
- [ ] Calendario personal de cada trabajador
- [ ] Bloqueo de fechas (vacaciones, bajas)
- [ ] Asignacion a eventos con horas y rol

### 5.3 - Control de Horas y Pagos
- [ ] Registro de horas por evento
- [ ] Calculo automatico de coste (horas x tarifa)
- [ ] Resumen mensual por trabajador
- [ ] Exportar nominas/pagos

---

## FASE 6: CICLO COMPLETO DE PRESUPUESTOS
**Estado: PENDIENTE**
**Prioridad: ALTA**

### 6.1 - Plantillas de Presupuesto
- [ ] Plantillas por tipo de evento con items predefinidos
- [ ] Guardar como plantilla desde cualquier presupuesto
- [ ] Duplicar presupuesto existente

### 6.2 - Versionado
- [ ] Historial de versiones (v1, v2, v3...)
- [ ] Comparar versiones (que cambio)
- [ ] Restaurar version anterior

### 6.3 - Portal del Cliente
- [ ] Link publico para ver presupuesto
- [ ] Boton "Aceptar" con firma/confirmacion
- [ ] Comentarios del cliente
- [ ] Pago de senal directamente

### 6.4 - Automatizaciones
- [ ] Presupuesto aceptado -> Crear evento + pedido automaticamente
- [ ] Recordatorio si no responde en 48h, 5 dias, 10 dias
- [ ] Notificacion al comercial cuando se acepta/rechaza

---

## FASE 7: CONTRATOS Y FIRMA DIGITAL
**Estado: PENDIENTE**
**Prioridad: MEDIA**

### 7.1 - Generacion de Contratos
- [ ] Plantillas de contrato editables (Markdown/HTML -> PDF)
- [ ] Variables dinamicas: {{cliente}}, {{fecha}}, {{total}}, etc.
- [ ] Generacion automatica desde presupuesto aceptado

### 7.2 - Firma Digital
- [ ] Firma con dedo/raton en pantalla
- [ ] Enlace por email para firmar remotamente
- [ ] Almacenamiento seguro del contrato firmado

### 7.3 - Tracking de Estado
- [ ] Estados: borrador -> enviado -> visto -> firmado -> vigente -> completado
- [ ] Recordatorios automaticos para firmar

---

## FASE 8: COMUNICACIONES CENTRALIZADAS
**Estado: PENDIENTE**
**Prioridad: MEDIA**

### 8.1 - Bandeja de Entrada
- [ ] Vista unificada: formularios web + emails + contactos
- [ ] Estado: nuevo, leido, respondido, archivado
- [ ] Asignacion a miembros del equipo

### 8.2 - Plantillas de Email
- [ ] Editor de plantillas HTML
- [ ] Variables dinamicas
- [ ] Plantillas para: confirmacion, recordatorio, seguimiento, agradecimiento

### 8.3 - Notificaciones en Admin
- [ ] Campana de notificaciones en header (real-time con SSE/WebSocket)
- [ ] Tipos: nuevo pedido, pago recibido, presupuesto aceptado, stock bajo
- [ ] Marcar como leida / ver todas

### 8.4 - Log de Comunicaciones
- [ ] Historial de emails enviados por pedido/cliente
- [ ] Tracking: enviado, abierto, clickeado

---

## FASE 9: CONTABILIDAD AVANZADA
**Estado: PENDIENTE**
**Prioridad: MEDIA**

### 9.1 - Gastos Recurrentes
- [ ] Configurar gastos fijos mensuales (alquiler, seguros, leasing)
- [ ] Generacion automatica cada mes
- [ ] Alertas de vencimiento

### 9.2 - Flujo de Caja (Cashflow)
- [ ] Prevision de entradas (pagos pendientes con fecha)
- [ ] Prevision de salidas (gastos programados)
- [ ] Grafico de proyeccion a 30/60/90 dias
- [ ] Alerta si balance previsto < umbral

### 9.3 - Informes Fiscales
- [ ] Resumen trimestral IVA (modelo 303)
- [ ] Resumen anual
- [ ] Exportacion para asesoria (CSV compatible con A3/Contaplus)

### 9.4 - P&L por Evento
- [ ] Ingresos del evento vs costes reales (equipo + personal + transporte + consumibles)
- [ ] Margen real por evento
- [ ] Ranking de eventos mas rentables

---

## FASE 10: LOGISTICA Y VEHICULOS
**Estado: PENDIENTE**
**Prioridad: MEDIA-BAJA**

### 10.1 - Gestion de Flota
- [ ] Vehiculos: matricula, tipo, capacidad, ITV, seguro
- [ ] Estado: disponible, en ruta, en taller
- [ ] Alertas: ITV proxima, seguro por vencer

### 10.2 - Planificacion de Rutas
- [ ] Asignar vehiculo a evento
- [ ] Optimizacion de carga (que cabe en que vehiculo)
- [ ] Mapa de rutas del dia

### 10.3 - Control de Gastos de Transporte
- [ ] Km por evento
- [ ] Gastos de combustible/peajes
- [ ] Coste real vs coste presupuestado

---

## FASE 11: ALMACEN AVANZADO
**Estado: PENDIENTE**
**Prioridad: MEDIA-BAJA**

### 11.1 - Ubicaciones en Almacen
- [ ] Zonas/estanterias/posiciones
- [ ] Asignar ubicacion a cada unidad
- [ ] Buscar donde esta un equipo

### 11.2 - Picking y Preparacion
- [ ] Lista de picking por evento (que sacar del almacen)
- [ ] Confirmacion por escaneo de codigo de barras
- [ ] Estado: pendiente, en preparacion, listo, cargado

### 11.3 - Check-in/Check-out Masivo
- [ ] Escaneo rapido de multiples codigos
- [ ] Registro automatico de salida/entrada
- [ ] Deteccion de items faltantes

### 11.4 - Mantenimiento Preventivo
- [ ] Programar revisiones periodicas por equipo
- [ ] Recordatorios automaticos
- [ ] Historial de mantenimiento

---

## FASE 12: PERMISOS Y SEGURIDAD
**Estado: PENDIENTE**
**Prioridad: MEDIA-BAJA**

### 12.1 - Roles Personalizables
- [ ] Crear roles custom: almacenero, tecnico, contable, comercial, gerente
- [ ] Permisos por seccion: ver, crear, editar, eliminar
- [ ] Permisos por tipo de dato (ej: contable no ve datos de personal)

### 12.2 - Auditoria Visible
- [ ] Pagina de logs de auditoria (ya existe AuditLog en schema)
- [ ] Filtrar por usuario, accion, fecha
- [ ] Exportar logs

### 12.3 - Seguridad
- [ ] 2FA para admins
- [ ] Sesiones activas (ver y cerrar)
- [ ] Politica de contrasenas

---

## FASE 13: UX/UI Y LIMPIEZA
**Estado: PENDIENTE**
**Prioridad: BAJA (se va haciendo en paralelo)**

### 13.1 - Busqueda Global
- [ ] Barra de busqueda en header del admin (Cmd+K)
- [ ] Buscar en: pedidos, clientes, productos, presupuestos, eventos
- [ ] Resultados agrupados por tipo

### 13.2 - Exportaciones
- [ ] Boton "Exportar CSV/Excel" en todas las tablas principales
- [ ] Exportar con filtros aplicados

### 13.3 - Limpieza de Codigo
- [ ] Eliminar archivos duplicados/vacios
- [ ] Unificar Dashboard (3 versiones -> 1)
- [ ] Unificar PacksManager (2 versiones -> 1)
- [ ] Eliminar CouponsManagerSimple.tsx (0 bytes)

### 13.4 - Mejoras de UI
- [ ] Breadcrumbs en todas las paginas
- [ ] Skeleton loaders consistentes
- [ ] Empty states informativos
- [ ] Responsive mejorado en tablas complejas

---

## PROGRESO GENERAL

| Fase | Nombre | Estado | Progreso |
|------|--------|--------|----------|
| 1 | Dashboard Inteligente | PENDIENTE | 0% |
| 2 | Gestion de Eventos | PENDIENTE | 0% |
| 3 | CRM de Clientes | PENDIENTE | 0% |
| 4 | Calendario Avanzado | PENDIENTE | 0% |
| 5 | Personal / RRHH | PENDIENTE | 0% |
| 6 | Presupuestos Completo | PENDIENTE | 0% |
| 7 | Contratos y Firma | PENDIENTE | 0% |
| 8 | Comunicaciones | PENDIENTE | 0% |
| 9 | Contabilidad Avanzada | PENDIENTE | 0% |
| 10 | Logistica y Vehiculos | PENDIENTE | 0% |
| 11 | Almacen Avanzado | PENDIENTE | 0% |
| 12 | Permisos y Seguridad | PENDIENTE | 0% |
| 13 | UX/UI y Limpieza | PENDIENTE | 0% |

---

*Ultima actualizacion: 2025-04-16*
