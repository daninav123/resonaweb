# Reglas compartidas para asistentes IA (Claude Code / Windsurf / Cascade)

> **Fuente canónica.** Los archivos `CLAUDE.md` y `.windsurfrules` en la raíz del repo replican (resumen) estas reglas. Si actualizas algo aquí, revisa también esos dos.

---

## 1. Qué es este proyecto

**Resona** — empresa de Valencia que alquila equipos audiovisuales y produce eventos completos (bodas, corporativos, etc.).

El sistema `resonaweb` gestiona:
- **Alquiler de equipos** (particulares y profesionales): catálogo, carrito, checkout directo.
- **Eventos completos**: calculadora/presupuestos, packs con montaje, gestión comercial.
- **Backoffice interno**: 102 páginas de admin (CRM, contabilidad, inventario, logística, staff, facturación...).

## 2. Stack

- **Monorepo**: npm workspaces (`packages/*`).
- **Frontend**: React 18 + Vite + Tailwind + React Router v6 + Zustand (authStore) + React Query. TypeScript estricto.
- **Backend**: Express + Prisma (PostgreSQL) + JWT auth con refresh. TypeScript.
- **Tests**: Vitest (frontend unit), Jest (backend), Playwright (e2e).
- **Pagos**: Stripe + Redsys + manual.
- **Infra local**: Docker Compose con Postgres + Redis + Prometheus + Grafana.

## 3. Iniciativa activa: split en 3 apps

El proyecto está en **migración** desde un frontend monolítico a tres apps separadas:

- `apps/rent/` → `resonarent.com` (alquiler, e-commerce transaccional).
- `apps/events/` → `resonaevents.com` (eventos completos, lead-gen visual).
- `apps/admin/` → `gestion.resonaevents.com` (panel interno).

Compartidas en `packages/`: `shared-types`, `api-client`, `ui`, `utils`.

**Plan detallado**: [docs/MIGRATION_SPLIT_RENT_EVENTS.md](MIGRATION_SPLIT_RENT_EVENTS.md). **Léelo antes** de proponer cambios arquitectónicos, de funnel o de estructura de carpetas.

### Reglas durante la migración

- **No añadas features nuevos** al monolito `packages/frontend/` si afectan a código que va a migrarse pronto (admin, catálogo, carrito, calculadora). Si es inevitable, anótalo en el plan.
- **Cuando muevas un archivo**, actualiza **todos** los imports, no solo los del archivo movido. Usa grep/find references antes.
- **Código compartido entre 2+ apps → `packages/`**. Sin excepciones. Si dudas, pregunta.
- **Backend no se toca estructuralmente** salvo CORS y, si acaso, separar algún endpoint. Nada de refactors grandes de controllers/services durante la migración.
- **El carrito vive solo en Rent**. Events usa el endpoint `quoteRequest`, nunca `cart`.
- **Un único `User` en BDD** aunque haya 3 apps. No crear tablas duplicadas.
- **Stock único en backend**. No dupliques lógica de stock/disponibilidad en frontend.

## 4. Convenciones de código

- **UI copy**: español. **Identificadores en código**: inglés. **Docs del repo**: español.
- **TypeScript estricto**. Nada de `any` salvo caso muy justificado.
- **Sin comentarios** salvo que el *por qué* sea no obvio (hack, invariante oculto, workaround de bug concreto). Nunca comentar el *qué* hace el código.
- **Nombres descriptivos** > comentarios. Funciones cortas, responsabilidad única.
- **Imports organizados**: externos primero, luego internos con rutas absolutas cuando el tsconfig lo permite.
- **Validación en boundaries**: Zod en endpoints públicos y formularios. No validar cada vez en código interno.

## 5. Estructura de documentación y scratchpad

- **Toda doc nueva va a `docs/`**. NO crear archivos `.md` en la raíz del repo.
- **`docs/INDEX.md`** es el índice maestro. Actualízalo al añadir un doc nuevo.
- **Notas temporales de sesión** (resúmenes de lo hecho, borradores, análisis intermedios) → `.ai-scratch/` (gitignored). Borra sin miedo al acabar.
- **`archive/`** contiene material histórico (docs antiguos, scripts one-off, snapshots de datos). **No añadir cosas nuevas aquí**; solo se archiva de forma consciente cuando algo queda obsoleto. Si necesitas algo de `archive/`, muévelo de vuelta al sitio correcto con un commit separado.

## 6. Verificación antes de dar un cambio por hecho

Un cambio de código **no se considera terminado** hasta haber verificado que no rompe nada:

- **Cambios de TypeScript/lógica**: correr los tests relevantes (`npm run test` o el workspace concreto) + `npm run lint` si tocaste muchos archivos.
- **Cambios de UI**: arrancar el dev server y probar el flujo real en navegador. El type-check verifica el código, no la feature — si no puedes probarla visualmente, dilo explícitamente en vez de asumir que funciona.
- **Cambios en el backend**: verificar que el endpoint responde como esperas (curl/jest) y que no rompe tests existentes.
- **Cambios en Prisma**: `npm run db:generate` sí o sí. Si tocas el schema, además `db:migrate:dev` en local.
- **Cuando no puedas verificar algo** (CI, deploy, rama protegida), dilo explícitamente y no marques la tarea como completada.

## 7. Comandos frecuentes

```bash
# Dev (frontend + backend concurrente)
npm run dev

# Solo frontend / solo backend
npm run dev:frontend
npm run dev:backend

# Build
npm run build

# Tests
npm run test                  # unit (vitest + jest)
npm run test:e2e              # playwright
npm run lint
npm run lint:fix

# Base de datos
npm run db:generate           # prisma generate
npm run db:migrate:dev        # migración en dev
npm run db:seed
npm run db:studio             # Prisma Studio UI

# Docker local
npm run docker:up             # postgres + redis + observabilidad
npm run docker:down
```

## 8. Git y seguridad

- **Nunca hacer commits** salvo que Dani lo pida explícitamente.
- **Nunca `--no-verify`** para saltar hooks.
- **Nunca force push** a main.
- **Nunca commitear secrets** (.env, keys). Revisar antes de stage.
- **Preferir commits nuevos** antes que `--amend` a commits publicados.
- **Cambios destructivos** (reset --hard, rm -rf, borrar branches): preguntar siempre antes.
- **Nunca `git add .` ni `git add -A`**: añadir archivos por nombre explícito. Evita stage accidental de secretos o temporales.

## 9. Cosas que NO hay que hacer

- No modificar `prisma/schema.prisma` sin entender el impacto (80 modelos, mucho código depende).
- No cambiar `auth.middleware.ts` a la ligera; ya gestiona roles principales + additionalRoles.
- No duplicar lógica de cálculo de precio (existe en `packages/frontend/src/utils/priceWithVAT.ts`, `cartCalculations.ts`) — reusar/extraer a `packages/utils`.
- No mezclar carrito y quote request. Son dos flujos diferentes en BDD y UI.
- No asumir que hay reviews/testimonios reales en BDD: por ahora están comentados, mostrarlos falsos es engañoso.
- No inventar comandos o scripts. Si no existe en `package.json`, no existe.

## 10. Comunicación con Dani

- **Idioma**: español.
- **Tono**: directo, técnico, sin relleno.
- **Preguntas exploratorias** ("qué opinas de X", "cómo lo harías"): 2-3 frases con recomendación y tradeoff principal antes de implementar.
- **Decisiones reversibles** (editar archivo, correr test): adelante.
- **Decisiones no reversibles** (deploy, push, migración BDD destructiva): preguntar.
- **Cuando dudes entre dos enfoques razonables**: presenta ambos brevemente y deja que elija.

## 11. Archivos clave de referencia

- [docs/INDEX.md](INDEX.md) — índice de toda la doc.
- [docs/MIGRATION_SPLIT_RENT_EVENTS.md](MIGRATION_SPLIT_RENT_EVENTS.md) — plan de migración activa.
- [docs/DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) — modelo de datos.
- [docs/API_DOCUMENTATION.md](API_DOCUMENTATION.md) — API REST.
- [docs/USER_FLOWS.md](USER_FLOWS.md) — flujos de usuario actuales.
- [packages/backend/prisma/schema.prisma](../packages/backend/prisma/schema.prisma) — fuente de verdad del modelo de datos.
- [packages/frontend/src/App.tsx](../packages/frontend/src/App.tsx) — mapa de rutas actual.
