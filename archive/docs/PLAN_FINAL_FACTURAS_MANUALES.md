# 📋 PLAN: Sistema Facturas Manuales Admin

## 🎯 OBJETIVO:
Permitir al admin crear facturas para eventos externos (no web), respetando numeración y normativa española con Facturae.

## ✅ COMPLETADO HASTA AHORA:

### Tareas 1-5: ✅
1. ✅ Mojibakes arreglados
2. ✅ Botón descarga factura arreglado
3. ✅ Imágenes categorías añadidas
4. ✅ Alertas stock arregladas
5. ✅ Lógica edición/cancelación mejorada

### Tarea 6 - En Progreso:

#### Backend:
- ✅ Controller: createManualInvoice() añadido
- ⏳ Service: createManualInvoice() - POR IMPLEMENTAR
- ⏳ Route: POST /invoices/manual - POR AÑADIR

#### Frontend:
- ⏳ Page: ManualInvoiceForm - POR CREAR
- ⏳ Integración Facturae

---

## 📝 PRÓXIMOS PASOS:

1. **Implementar createManualInvoice en service**
   - Generar número secuencial
   - Crear factura en BD
   - Retornar invoice

2. **Añadir ruta en invoice.routes**
   - POST /manual
   - Auth + Admin

3. **Frontend: Crear formulario**
   - Datos cliente
   - Items
   - Totales
   - Generar PDF
   - Generar Facturae

---

_Estado: 83% completado_  
_Última tarea: Facturas manuales_
