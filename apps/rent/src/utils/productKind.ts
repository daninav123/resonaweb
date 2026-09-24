/**
 * El catálogo mezcla material de cabecera (bafles, cabezas móviles, truss) con
 * accesorios (cables, adaptadores, mangueras). A un cable no se le puede hacer
 * una foto de producto que aporte nada, así que van en lista aparte sin imagen.
 */
const ACCESORIO = /\bcable|\brca\b|minijack|\bjack\b|schuko|adaptador|manguera|alimentaci[oó]n|powercon|conector|latiguillo|\bxlr\b|\bdmx\b|alargador|\bbrida/i;

export const esAccesorio = (nombre: string | null | undefined): boolean =>
  ACCESORIO.test(nombre || '');
