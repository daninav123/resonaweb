import { PHOTOS, type PhotoSlug } from '../data/photos';

interface PhotoProps {
  slug: PhotoSlug;
  /** Texto alternativo específico del contexto; si se omite se usa el del manifiesto. */
  alt?: string;
  /** Ancho que ocupará la imagen, para que el navegador elija bien del srcset. */
  sizes?: string;
  /**
   * Marca la imagen como la principal de la página (el LCP): carga inmediata y prioridad
   * alta. Solo debe ir en una por página; el resto van en diferido.
   */
  priority?: boolean;
  className?: string;
  /** Reserva el hueco con la proporción original. Desactívalo si el contenedor ya la fija. */
  reserveSpace?: boolean;
}

/**
 * Imagen responsive servida desde nuestro dominio en WebP con respaldo JPG.
 *
 * Sustituye a las de Unsplash a 2400px: además de pesar 6 veces menos, evitan una
 * conexión a un tercero antes de poder pintar el elemento principal de la página.
 */
export const Photo = ({
  slug,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
  reserveSpace = false,
}: PhotoProps) => {
  const photo = PHOTOS[slug];
  const srcSet = photo.widths.map((w) => `/images/opt/${slug}-${w}.webp ${w}w`).join(', ');
  const fallbackSrc = `/images/opt/${slug}-${photo.fallback}.jpg`;

  return (
    <picture style={reserveSpace ? { aspectRatio: photo.aspect, display: 'block' } : undefined}>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt ?? photo.alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  );
};

export default Photo;
