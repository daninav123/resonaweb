# Análisis Completo - Páginas del Panel de Admin

**Fecha**: Abril 2026 (actualizado)  
**Total páginas admin**: 50 archivos TSX raíz + 4 sub-páginas contabilidad = 54 TSX total  
**Total líneas**: ~24.738

---

## ESTRUCTURA DEL MENÚ ACTUAL (9 secciones)

### 1. Análisis y Reportes
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Dashboard | `SmartDashboard.tsx` | 701 | KPIs tiempo real, eventos de hoy/semana, pipeline de pedidos, alertas (stock/reembolsos/presupuestos), facturación mensual, pedidos recientes, carga de trabajo |
| Estadísticas | `StatisticsPage.tsx` | 724 | 3 tabs (general/inventario/amortización), métricas de rendimiento, top productos, top clientes, gráfico ingresos, distribución por estado, filtro por período (7/30/90 días) |
| Contabilidad | `ContabilidadTabs.tsx` → 5 sub-tabs | 130 + 1460 | Resumen financiero, alquileres (costes reales), montajes (costes reales), gastos manuales, gastos recurrentes |
| Lotes de Compra | `PurchaseLotsManager.tsx` | 576 | CRUD lotes de compra, asignar a producto, precio/unidad, proveedor, búsqueda |

**Nota:** `AnalyticsPage.tsx` y `ContabilidadManager.tsx` fueron **eliminados** en junio 2025.

---

### 2. Gestión de Productos
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Productos | `ProductsManager.tsx` | 1355 | CRUD productos completo, gestión imágenes (Cloudinary), componentes de pack, filtro categoría, búsqueda, precios (base/fin semana), stock, SEO (slug/meta), activar/desactivar |
| Packs | `PacksManager.tsx` | 969 | CRUD packs (conjuntos de productos), componentes con cantidades, descuento %, categoría, duplicar pack, imagen, filtro/búsqueda |
| Personal | `PersonnelProductsManager.tsx` | 512 | CRUD productos tipo "personal" (técnicos, DJ, fotógrafo), precio por jornada, categoría especial "Personal" |
| Montajes | `MontajesManager.tsx` | 1350 | CRUD montajes/desmontajes, componentes, precio/coste/beneficio, imagen, duplicar, filtro por categoría, ordenar por nombre/precio/beneficio |
| Categorías | `CategoriesManager.tsx` | 597 | CRUD categorías, slug auto, imagen, orden, activar/desactivar |
| Cat. Extras | `ExtraCategoriesManager.tsx` | 575 | CRUD categorías de extras para calculadora, icono, color, extras asignados |
| Calculadora | `CalculatorManager.tsx` | 612 | Configuración calculadora de eventos, tipos de evento, extras por categoría, productos del catálogo asignados |

---

### 3. Ventas y Pedidos
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Pedidos | `OrdersManager.tsx` | 374 | Lista de pedidos, filtro por estado, búsqueda, enlace a detalle |
| Detalle Pedido | `OrderDetailPage.tsx` | 951 | Vista completa del pedido: items, cliente, dirección, estado, timeline, notas, cambiar estado, cancelar, marcar devuelto, generar contrato PDF, generar factura PDF, generar Facturae XML, depósito (capturar/liberar), QR pago, editar pedido |
| CRM Clientes | `CRMPage.tsx` | 237 | Lista clientes con scoring, filtro tipo/búsqueda, stats globales, enlace a detalle |
| CRM Detalle | `CRMDetailPage.tsx` | 470 | Perfil cliente: 4 tabs (resumen/historial/comunicaciones/tareas), editar datos CRM, recalcular scoring, añadir comunicaciones, gestionar tareas |
| Solicitudes | `QuoteRequestsManager.tsx` | 1762 | Lista solicitudes presupuesto, crear/editar presupuesto con secciones, buscar productos, items personalizados, generar PDF, enviar email, estados, formulario completo de contacto |
| Cupones | `CouponsManager.tsx` | 371 | CRUD cupones descuento, tipo (% o fijo), fechas, usos máximos, monto mínimo |
| Reembolsos | `RefundsPage.tsx` | 349 | Lista reembolsos, aprobar/rechazar con motivo |

---

### 4. Operaciones
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Eventos | `EventsManager.tsx` | 563 | Lista eventos, vista lista/kanban, crear evento, filtro fase/tipo, búsqueda, stats, enlace a detalle |
| Detalle Evento | `EventDetailPage.tsx` | 651 | 8 tabs: resumen, timeline, checklist, equipo, personal, incidencias, notas, documentos. Cambiar fase. |
| Calendario | `CalendarPage.tsx` → 2 tabs | 59+519+390 = 968 | Wrapper con tabs: Pedidos (`CalendarManager.tsx` - big-calendar, vista mes/semana/día, modal detalle) + Recursos (`ResourceCalendar.tsx` - timeline visual) |
| Personal/RRHH | `StaffPage.tsx` → 3 tabs | 58+172+323+304 = 857 | Wrapper con tabs: Equipo (CRUD), Disponibilidad (calendario mensual, bloquear fechas), Horas y Pagos (registro, informe mensual, toggle pagado) |

---

### 4b. Logística
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Picking List | `PickingListPage.tsx` | 322 | Lista consolidada preparación material, progreso interactivo, check items, desglose por pedido, impresión |
| Hojas de Carga | `LoadingSheetPage.tsx` | 485 | Hojas de carga imprimibles por evento/pedido, asignación vehículos, equipos, personal, cliente, impresión |
| Check-in/out Material | `MaterialCheckPage.tsx` | 468 | Lista pedidos con items, marcar check-out/in, condición devolución, notas, filtro estado, batch save |
| Envío y Montaje | `ShippingConfigPage.tsx` | 304 | Configuración precios de envío por zona, montaje, horarios, recargos |
| Flota Vehículos | `VehiclesManager.tsx` | 91 | CRUD vehículos, placa, marca, modelo, tipo, capacidad, estado, ITV, seguro, alertas mantenimiento |

---

### 5. Documentos y Facturación
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Facturas | `InvoicesListPage.tsx` | 491 | Lista facturas, filtro estado, búsqueda, descargar PDF individual, generar Facturae, descarga masiva por período |
| Factura Manual | `ManualInvoicePage.tsx` | 494 | Crear factura manual: datos cliente, items con cantidades/precios, IVA, IRPF, notas, generar PDF/Facturae |
| Contratos | `ContractsManager.tsx` | **150** | **CRUD contratos con firma digital, plantillas predefinidas (alquiler/servicio integral), descargar PDF, duplicar contrato, enviar al cliente, copiar enlace firma, buscar/filtro** |
| Datos Facturación | `CompanySettingsPage.tsx` | 329 | Datos empresa (nombre, CIF, dirección, email, teléfono, logo, colores), datos bancarios, pie de factura |
| Gastos Recurrentes | `RecurringExpensesManager.tsx` | 89 | CRUD gastos recurrentes, frecuencia, categoría, día de pago, marcar como pagado, stats |

---

### 5b. Inventario
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Disponibilidad Equipos | `EquipmentAvailabilityPage.tsx` | 402 | Calendario visual disponibilidad por producto/día, color coding, filtro categoría/búsqueda, detalle reservas, backend /api/v1/availability |
| Stock y Alertas | `StockPage.tsx` → 2 tabs | 59+537+185 = 781 | Wrapper con tabs: Gestión (`StockManager.tsx` - stock/ajustar) + Alertas (`StockAlerts.tsx` - bajo/agotado, prioridad) |
| Inventario Unidades | `InventoryManager.tsx` | 839 | Gestión unidades físicas (barcodes), vista resumen/unidades, crear unidades, detalle unidad, cambiar estado, notas, reparaciones, imprimir etiqueta |
| Almacén | `WarehouseManager.tsx` | 77 | CRUD ubicaciones (zona/estantería/posición), ocupación, agrupado por zona |
| Lotes de Compra | `PurchaseLotsManager.tsx` | 576 | CRUD lotes de compra, asignar a producto, precio/unidad, proveedor, búsqueda |

---

### 6. Administración
| Página | Archivo | Líneas | Funciones |
|--------|---------|--------|-----------|
| Informes | `ReportsPage.tsx` | 338 | 4 tabs (Financiero/Equipos/Eventos/Personal), exportar CSV, filtros por período, resumen KPIs, tablas de utilización |
| Notificaciones | `NotificationsManager.tsx` | 322 | Historial notificaciones, envío de emails ad-hoc, plantillas email (recordatorio/confirmación/agradecimiento), stats, filtros |
| Usuarios | `UsersManager.tsx` | 261 | Lista usuarios registrados, cambiar nivel/rol |
| Blog | `BlogManager.tsx` | 583 | CRUD posts blog, editor, generar con IA (OpenAI), categorías blog, stats, publicar/despublicar, SEO (slug/meta) |
| Backups | `BackupManager.tsx` | 351 | Crear backup DB, listar backups, descargar, subir backup |
| Configuración | `SettingsManager.tsx` | 176 | Configuraciones generales del sistema |

---

### 7. Páginas con ruta pero FUERA del menú admin
| Página | Archivo | Líneas | Ruta | Notas |
|--------|---------|--------|------|-------|
| POS | `POSPage.tsx` | 271 | `/pos/:orderId` | Terminal punto de venta (Stripe Terminal). NO usa AdminLayout, ruta fuera de /admin. |

---

### 8. Archivos huérfanos (no importados ni en menú)
| Archivo | Líneas | Razón |
|---------|--------|-------|
| `AdminQuoteRequestsPageV2.tsx` | ? | Existe en `/pages/` (no en admin/), no importado en App.tsx |
| `POSPage.css` | — | CSS suelto para POSPage |

**Nota:** `ContabilidadManager.tsx`, `BudgetManager.tsx`, `BudgetEditor.tsx` y `AnalyticsPage.tsx` ya fueron **eliminados** anteriormente.

---

## DIAGNÓSTICO: QUÉ JUNTAR, SEPARAR Y MEJORAR

---

### 🔗 A. COSAS QUE HAY QUE JUNTAR (fusionar/consolidar)

#### A1. Analytics + Dashboard + Estadísticas → 2 páginas máximo
- ✅ **COMPLETADO**: `AnalyticsPage.tsx` fue eliminada. Quedan Dashboard y Estadísticas.

#### A2. CalendarManager + ResourceCalendar → 1 página con tabs
- ✅ **COMPLETADO**: Fusionados en `CalendarPage.tsx` con tabs "Pedidos" + "Recursos".

#### A3. StockManager + StockAlerts → 1 página con tabs
- ✅ **COMPLETADO**: Fusionados en `StockPage.tsx` con tabs "Gestión" + "Alertas".

#### A4. ContabilidadTabs + RecurringExpensesManager → Contabilidad unificada
- ✅ **COMPLETADO**: `RecurringExpensesManager` ya está integrado como 5ª tab dentro de `ContabilidadTabs`.

#### A5. InvoicesListPage + ManualInvoicePage → Misma sección
- Ya están en el mismo grupo de menú, pero serían más eficientes como tabs de una misma página.
- **Acción**: Opcional. Podrían unirse con tab "Listado" / "Crear Manual" / "Descarga Masiva".

#### A6. Productos + Packs + Personal + Montajes → Mejor agrupación
- Son 4 páginas independientes que gestionan el catálogo. El usuario debe ir a cada una por separado.
- `PacksManager.tsx` y `MontajesManager.tsx` comparten un 60% de la lógica (ambos gestionan packs con componentes).
- **Acción**: Considerar una vista unificada `CatalogManager.tsx` con tabs "Productos" / "Packs" / "Montajes" / "Personal". O al menos, extraer componentes compartidos entre Packs y Montajes.

---

### ✂️ B. COSAS QUE HAY QUE SEPARAR

#### B1. QuoteRequestsManager.tsx (1762 líneas) — DEMASIADO GRANDE
- Contiene: lista de solicitudes, formulario de creación, editor de presupuesto con secciones, buscador de productos, generador PDF, gestión de estados.
- **Acción**: Dividir en:
  - `QuoteRequestsList.tsx` — Lista y filtros
  - `QuoteRequestDetail.tsx` — Detalle de una solicitud
  - `QuoteBuilder.tsx` — Editor de presupuesto (secciones + items)
  - `QuotePDFGenerator.tsx` — Generación de PDF

#### B2. ProductsManager.tsx (1355 líneas) — DEMASIADO GRANDE
- Contiene: CRUD completo, modal de creación, modal de edición, gestión de imágenes, componentes de pack.
- **Acción**: Extraer:
  - `ProductForm.tsx` — Formulario crear/editar (compartido)
  - `ProductImageManager.tsx` — Gestión de imágenes
  - `ProductPackComponents.tsx` — Gestión de componentes

#### B3. MontajesManager.tsx (1350 líneas) — GRANDE
- Similar a ProductsManager pero para montajes.
- **Acción**: Extraer componentes compartidos con PacksManager.

#### B4. OrderDetailPage.tsx (951 líneas) — GRANDE PERO REDUCIDO
- Contiene: toda la información del pedido, modales, generación PDF/Facturae, gestión depósitos, QR.
- **Acción**: Extraer:
  - `OrderStatusActions.tsx` — Cambiar estado, cancelar, devolver
  - `OrderDocuments.tsx` — Facturas, contratos, Facturae
  - `OrderDepositManager.tsx` — Gestión de fianzas

#### B5. BudgetEditor.tsx — ELIMINADO
- ✅ Ya fue eliminado en limpieza anterior.

---

### 🔧 C. COSAS QUE HAY QUE MEJORAR

#### C1. Páginas muy pequeñas / poco funcionales
| Página | Líneas | Problema | Estado |
|--------|--------|----------|--------|
| `WarehouseManager.tsx` | 77 | Solo CRUD básico de ubicaciones. No vincula productos ni muestra ocupación real. | Pendiente |
| `VehiclesManager.tsx` | 91 | CRUD + alertas ITV/seguro. Vinculado a eventos via LoadingSheetPage. | ✅ Mejorado |
| `RecurringExpensesManager.tsx` | 89 | Solo CRUD + marcar pagado. No hay proyecciones, historial, ni integración con contabilidad. | Pendiente |
| `ContractsManager.tsx` | **150** | **MEJORADO: Plantillas, descarga PDF, duplicar, enlace firma pública.** | ✅ Mejorado |
| `StaffManager.tsx` → `StaffPage.tsx` | **857** | **MEJORADO: 3 tabs (Equipo/Disponibilidad/Horas). Calendario mensual, bloqueo fechas, registro horas, toggle pagado.** | ✅ Mejorado |

#### C2. Duplicación de lógica entre páginas
- `PacksManager.tsx` y `MontajesManager.tsx` comparten ~60% de código (CRUD packs, componentes, filtros).
- `ContabilidadResumen.tsx` ya cubre todo (el antiguo `ContabilidadManager.tsx` fue eliminado).
- Múltiples páginas reimplementan tablas con búsqueda/filtro sin componente compartido.

#### C3. Falta consistencia UI
- Algunas páginas usan `useQuery` (react-query): CalculatorManager.
- El resto usa `useState` + `useEffect` + `loadData()` manual.
- **Acción**: Migrar todo a `react-query` o todo a hooks manuales. Preferible react-query.

#### C4. Páginas sin conexión entre sí
- ~~**Staff ↔ Eventos**~~: ✅ Personal vinculado via StaffAvailabilityCalendar + LoadingSheetPage + StaffWorkLogs.
- ~~**Vehículos ↔ Eventos**~~: ✅ Vehículos asignados a eventos via LoadingSheetPage.
- **Almacén ↔ Productos**: Las ubicaciones no muestran qué productos hay. (Pendiente)
- ~~**Gastos Recurrentes ↔ Contabilidad**~~: ✅ Ya integrados en ContabilidadTabs.
- **Contratos ↔ Presupuestos**: No se genera contrato desde presupuesto automáticamente. (Pendiente)

#### C5. Menú — REORGANIZADO
- ✅ Gastos Recurrentes integrado en Contabilidad como tab
- ✅ Lotes de Compra movido a sección Inventario
- ✅ Stock fusionado con Alertas en StockPage, disponible en menú Inventario
- ✅ AnalyticsPage eliminada
- ✅ Calendarios fusionados en CalendarPage con tabs
- ✅ Logística separada de Operaciones como sección propia (9 secciones total)

---

## RESUMEN DE ACCIONES PRIORITARIAS

### 🔴 Alta Prioridad — ✅ TODO COMPLETADO
1. ✅ **Eliminar archivos obsoletos**: `ContabilidadManager.tsx`, `BudgetManager.tsx`, `BudgetEditor.tsx`
2. ✅ **Eliminar `AnalyticsPage.tsx`** — 100% redundante
3. ✅ **Integrar gastos recurrentes en contabilidad**
4. ✅ **Dividir `QuoteRequestsManager.tsx`** — PDF extraído
5. ✅ **Reorganizar menú**: 9 secciones bien estructuradas (Dashboard, Análisis, Catálogo, Ventas, Operaciones, Logística, Inventario, Documentos, Administración)

### 🟡 Media Prioridad — ✅ CASI TODO COMPLETADO
6. ✅ **Fusionar calendarios** — `CalendarPage.tsx` con 2 tabs
7. ✅ **Fusionar Stock + Stock Alerts** — `StockPage.tsx` con 2 tabs
8. Pendiente: **Extraer componentes de `OrderDetailPage.tsx`** (951 líneas) y `ProductsManager.tsx` (1355 líneas)
9. Pendiente: **Extraer componentes compartidos** entre PacksManager y MontajesManager
10. ✅ **Conectar módulos**: Staff↔Events, Vehicle↔Events, GastosRecurrentes↔Contabilidad

### 🟢 Baja Prioridad — PARCIALMENTE COMPLETADO
11. Pendiente: Migrar a react-query uniformemente
12. Pendiente: Crear componente tabla reutilizable
13. ✅ **Mejorar Contracts** (plantillas+PDF), ✅ **Staff** (3 tabs), ✅ **Vehicles** (alertas+asignación). Pendiente: Warehouse, RecurringExpenses
14. Pendiente: Crear sistema de presupuestos conectado

---

## MENÚ ACTUAL IMPLEMENTADO (Abril 2026) — Verificado contra AdminLayout.tsx

```
📊 Dashboard
  └─ Centro de Control (SmartDashboard)

📈 Análisis
  ├─ Estadísticas
  └─ Contabilidad (5 tabs: Resumen, Alquileres, Montajes, Gastos, Recurrentes)

📦 Catálogo
  ├─ Productos
  ├─ Packs
  ├─ Personal (productos)
  ├─ Montajes
  ├─ Categorías
  ├─ Cat. Extras
  └─ Calculadora

🛒 Ventas
  ├─ Pedidos
  ├─ CRM Clientes
  ├─ Presupuestos
  ├─ Cupones
  └─ Reembolsos

⚡ Operaciones
  ├─ Eventos
  ├─ Calendario (2 tabs: Pedidos + Recursos)
  └─ Personal / RRHH (3 tabs: Equipo, Disponibilidad, Horas)

🚚 Logística
  ├─ Picking List
  ├─ Hojas de Carga
  ├─ Check-in/out Material
  ├─ Envío y Montaje
  └─ Flota Vehículos

� Inventario
  ├─ Disponibilidad Equipos
  ├─ Stock y Alertas (2 tabs: Gestión + Alertas)
  ├─ Unidades / Códigos
  ├─ Almacén
  └─ Lotes de Compra

📄 Documentos
  ├─ Facturas
  ├─ Factura Manual
  ├─ Contratos (plantillas + PDF + firma digital)
  └─ Datos Empresa

⚙️ Administración
  ├─ Informes (exportar CSV)
  ├─ Notificaciones
  ├─ Usuarios
  ├─ Blog
  ├─ Backups
  └─ Configuración

📱 Fuera del menú admin:
  └─ POS Terminal (/pos/:orderId) — sin AdminLayout
```

---

## ✅ CAMBIOS IMPLEMENTADOS (Junio 2025)

### Alta Prioridad - COMPLETADO
1. ✅ **Archivos obsoletos eliminados**: `ContabilidadManager.tsx`, `BudgetManager.tsx`, `BudgetEditor.tsx`
2. ✅ **AnalyticsPage eliminada** — ruta y menú limpiados
3. ✅ **Gastos recurrentes integrados en Contabilidad** — nueva tab "Gastos Recurrentes" dentro de ContabilidadTabs + desglose visible en resumen financiero
4. ✅ **Menú reorganizado**: 9 secciones (Dashboard, Análisis, Catálogo, Ventas, Operaciones, Logística, Inventario, Documentos, Administración)
5. ✅ **QuoteRequestsManager refactorizado** — PDF extraído a `utils/quotePdfGenerator.ts` (reducido de 2034 a 1762 líneas)

### Media Prioridad - COMPLETADO
6. ✅ **Calendarios fusionados** — `CalendarPage.tsx` con tabs (Pedidos + Recursos)
7. ✅ **Stock fusionado** — `StockPage.tsx` con tabs (Gestión + Alertas)
8. ✅ **StockManager accesible** — ahora en menú Inventario > "Stock y Alertas"

---

## ✅ CAMBIOS IMPLEMENTADOS (Abril 2026)

### Nuevas páginas de Operaciones y Logística
9. ✅ **EquipmentAvailabilityPage** (402 líneas) — Calendario visual disponibilidad equipos. Backend: `/api/v1/availability`. Menú: Inventario > Disponibilidad Equipos.
10. ✅ **MaterialCheckPage** (468 líneas) — Check-in/out material por pedido. Menú: Logística > Check-in/out Material.
11. ✅ **LoadingSheetPage** (485 líneas) — Hojas de carga imprimibles. Menú: Logística > Hojas de Carga.
12. ✅ **PickingListPage** (322 líneas) — Lista consolidada preparación material. Menú: Logística > Picking List.

### Staff mejorado con tabs
13. ✅ **StaffPage** (58 líneas) — Wrapper con 3 tabs:
    - `StaffManager.tsx` (172 líneas) — CRUD personal
    - `StaffAvailabilityCalendar.tsx` (323 líneas) — Calendario mensual disponibilidad, bloquear fechas
    - `StaffWorkLogs.tsx` (304 líneas) — Registro horas, informe mensual, toggle pagado
    - Frontend service ampliado: `getAvailabilityCalendar`, `getAvailableForEvent`, `bulkAddAvailability`

### Contratos mejorados
14. ✅ **ContractsManager mejorado** (150 líneas) — Plantillas predefinidas (Alquiler estándar, Servicio integral), descargar PDF, duplicar contrato, enlace firma pública.

### Nuevas páginas de Administración
15. ✅ **NotificationsManager** (322 líneas) — Historial notificaciones, envío emails ad-hoc, plantillas email (recordatorio/confirmación/agradecimiento). Menú: Admin > Notificaciones.
16. ✅ **ReportsPage** (338 líneas) — 4 tabs (Financiero/Equipos/Eventos/Personal), exportar CSV, filtros período. Menú: Admin > Informes.

### Módulos del roadmap (Fase 2-4)
17. ✅ **VehicleCalendarPage** — Calendario visual de vehículos con asignaciones. Menú: Logística > Calendario Vehículos.
18. ✅ **CommissionsManager** — Gestión comisiones comerciales, filtros, marcar pagadas. Menú: Ventas > Comisiones.
19. ✅ **SubcontractsManager** — CRUD subcontrataciones con estadísticas. Menú: Operaciones > Subcontrataciones.
20. ✅ **FiscalAccountingPage** — Libro facturas emitidas/recibidas + estimación Modelo 303 (IVA). Menú: Documentos > Contabilidad Fiscal.
21. ✅ **ClientPortalPage** — Consulta datos cliente por email (presupuestos, pedidos, facturas, eventos, contratos). Menú: Ventas > Portal Cliente.
22. ✅ **TechMobileView** — Vista móvil responsive para técnicos: eventos asignados, navegación GPS, contactos directos. Menú: Operaciones > Vista Técnicos.
23. ✅ **RoleDashboardPage** — Dashboard adaptado por rol (Director/Comercial/Almacén/Técnico). Menú: Admin > Dashboard por Rol.
24. ✅ **EmailMarketingPage** — Campañas email con plantillas predefinidas y envío masivo. Menú: Admin > Email Marketing.
25. ✅ **PortfolioManager** — Galería post-evento con importación desde eventos, publicar/destacar. Menú: Ventas > Portfolio.

### Backend services añadidos
- ✅ `clientPortal.service.ts` — Datos de cliente por email (user, quotes, orders, invoices, events, contracts)
- ✅ `recurring.service.ts` mejorado — `getPaymentHistory()`, `getProjections(months)`
- ✅ Rutas: `/api/v1/client-portal`, `/api/v1/client-portal/admin/:email`

### Conexiones entre módulos resueltas
- ✅ **Staff ↔ Eventos**: via StaffAvailabilityCalendar + LoadingSheetPage + StaffWorkLogs
- ✅ **Vehículos ↔ Eventos**: via LoadingSheetPage (asignación por evento)
- ✅ **Gastos Recurrentes ↔ Contabilidad**: ya integrado en ContabilidadTabs
- ✅ **Portal Cliente ↔ Pedidos/Facturas**: via clientPortal.service.ts

### Verificación
- ✅ TypeScript frontend: compila sin errores (`npx tsc --noEmit`)
- ✅ TypeScript backend: compila sin errores (`npx tsc --noEmit`)
- ✅ Todas las rutas registradas en `App.tsx`
- ✅ Todas las entradas de menú en `AdminLayout.tsx`
- ✅ Backend: todas las routes registradas en `index.ts`

---

## PENDIENTE (prioridad baja)

- Extraer componentes compartidos entre PacksManager (969 líneas) y MontajesManager (1350 líneas)
- Dividir OrderDetailPage.tsx (951 líneas) y ProductsManager.tsx (1355 líneas) en sub-componentes
- **Almacén ↔ Productos**: vincular ubicaciones con productos reales
- **Contratos ↔ Presupuestos**: generar contrato automático desde presupuesto
- Migrar a react-query uniformemente
- Mejorar WarehouseManager (77 líneas) con vinculación real de productos
- Limpiar archivo huérfano `AdminQuoteRequestsPageV2.tsx`
- Limpiar `POSPage.css` (CSS suelto)
