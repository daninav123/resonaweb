# Gaps para gestionar al 100% una empresa de eventos

**Fecha**: Abril 2026  
**Basado en**: Análisis real del código (schema Prisma, frontend, backend, rutas)

---

## ESTADO ACTUAL: QUÉ FUNCIONA BIEN

El panel cubre el **70-75%** de lo necesario. Funciona bien:

- Catálogo completo (productos, packs, montajes, personal, categorías, calculadora)
- Pedidos con ciclo de vida (estados, pagos, depósitos, devoluciones, Stripe)
- Eventos con 8 fases y tabs (timeline, checklist, staff, equipos, incidencias, notas, docs)
- CRM con scoring, comunicaciones y tareas
- Presupuestos con editor de secciones y generación PDF
- Contratos con firma digital y enlace público
- Facturación (lista, manual, Facturae XML)
- Staff/RRHH con disponibilidad, horas y pagos
- Inventario con unidades físicas y barcodes
- Logística: picking, hojas de carga, check-in/out material
- Calendario unificado (pedidos + recursos)
- Contabilidad con 5 tabs
- Flota de vehículos con alertas ITV/seguro
- Dashboard inteligente con KPIs y alertas

---

## LO QUE FALTA — POR PRIORIDAD

---

### PRIORIDAD 1 — FLUJO INTEGRADO (el gap más grave)

#### 1.1 Flujo Presupuesto → Pedido → Evento → Factura

**Problema**: Los módulos funcionan aislados. El admin tiene que crear manualmente cada cosa por separado: presupuesto en un sitio, pedido en otro, evento en otro, factura en otro.

**Lo que necesita**:
- Botón "Convertir en Pedido" desde un presupuesto aceptado → crea Order con items del presupuesto
- Botón "Crear Evento" desde un pedido → crea Event vinculado con datos pre-rellenados (cliente, fechas, equipos)
- Botón "Generar Contrato" desde presupuesto/pedido → crea Contract con datos del presupuesto
- Botón "Generar Factura" al completar evento → crea Invoice con datos del pedido
- **Vista de pipeline visual** que muestre cada lead pasando por: Consulta → Presupuesto → Contrato → Señal → Evento → Factura → Cobrado

**Impacto**: Sin esto, el admin pierde minutos por cada evento copiando datos entre módulos. Con 100 eventos/año, son horas perdidas.

#### 1.2 Control real de costes por evento (P&L)

**Problema**: `Event` tiene campos `estimatedCost`/`actualCost` pero son manuales. No hay desglose.

**Lo que necesita**:
- Cálculo automático de coste = personal (horas × tarifa) + transporte (km × tarifa) + subcontrataciones + gastos directos
- Tab "Rentabilidad" en EventDetailPage con: ingresos, costes desglosados, margen bruto, margen %
- Vista resumen de rentabilidad por tipo de evento (bodas vs corporativos vs festivales)

#### 1.3 Gestión de proveedores

**Problema**: No existe modelo `Supplier`. PurchaseLotsManager tiene campo "proveedor" como texto libre.

**Lo que necesita**:
- Modelo `Supplier` (nombre, CIF, contacto, condiciones de pago, categorías)
- Vincular PurchaseLot con Supplier
- Historial de compras por proveedor
- Pedidos a proveedores (purchase orders)
- Cuando necesitas subcontratar equipo para un evento, vincular con proveedor

---

### PRIORIDAD 2 — MÓDULOS DÉBILES QUE NECESITAN REFUERZO

#### 2.1 Almacén ↔ Productos (WarehouseManager)

**Problema**: 77 líneas. Solo gestiona ubicaciones abstractas. No vincula con productos reales.

**Lo que necesita**:
- Relación `WarehouseLocation ↔ Product/ProductUnit`
- Vista: "¿En qué estantería está la mesa de mezclas Yamaha TF5?"
- Mover producto de ubicación
- Lectura por barcode → ver ubicación
- Mapa visual del almacén (grid de zonas)

#### 2.2 Mantenimiento de equipos

**Problema**: Los equipos se rompen, necesitan revisiones. InventoryManager tiene estado de unidades pero no hay flujo de mantenimiento.

**Lo que necesita**:
- Modelo `MaintenanceRecord` (unidad, tipo: reparación/calibración/limpieza, coste, proveedor, fecha, notas)
- Historial de mantenimientos por unidad
- Alertas: "Esta unidad lleva X usos sin revisión" o "Esta PA tiene más de 2 años sin calibrar"
- Integración con costes del evento (si se rompe algo en un evento, registrar incidencia + mantenimiento)

#### 2.3 Gastos recurrentes mejorados

**Problema**: 89 líneas. Solo CRUD + marcar pagado. Sin historial ni proyecciones.

**Lo que necesita**:
- Historial de pagos (cada vez que marcas "pagado", queda registro con fecha y monto)
- Proyección: "En los próximos 3 meses voy a gastar X€ en gastos fijos"
- Categorización más rica: alquiler local, leasing furgoneta, seguro RC, licencias software, etc.
- Integración real con resumen financiero (que el margen neto reste gastos fijos)

#### 2.4 Plantillas de evento

**Problema**: Para cada boda el admin rellena los mismos equipos, mismo personal, misma checklist. No hay forma de reutilizar.

**Lo que necesita**:
- Modelo `EventTemplate` (nombre, tipo evento, equipos predefinidos, personal predefinido, checklist predefinida, timeline tipo)
- Botón "Crear evento desde plantilla" → pre-rellena todo
- Plantillas: "Boda estándar 100 pax", "Corporativo sala pequeña", "Festival aire libre"

---

### PRIORIDAD 3 — FUNCIONALIDADES IMPORTANTES PERO NO BLOQUEANTES

#### 3.1 Portal del cliente

**Problema**: El cliente solo puede firmar contratos vía enlace público. No puede ver estado de su evento, aprobar presupuesto, confirmar timeline, subir documentos.

**Lo que necesita**:
- Área privada del cliente (ya tienen login) con:
  - Ver sus presupuestos y aprobar/rechazar
  - Ver contratos pendientes de firma
  - Ver estado del evento (sin detalles internos)
  - Subir documentos (rider del venue, logos, playlist)
  - Ver facturas y estado de pagos

#### 3.2 Comisiones para comerciales

**Problema**: El schema tiene `Commission` pero no hay UI. Los comerciales asignados a QuoteRequest no ven sus comisiones.

**Lo que necesita**:
- Vista de comisiones por comercial
- Cálculo automático: % sobre presupuesto aceptado
- Estado: pendiente → pagada
- Dashboard del comercial con sus leads, presupuestos, comisiones

#### 3.3 Subcontrataciones

**Problema**: A veces no tienes suficientes altavoces y necesitas alquilar a otro proveedor. No hay registro.

**Lo que necesita**:
- Modelo `Subcontract` (evento, proveedor, items, coste, fechas, estado)
- Vincular con evento para calcular coste real
- Vincular con proveedor

#### 3.4 Calendario de vehículos

**Problema**: CalendarPage tiene Pedidos + Recursos pero no tiene tab de Vehículos. No puedes ver "¿qué furgoneta está disponible el sábado?"

**Lo que necesita**:
- Tab "Vehículos" en CalendarPage
- Vista: furgoneta X asignada a evento Y el sábado, libre el domingo
- Modelo `VehicleAssignment` vinculando vehículo con evento/pedido

#### 3.5 Contabilidad fiscal española

**Problema**: Facturae XML existe, pero falta integración fiscal real.

**Lo que necesita**:
- Libro de facturas emitidas (listado fiscal con base, IVA, retención)
- Libro de facturas recibidas (de proveedores)
- Exportación para modelo 303 IVA trimestral
- Exportación SII (Suministro Inmediato de Información) si facturación > 6M€
- Resumen anual: ingresos, gastos, IVA repercutido/soportado, beneficio

---

### PRIORIDAD 4 — MEJORAS DE PRODUCTIVIDAD

#### 4.1 Email marketing / campañas

**Problema**: NotificationsManager envía emails individuales. No hay envío masivo.

**Lo que necesita**:
- Segmentación de clientes (por tipo evento, por fecha última compra, por scoring CRM)
- Plantillas de campaña (Navidad, temporada bodas, Black Friday)
- Envío masivo programado
- Métricas: abiertos, clics

#### 4.2 Documentación post-evento / Portfolio

**Problema**: EventDocument existe como modelo pero no hay galería visual.

**Lo que necesita**:
- Galería de fotos del evento terminado (Cloudinary ya está)
- Vincular con tipo de evento para portfolio
- Compartir con cliente
- Usar en propuestas comerciales: "Mira lo que hicimos en esta boda"

#### 4.3 Vista móvil para técnicos en campo

**Problema**: El panel admin es desktop-first. Los técnicos en el evento necesitan:
- Ver hoja de carga en el móvil
- Hacer check-in de material escaneando barcode
- Reportar incidencia con foto desde el evento
- Ver timeline del día

**Lo que necesita**:
- PWA o vista responsiva dedicada para el rol "técnico"
- Funcionalidad offline (eventos al aire libre sin cobertura)

#### 4.4 Dashboards por rol

**Problema**: Solo hay un dashboard para todos.

**Lo que necesita**:
- **Gerente**: KPIs financieros, rentabilidad por evento, pipeline, carga de trabajo
- **Comercial**: Mis leads, mis presupuestos, mis comisiones, agenda
- **Jefe de almacén**: Stock, picking pendiente, devoluciones, mantenimientos
- **Técnico**: Mis eventos de la semana, hojas de carga, horarios

---

## RESUMEN EJECUTIVO

| Prioridad | Gaps | Esfuerzo estimado | Impacto |
|-----------|------|-------------------|---------|
| **P1 - Flujo integrado** | Pipeline visual, Presup→Pedido→Evento, P&L por evento, Proveedores | Alto (2-3 semanas) | **Crítico** — sin esto no puedes gestionar 100% |
| **P2 - Módulos débiles** | Almacén↔Productos, Mantenimiento, Gastos recurrentes, Plantillas evento | Medio (1-2 semanas) | **Alto** — reduce errores y tiempo |
| **P3 - Funcionalidades importantes** | Portal cliente, Comisiones, Subcontrataciones, Calendario vehículos, Fiscal | Medio-Alto (2-3 semanas) | **Medio-Alto** — profesionaliza la gestión |
| **P4 - Productividad** | Email marketing, Portfolio, Vista móvil, Dashboards por rol | Variable | **Medio** — mejora la experiencia |

### Orden recomendado de implementación:

1. **P1.1** — Flujo Presupuesto → Pedido → Evento (es el corazón del negocio)
2. **P1.2** — P&L por evento (saber si ganas o pierdes dinero)
3. **P2.4** — Plantillas de evento (ahorra tiempo inmediatamente)
4. **P2.1** — Almacén vinculado con productos (saber dónde está cada cosa)
5. **P1.3** — Proveedores (controlar a quién compras)
6. **P2.2** — Mantenimiento de equipos (proteger la inversión)
7. **P3.1** — Portal del cliente (profesionalidad)
8. **P3.4** — Calendario de vehículos (evitar conflictos)
9. **P3.5** — Contabilidad fiscal (obligatorio legalmente)
10. **P3.2** — Comisiones (motivar comerciales)
11. **P2.3** — Gastos recurrentes mejorados
12. **P3.3** — Subcontrataciones
13. **P4.3** — Vista móvil técnicos
14. **P4.4** — Dashboards por rol
15. **P4.1** — Email marketing
16. **P4.2** — Portfolio/documentación
