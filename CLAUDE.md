# CLAUDE.md — Reglas para Claude Code en resonaweb

> Archivo auto-cargado por Claude Code. La fuente canónica con más detalle está en [docs/AI_RULES_SHARED.md](docs/AI_RULES_SHARED.md) — si modificas este archivo, actualiza también ese. Plan de migración activo: [docs/MIGRATION_SPLIT_RENT_EVENTS.md](docs/MIGRATION_SPLIT_RENT_EVENTS.md).

---

## Proyecto

**Resona** (Valencia) — alquiler de equipos audiovisuales + producción de eventos completos. Monorepo npm workspaces.

**Stack**: React 18 + Vite + Tailwind + Zustand + React Query (frontend) · Express + Prisma (PostgreSQL) + JWT (backend) · Stripe + Redsys (pagos) · Vitest/Jest/Playwright (tests).

**Estado**: en migración desde monolito (`packages/frontend` + `packages/backend`) hacia 3 apps separadas:
- `apps/rent/` → `resonarent.com` (e-commerce alquiler)
- `apps/events/` → `resonaevents.com` (eventos completos, lead-gen)
- `apps/admin/` → `gestion.resonaevents.com` (panel interno)

Compartidas: `packages/{shared-types, api-client, ui, utils}`.

## Reglas durante la migración (críticas)

1. **Lee [docs/MIGRATION_SPLIT_RENT_EVENTS.md](docs/MIGRATION_SPLIT_RENT_EVENTS.md)** antes de proponer cambios arquitectónicos, de funnel o de estructura de carpetas.
2. **No añadas features nuevos** al monolito si afectan código próximo a migrarse (admin, catálogo, carrito, calculadora). Si es inevitable, documenta en el plan.
3. **Código usado en ≥2 apps → `packages/`**. Sin excepciones.
4. **Backend no se toca estructuralmente**: solo CORS y, puntualmente, endpoints. Nada de refactors grandes.
5. **Carrito vive solo en Rent**. Events usa `quoteRequest`, nunca `cart`.
6. **Un único `User`** en BDD aunque existan 3 apps.
7. **Stock/disponibilidad**: lógica solo en backend. No duplicar en frontend.
8. Al mover archivos, actualizar **todos** los imports, no solo los internos del archivo.

## Convenciones de código

- **UI copy en español, identificadores en inglés, docs en español.**
- **TypeScript estricto.** Evitar `any`.
- **Sin comentarios** salvo *por qué* no obvio (hack, invariante, workaround). Nunca comentar el *qué*.
- **Prefiere editar** a crear. Nunca crear archivos `.md` en raíz — todo en `docs/`.
- **Actualiza `docs/INDEX.md`** al añadir un doc nuevo.
- Validación con Zod solo en boundaries (endpoints públicos, formularios).

## Documentación y scratchpad

- Docs persistentes → `docs/`. Actualizar `docs/INDEX.md`.
- Notas temporales de sesión (borradores, análisis intermedios) → `.ai-scratch/` (gitignored).
- `archive/` contiene material histórico (docs antiguos, scripts one-off, data snapshots). **No añadir** cosas nuevas ahí; solo archivar cuando algo queda obsoleto, en un commit consciente.

## Verificación antes de dar un cambio por hecho

- Lógica/TS: `npm run test` relevante + `npm run lint` si tocaste muchos archivos.
- UI: arrancar dev server y probar el flujo real en navegador. Type-check no valida la feature — si no puedes probar, dilo.
- Backend: verificar endpoint (curl/test) + tests existentes no rotos.
- Prisma: `npm run db:generate` siempre; si tocas schema, `db:migrate:dev` en local.
- Si no puedes verificar algo (CI, rama protegida), dilo y **no marques como completo**.

## Comandos

```bash
npm run dev                  # frontend + backend concurrente
npm run dev:frontend
npm run dev:backend
npm run build
npm run test                 # unit
npm run test:e2e             # playwright
npm run lint:fix
npm run db:migrate:dev
npm run db:seed
npm run db:studio
npm run docker:up            # postgres + redis + observabilidad
```

No inventes comandos. Si no está en un `package.json`, no existe.

## Git y seguridad

- **Nunca commits** salvo petición explícita de Dani.
- **Nunca `--no-verify`**, nunca force push a main, nunca commitear secrets.
- **Preferir commits nuevos** antes que `--amend` a commits publicados.
- **Acciones destructivas** (reset --hard, rm -rf, borrar branches, drop DB): **siempre preguntar** antes.
- **Nunca `git add .` ni `git add -A`** en este repo (raíz llena de `.md` sueltos y scripts temporales, riesgo de stage accidental). Añadir archivos por nombre.

## Comunicación

- **Español.** Directo, técnico, sin relleno.
- **Preguntas exploratorias** ("qué opinas", "cómo lo harías"): 2-3 frases con recomendación + tradeoff antes de implementar.
- **Decisiones reversibles**: adelante.
- **Decisiones no reversibles** (deploy, push, migración BDD): preguntar.
- Cuando hay dos enfoques razonables: preséntalos breves y deja que Dani elija.

## No hacer

- No tocar `prisma/schema.prisma` sin entender el impacto (80 modelos interdependientes).
- No modificar `auth.middleware.ts` a la ligera (gestiona roles + additionalRoles).
- No duplicar cálculo de precio (`packages/frontend/src/utils/priceWithVAT.ts`, `cartCalculations.ts` son fuente).
- No mezclar cart y quoteRequest.
- No mostrar reviews/testimonios falsos (no hay datos reales por ahora).
- No crear más `.md` en la raíz (hay ~200 de sesiones viejas, no más).

## Archivos de referencia

- [docs/INDEX.md](docs/INDEX.md) · [docs/MIGRATION_SPLIT_RENT_EVENTS.md](docs/MIGRATION_SPLIT_RENT_EVENTS.md) · [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) · [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) · [docs/USER_FLOWS.md](docs/USER_FLOWS.md)
- [packages/backend/prisma/schema.prisma](packages/backend/prisma/schema.prisma) — fuente de verdad del modelo de datos.
- [packages/frontend/src/App.tsx](packages/frontend/src/App.tsx) — mapa de rutas actual.
