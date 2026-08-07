// Fotos reales optimizadas por scripts/optimize-images.mjs.
// Los anchos son los que existen de verdad en public/images/opt: pedir uno que no esté
// generado daría un 404, así que el tipo los fija y el componente solo usa estos.

export interface Photo {
  widths: readonly number[];
  /** Ancho del JPG de respaldo para navegadores sin WebP. */
  fallback: number;
  /** Proporción original, para reservar el hueco y evitar saltos de maquetación. */
  aspect: string;
  alt: string;
}

export const PHOTOS = {
  'boda-disco-cabina': {
    widths: [640, 960, 1440, 1920],
    fallback: 960,
    aspect: '3 / 2',
    alt: 'Cabina de DJ con cabezas móviles y pantallas durante la disco de una boda en Valencia',
  },
  'dj-directo': {
    widths: [640, 960, 1440, 1920],
    fallback: 960,
    aspect: '3 / 2',
    alt: 'DJ de ReSona Events mezclando en directo durante un evento',
  },
  'banquete-masia': {
    widths: [640, 960],
    fallback: 960,
    aspect: '9 / 16',
    alt: 'Mesas montadas para el banquete en una masía de Valencia',
  },
  'iluminacion-truss-azul': {
    widths: [640, 960, 1440],
    fallback: 960,
    aspect: '3 / 4',
    alt: 'Estructura de truss con cabezas móviles iluminando la pista en azul',
  },
  'cabina-dj-letras': {
    widths: [640],
    fallback: 640,
    aspect: '9 / 16',
    alt: 'Cabina de DJ con letras luminosas y altavoces sobre trípode',
  },
  'guirnaldas-noche': {
    widths: [640, 960, 1440, 1920],
    fallback: 960,
    aspect: '16 / 9',
    alt: 'Cortina de guirnaldas de luz cálida encendidas de noche',
  },
} as const satisfies Record<string, Photo>;

export type PhotoSlug = keyof typeof PHOTOS;
