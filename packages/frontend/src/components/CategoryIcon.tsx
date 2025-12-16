import {
  Video, Camera, Lightbulb, Volume2, Mic, Sliders,
  Headphones, Theater, Sparkles, Armchair, Music2,
  Monitor, Zap, Radio, Cable, Package,
  Building2, Settings, Gauge, Plug, Shield, Link
} from 'lucide-react';
 import type { FC } from 'react';

/**
 * Mapeo de slugs de categorías a componentes de iconos de Lucide React
 */
const categoryIconMap: Record<string, any> = {
  'fotografia-video': Camera,
  'iluminacion': Lightbulb,
  'sonido': Volume2,
  'microfonia': Mic,
  'mesas-mezcla-directo': Sliders,
  'equipamiento-dj': Headphones,
  'elementos-escenario': Theater,
  'elementos-decorativos': Sparkles,
  'mobiliario': Armchair,
  'backline': Music2,
  'pantallas-proyeccion': Monitor,
  'pantallas-y-proyeccion': Monitor,
  'efectos-especiales': Zap,
  'comunicaciones': Radio,
  'energia-distribucion': Plug,
  'cables-conectores': Cable,
  'packs': Package,
  'estructuras': Building2,
  'control-sonido': Settings,
  'control-iluminacion': Gauge,
  'generacion-y-distribucion': Plug,
  'pantallas-y-proteccion': Shield,
  'cableado': Link,
  'fx': Sparkles,
  'mesas-de-mezcla-para-directo': Sliders,
};

interface CategoryIconProps {
  slug: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Componente de icono de categoría con paleta de colores corporativa
 * 
 * Paleta de colores:
 * - Base: #9aa3ad (gris iconos)
 * - Hover/Activo: #5ebbff (azul principal)
 * - Fondo: #f4f6f8 (gris fondo)
 */
export const CategoryIcon: FC<CategoryIconProps> = ({ 
  slug, 
  className = '', 
  size = 48,
  strokeWidth = 1.5
}) => {
  const normalizedSlug = (slug || '').toLowerCase().trim();
  const IconComponent = categoryIconMap[normalizedSlug] || Package;
  
  return (
    <IconComponent 
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
};

/**
 * Obtiene el componente de icono para una categoría por su slug
 */
export const getCategoryIconComponent = (slug: string) => {
  const normalizedSlug = (slug || '').toLowerCase().trim();
  return categoryIconMap[normalizedSlug] || Package;
};
