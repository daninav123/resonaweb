# 📖 Índice de Documentación - ReSona

## 🎯 Para Empezar

1. **[README.md](../README.md)** - Inicio rápido y comandos básicos
2. **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Visión general del proyecto

## 📋 Planificación

3. **[FEATURES.md](FEATURES.md)** - Características completas del sistema
4. **[ROADMAP.md](ROADMAP.md)** - Plan de desarrollo por fases
5. **[USER_FLOWS.md](USER_FLOWS.md)** - Flujos de usuario detallados
6. **[GAPS_AND_IMPROVEMENTS.md](GAPS_AND_IMPROVEMENTS.md)** - ⭐ Análisis de gaps y propuestas de mejora
7. **[MIGRATION_SPLIT_RENT_EVENTS.md](MIGRATION_SPLIT_RENT_EVENTS.md)** - 🚧 Plan de split en 3 apps (Rent / Events / Admin)
8. **[AI_RULES_SHARED.md](AI_RULES_SHARED.md)** - 🤖 Reglas compartidas para Claude/Windsurf/Cascade (fuente canónica)
9. **[DEPLOYMENT_3APPS.md](DEPLOYMENT_3APPS.md)** - 🚀 Guía operativa para deployar las 3 apps (Rent / Events / Admin)
10. **[FOTOS_PRODUCTO_PENDIENTES.md](FOTOS_PRODUCTO_PENDIENTES.md)** - 📷 Fotos que faltan y nombres de producto a corregir en BD

## 🏗️ Arquitectura

7. **[TECH_STACK.md](TECH_STACK.md)** - Stack tecnológico completo
8. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Modelo de datos con Prisma
9. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentación de API REST
10. **[API_KEYS_SYSTEM.md](API_KEYS_SYSTEM.md)** - Sistema de API Keys y control de acceso
11. **[PRICING_SYSTEM.md](PRICING_SYSTEM.md)** - Sistema de precios (día, fin de semana, semana)
12. **[AVAILABILITY_SYSTEM.md](AVAILABILITY_SYSTEM.md)** - Sistema de disponibilidad y stock por fechas

## 🔒 Seguridad y Calidad

16. **[SECURITY.md](SECURITY.md)** - Prácticas de seguridad
17. **[TESTING.md](TESTING.md)** - Estrategia de testing

## 🚀 Operaciones

18. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue
19. **[MONITORING.md](MONITORING.md)** - Monitorización y alertas
20. **[ADS_TRACKING_SETUP.md](ADS_TRACKING_SETUP.md)** - 📈 Publicidad y conversiones (Google Ads + Meta): cómo obtener y configurar los IDs
21. **[SEO_ORGANIC_PLAN.md](SEO_ORGANIC_PLAN.md)** - 🔍 Auditoría SEO técnica y plan de tráfico orgánico (rent + events)
22. **[LEAD_ATTRIBUTION.md](LEAD_ATTRIBUTION.md)** - 💬 Atribución de contactos por WhatsApp/teléfono/email: de qué web y página viene cada conversación

## 💼 Comercial

Dos dossieres, cada uno con versión interna (costes y márgenes) y versión entregable al cliente.

23. **[comercial/tarifa-montajes-resona-events.pdf](comercial/tarifa-montajes-resona-events.pdf)** - 💰 Tarifa interna de montajes de Resona Events (PVP, coste, margen y suelo de negociación). Versión cliente en [comercial/tarifa-montajes-cliente.pdf](comercial/tarifa-montajes-cliente.pdf). Ambas se generan con `node docs/comercial/generar-tarifa.mjs [--cliente]` a partir de [comercial/tarifa-montajes.data.mjs](comercial/tarifa-montajes.data.mjs)
24. **[comercial/tarifa-alquiler-interna.pdf](comercial/tarifa-alquiler-interna.pdf)** - 🎛️ Dossier de alquiler de Resona Rent: catálogo completo con precio/día, semana, stock y precio de compra, más packs, personal, consumibles y reglas (fianza, pagos, descuentos, logística). Versión cliente en [comercial/tarifa-alquiler-cliente.pdf](comercial/tarifa-alquiler-cliente.pdf). Se generan con `node docs/comercial/generar-dossier-alquiler.mjs [--cliente]`
    - El catálogo se vuelca de la BD de producción con `node docs/comercial/extraer-catalogo.mjs` → [comercial/tarifa-alquiler.data.mjs](comercial/tarifa-alquiler.data.mjs) (generado, no editar a mano)
    - Las reglas comerciales se editan en [comercial/reglas-alquiler.data.mjs](comercial/reglas-alquiler.data.mjs)
    - Las correcciones de precio sobre lo que hay en la BD viven en [comercial/ajustes-precios.data.mjs](comercial/ajustes-precios.data.mjs) y se aplican al dossier automáticamente. Para llevarlas a la BD: `node docs/comercial/aplicar-ajustes-bd.mjs` (simulacro) y `--escribir` para aplicar

## 🎨 Marca

25. **[../packages/ui/brand/README.md](../packages/ui/brand/README.md)** - 🎨 Archivos maestros de la marca: logotipo, símbolo y favicons en SVG, más la retícula, los colores y las reglas de uso. El logotipo integra el símbolo como inicial, así que **no se ponen símbolo y logotipo juntos**. Cualquier PNG de `ReSona` fuera de esa carpeta está obsoleto.

## 📚 Orden de Lectura Recomendado

### Para Product Owner / Stakeholders
1. PROJECT_OVERVIEW.md
2. FEATURES.md
3. USER_FLOWS.md
4. ROADMAP.md

### Para Desarrolladores
1. README.md (Quick Start)
2. TECH_STACK.md
3. DATABASE_SCHEMA.md
4. API_DOCUMENTATION.md
5. SECURITY.md
6. TESTING.md

### Para DevOps / SysAdmin
1. DEPLOYMENT.md
2. MONITORING.md
3. SECURITY.md
4. TECH_STACK.md

## 🗂️ Estructura de Documentos

Cada documento sigue esta estructura:
- **Título y Emoji** para identificación rápida
- **Tabla de contenidos** (en docs extensos)
- **Secciones claras** con ejemplos
- **Referencias cruzadas** a otros documentos

## ❓ Necesitas Más Información

Si algún aspecto no está cubierto o necesitas más detalles:
1. Revisa el documento correspondiente
2. Consulta los comentarios en el código
3. Revisa la documentación inline de Swagger (API)
4. Contacta al equipo de desarrollo

## 📝 Convenciones

- **✅** = Funcionalidad implementada
- **🔄** = En desarrollo
- **❌** = Pendiente
- **⚠️** = Importante / Atención
- **📌** = Nota
