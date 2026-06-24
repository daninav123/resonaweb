import { lazy, ComponentType } from 'react';

// Tras un deploy, el index.html cacheado del cliente referencia chunks con hashes
// que ya no existen en el servidor. El import dinámico falla (el SPA fallback
// devuelve index.html con MIME text/html). Forzamos UNA recarga para traer el
// index.html nuevo; el flag en sessionStorage evita un bucle de recargas si el
// fallo es real (chunk roto de verdad, no obsoleto).
const RELOAD_FLAG = 'chunk-reload-attempted';

export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await importer();
      window.sessionStorage.removeItem(RELOAD_FLAG);
      return module;
    } catch (error) {
      const alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG);
      if (!alreadyReloaded) {
        window.sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        return new Promise<never>(() => {});
      }
      throw error;
    }
  });
}
