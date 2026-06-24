# Análisis Completo de Módulos - Admin Panel Resona

**Fecha**: Abril 2026  
**Total servicios backend**: 57 archivos  
**Total páginas admin frontend**: 50 archivos  

---

## 1. MÓDULOS REDUNDANTES (a eliminar/fusionar)

### 1.1 Dashboards (4 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `Dashboard.tsx` | 274 | ❌ OBSOLETO - versión original básica |
| `DashboardEnhanced.tsx` | 316 | ❌ OBSOLETO - mejora intermedia |
| `SmartDashboard.tsx` | 701 | ✅ EN USO - versión actual (importado en App.tsx) |
| `OnDemandDashboard.tsx` | 420 | ❌ OBSOLETO - experimento |

**Acción**: Eliminar `Dashboard.tsx`, `DashboardEnhanced.tsx`, `OnDemandDashboard.tsx`

### 1.2 Calculadora (2 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `CalculatorManager.tsx` | 370 | ❌ OBSOLETO |
| `CalculatorManagerNew.tsx` | 612 | ✅ EN USO (importado como `CalculatorManager` en App.tsx) |

**Acción**: Eliminar `CalculatorManager.tsx`, renombrar `CalculatorManagerNew.tsx` → `CalculatorManager.tsx`

### 1.3 Contabilidad (2 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `ContabilidadManager.tsx` | 622 | ❌ NO IMPORTADO directamente |
| `ContabilidadTabs.tsx` | 118 | ✅ EN USO (wrapper de tabs que contiene ContabilidadManager) |

**Acción**: Verificar si `ContabilidadManager.tsx` se usa dentro de Tabs. Si sí, mantener ambos. Si no, fusionar.

### 1.4 Packs (2 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `PacksManager.tsx` | 989 | ✅ EN USO |
| `PacksManager.new.tsx` | 608 | ❌ NO IMPORTADO |

**Acción**: Eliminar `PacksManager.new.tsx`

### 1.5 Products (2 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `ProductsManager.tsx` | 1355 | ✅ EN USO |
| `ProductsManagerFull.tsx` | 523 | ❌ NO IMPORTADO |

**Acción**: Eliminar `ProductsManagerFull.tsx`

### 1.6 Coupons (2 versiones → debería ser 1)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `CouponsManager.tsx` | 371 | ✅ EN USO |
| `CouponsManagerSimple.tsx` | 0 | ❌ VACÍO |

**Acción**: Eliminar `CouponsManagerSimple.tsx`

### 1.7 Servicios Backend .simple (duplicados)
| Archivo | Duplica a |
|---------|-----------|
| `category.service.simple.ts` | `category.service.ts` (mismas funciones, versión simplificada) |
| `customer.service.simple.ts` | `customer.service.ts` (mismas funciones, versión simplificada) |

**Acción**: Eliminar ambos `.simple.ts` - no están importados en ninguna ruta.

### 1.8 Customer vs CRM (solapamiento parcial)
| Servicio | Funciones |
|----------|-----------|
| `customer.service.ts` | getCustomerProfile, getCustomerStats, addCustomerNote, getCustomerHistory, getCustomerNotes, setCustomerStatus, getCustomerDocuments, searchCustomers, exportCustomerData |
| `crm.service.ts` | listCustomers, getCustomerProfile, updateCRM, recalculateScoring, addCommunication, getCommunications, addTask, toggleTask, deleteTask, getGlobalStats, getAllTags |

**Solapamiento**: `getCustomerProfile` existe en ambos.  
**Acción**: Mover funciones únicas de `customer.service.ts` a `crm.service.ts` y eliminar `customer.service.ts` si es posible, o dividir claramente: customer = datos base del usuario, CRM = datos comerciales.

### 1.9 Stripe vs Payment (solapamiento significativo)
| Servicio | Funciones |
|----------|-----------|
| `stripe.service.ts` | createPaymentIntent, confirmPayment, createRefund, getPaymentDetails, cancelPaymentIntent, handleWebhook, createRefundByPaymentIntent, createAdditionalPayment, createDepositPaymentLink, createTerminal* |
| `payment.service.ts` | createPaymentIntent, createPaymentIntentWithoutOrder, confirmPayment, createRefund, getPaymentStatus, handleWebhook, getPaymentMethods, getPaymentHistory |

**Solapamiento**: createPaymentIntent, confirmPayment, createRefund, handleWebhook duplicados.  
**Acción**: `payment.service.ts` debería ser un wrapper/orquestador que use `stripe.service.ts` internamente. Eliminar la duplicación.

### 1.10 Logistics vs Vehicle (solapamiento parcial)
| Servicio | Enfoque |
|----------|---------|
| `logistics.service.ts` | Planificación rutas, asignar vehículos, entregas, recogidas |
| `vehicle.service.ts` | CRUD de vehículos, alertas ITV/seguro |

**No es redundante**: Logistics gestiona operaciones, Vehicle gestiona la flota.  
**Problema**: Logistics usa `interface Vehicle` local en vez del modelo Prisma `Vehicle`.  
**Acción**: Integrar `logistics.service.ts` para que use el modelo Prisma `Vehicle` en vez del tipo local.

---

## 2. MÓDULOS QUE NECESITAN REDISEÑO

### 2.1 `contract.service.ts` vs `contractMgmt.service.ts`
- `contract.service.ts`: Solo genera PDF de contratos de alquiler (1 función)
- `contractMgmt.service.ts`: CRUD completo de contratos con firma digital

**Rediseño**: Fusionar en un único servicio. `generateContract(orderId)` debería ser un método más dentro de `contractMgmt.service.ts`.

### 2.2 `contabilidad.service.ts` + `recurring.service.ts`
- `contabilidad.service.ts`: Análisis financiero, rentabilidad, gastos manuales, alquileres
- `recurring.service.ts`: CRUD gastos recurrentes

**Rediseño**: `recurring.service.ts` debería integrarse dentro de contabilidad o al menos referenciarse desde el resumen financiero. Actualmente los gastos recurrentes NO aparecen en el `getFinancialSummary`.

### 2.3 `event.service.ts` (muy grande, 470+ líneas)
Funciones: list, getById, create, update, delete, updateStatus, getCalendarEvents, addTimelineItem, updateTimelineItem, deleteTimelineItem, reorderTimeline, addChecklistItem, toggleChecklistItem, deleteChecklistItem, addStaffAssignment, removeStaffAssignment, updateStaffAssignment, addEquipment, updateEquipment, removeEquipment, addNote, deleteNote, addIncident, resolveIncident, addDocument, deleteDocument, getStats, getUpcoming, getOverdueChecklist.

**Rediseño**: Dividir en sub-servicios:
- `event-core.service.ts` (CRUD + status + calendar)
- `event-timeline.service.ts` (timeline items)
- `event-checklist.service.ts` (checklist items)
- `event-resources.service.ts` (staff + equipment)

### 2.4 `order.service.ts` (muy grande, 1100+ líneas)
Funciones: createOrder, getUserOrders, getOrderById, updateOrderStatus, updateOrder, cancelOrder, deleteOrder, getAllOrders, getOrderStats, getUpcomingEvents, markAsReturned, captureDeposit, releaseDeposit.

**Rediseño**: Ya existe `orderModification.service.ts`, `orderNote.service.ts`, `orderExpiration.service.ts` como sub-servicios. El servicio principal sigue siendo demasiado grande. Considerar extraer `order-deposit.service.ts` y `order-stats.service.ts`.

### 2.5 `product.service.ts` (muy grande, 1000+ líneas)
**Rediseño**: Extraer `product-stock.service.ts` y `product-bulk.service.ts`.

### 2.6 `staff.service.ts` - Falta conexión con Event
El modelo `StaffMember` y `EventStaffAssignment` del evento no están conectados. Los eventos asignan personal por nombre/string, no por relación con `StaffMember`.

**Rediseño**: Vincular `EventStaffAssignment.staffName` con `StaffMember.id` para evitar inconsistencias.

### 2.7 `PersonalManager.tsx` (frontend) - Confuso
Gestiona productos de la categoría "Personal" (equipamiento humano de alquiler), NO gestión de RRHH. El nombre confunde con `StaffManager.tsx`.

**Rediseño**: Renombrar a `PersonnelProductsManager.tsx` o `StaffProductsManager.tsx` para diferenciar de RRHH.

---

## 3. FUNCIONES QUE FALTAN

### 3.1 Personal/RRHH (`staff.service.ts`)
- ❌ `getAvailabilityCalendar(month, year)` - Vista calendario de disponibilidad
- ❌ `bulkAddAvailability(staffId, dateRange, type)` - Bloquear rango de fechas
- ❌ `getStaffForEvent(date, specialty)` - Buscar personal disponible para un evento
- ❌ `exportPayroll(month, year)` - Exportar nóminas/pagos a CSV/PDF
- ❌ `getExpiringDocuments()` - Alertas de contratos/seguros que vencen

### 3.2 Contratos (`contractMgmt.service.ts`)
- ❌ `createFromTemplate(templateId, variables)` - Crear contrato desde plantilla
- ❌ `listTemplates()` / `createTemplate()` - Gestión de plantillas
- ❌ `generatePDF(contractId)` - Exportar contrato a PDF
- ❌ `sendEmail(contractId)` - Enviar contrato por email (solo cambia status, no envía)
- ❌ `duplicate(contractId)` - Duplicar contrato existente
- ❌ `linkToBudget(contractId, budgetId)` - Vincular con presupuesto

### 3.3 Vehículos (`vehicle.service.ts`)
- ❌ `updateKm(vehicleId, km)` - Actualizar kilómetros
- ❌ `addMaintenanceLog(vehicleId, data)` - Registro de mantenimiento
- ❌ `getMaintenanceHistory(vehicleId)` - Historial de mantenimiento
- ❌ `assignToEvent(vehicleId, eventId, date)` - Asignar vehículo a evento
- ❌ `getAvailableForDate(date)` - Vehículos disponibles en una fecha
- ❌ `getCostReport(vehicleId, period)` - Informe de costes por vehículo

### 3.4 Almacén (`warehouse.service.ts`)
- ❌ `assignProductToLocation(productId, locationId)` - Asignar producto a ubicación
- ❌ `getProductLocation(productId)` - ¿Dónde está un producto?
- ❌ `moveProduct(productId, fromLocationId, toLocationId)` - Mover producto
- ❌ `getOccupancyReport()` - Informe de ocupación
- ❌ `searchByZone(zone)` - Buscar por zona
- ❌ `updateCurrentItems(locationId, delta)` - Actualizar ocupación

### 3.5 Gastos Recurrentes (`recurring.service.ts`)
- ❌ `getAnnualProjection()` - Proyección anual de gastos
- ❌ `getPaymentHistory(expenseId)` - Historial de pagos de un gasto
- ❌ `exportToCSV(period)` - Exportar datos

### 3.6 CRM (`crm.service.ts`)
- ❌ `getCustomerTimeline(userId)` - Timeline completo del cliente
- ❌ `bulkAssign(userIds, assignedTo)` - Asignación masiva
- ❌ `getConversionFunnel()` - Embudo de conversión
- ❌ `exportCustomers(filters)` - Exportar clientes filtrados
- ❌ `getFollowUpReminders()` - Recordatorios de seguimiento

### 3.7 Eventos (`event.service.ts`)
- ❌ `duplicateEvent(eventId)` - Duplicar evento
- ❌ `createFromTemplate(templateId)` - Crear desde plantilla
- ❌ `getConflicts(date, resources)` - Detectar conflictos reales con DB
- ❌ `exportEvent(eventId, format)` - Exportar evento a PDF
- ❌ `sendSummaryEmail(eventId)` - Enviar resumen por email

### 3.8 Integraciones que faltan entre módulos
- ❌ **Staff ↔ Event**: StaffMember debería poder asignarse directamente a eventos
- ❌ **Vehicle ↔ Event**: Vehicle debería poder asignarse directamente a eventos
- ❌ **Contract ↔ Budget**: Contrato debería generarse automáticamente desde presupuesto
- ❌ **Recurring ↔ Contabilidad**: Gastos recurrentes deberían aparecer en resumen financiero
- ❌ **Warehouse ↔ Product**: Ubicaciones deberían vincularse con productos/unidades
- ❌ **CRM ↔ Event**: Historial de eventos del cliente en su perfil CRM

---

## 4. RESUMEN DE ACCIONES PRIORITARIAS

### Alta prioridad
1. **Eliminar 8 archivos frontend obsoletos** (Dashboard x2, OnDemand, CalculatorManager, PacksManager.new, ProductsManagerFull, CouponsManagerSimple, category.service.simple, customer.service.simple)
2. **Fusionar** `contract.service.ts` → `contractMgmt.service.ts`
3. **Conectar** `recurring.service.ts` con `contabilidad.service.ts`
4. **Vincular** `StaffMember` con `EventStaffAssignment`

### Media prioridad
5. Resolver solapamiento `payment.service.ts` vs `stripe.service.ts`
6. Resolver solapamiento `customer.service.ts` vs `crm.service.ts`
7. Dividir `event.service.ts` en sub-servicios
8. Implementar funciones faltantes en `warehouse.service.ts`
9. Implementar funciones faltantes en `vehicle.service.ts`

### Baja prioridad
10. Renombrar `PersonalManager.tsx` para evitar confusión
11. Integrar logistics con modelo Prisma Vehicle
12. Implementar plantillas de contratos
13. Implementar exportaciones CSV/PDF en módulos nuevos
