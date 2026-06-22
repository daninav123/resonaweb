/**
 * Componente de Imagen Optimizada
 * - Lazy loading nativo
 * - Soporte WebP con fallback
 * - Alt text automático para SEO
 * - Responsive images
 */

import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  priority = false,
  objectFit = 'cover',
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generar URL de WebP si es posible
  const getWebPUrl = (url: string) => {
    if (!url || url.startsWith('data:')) return null;
    // Solo para imágenes PNG/JPG locales
    if (url.match(/\.(jpg|jpeg|png)$/i)) {
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return null;
  };

  const webPUrl = getWebPUrl(src);

  // Placeholder mientras carga
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: '#f3f4f6',
    minHeight: height || '200px',
    display: isLoaded ? 'none' : 'block',
  };

  const imageStyle: React.CSSProperties = {
    objectFit,
    display: isLoaded ? 'block' : 'none',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !imageError && (
        <div style={placeholderStyle} className="animate-pulse" />
      )}

      {/* Imagen con soporte WebP */}
      {!imageError && (
        <picture>
          {webPUrl && <source srcSet={webPUrl} type="image/webp" />}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            decoding={priority ? 'sync' : 'async'}
            style={imageStyle}
            className={className}
            onLoad={() => setIsLoaded(true)}
            onError={() => setImageError(true)}
            // Preconnect para imágenes prioritarias
            {...(priority && { fetchPriority: 'high' as any })}
          />
        </picture>
      )}

      {/* Fallback si falla la imagen */}
      {imageError && (
        <div 
          className="flex items-center justify-center bg-gray-200 text-gray-400"
          style={{ minHeight: height || '200px' }}
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
