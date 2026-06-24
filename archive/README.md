# archive/

Material histórico del proyecto que ya no es operativo pero se conserva por si alguien necesita consultarlo o recuperar algo.

## Estructura

- **`docs/`** (~282 archivos) — documentos `.md` de sesiones pasadas: resúmenes, estados, fixes, soluciones, planes de iteraciones previas. Contenido mayormente superado por la documentación oficial en [/docs](../docs/).
- **`scripts/`** (~210 archivos) — scripts one-off de debug, pruebas manuales, migraciones puntuales, páginas HTML de test, scripts `.bat`/`.ps1`/`.sh` antiguos. No ejecutar sin revisar primero: muchos apuntan a configuraciones obsoletas.
- **`data/`** (~6 archivos) — snapshots JSON de datos (listados de productos, configs del calculador, reports de health). Valor histórico, no usar en producción.

## Qué NO está aquí

- Documentación oficial viva → [/docs](../docs/)
- Scripts operativos actuales → [/scripts](../scripts/) o `packages/*/scripts/`
- Tests activos → [/tests](../tests/) y `packages/*/src/**/*.test.ts`

## Regla

**No añadir cosas nuevas aquí**. Si se quiere archivar algo, hacerlo de forma consciente en el commit que lo mueve.

Si algo de aquí vuelve a ser útil, muévelo de vuelta al lugar correcto en un commit separado con contexto de por qué.
