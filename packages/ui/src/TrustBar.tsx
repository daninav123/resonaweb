import { ComponentType, SVGProps } from 'react';
import { Shield, Truck, Clock, Star } from 'lucide-react';

export interface TrustBarItem {
  /** Icono de lucide-react (o cualquier componente SVG compatible). */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Texto del item. */
  label: string;
  /** Color tailwind del icono. Ej: 'text-green-600'. */
  iconColor?: string;
  /** En qué breakpoint mostrarse. Default: siempre. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface TrustBarProps {
  /** Items custom. Si no se pasan, usa los defaults (orientados a evento completo). */
  items?: TrustBarItem[];
  /** Nº de eventos/alquileres a mostrar en el item de rating (si usas el default). */
  eventsCount?: string;
  /** Nota/valoración (si usas el default). */
  ratingLabel?: string;
}

const DEFAULT_ITEMS = (eventsCount: string, ratingLabel: string): TrustBarItem[] => [
  { icon: Truck, label: 'Montaje y desmontaje incluido', iconColor: 'text-green-600' },
  { icon: Shield, label: 'Pago 100% seguro', iconColor: 'text-blue-600', hideBelow: 'sm' },
  { icon: Clock, label: 'Solo 25% de reserva', iconColor: 'text-purple-600' },
  {
    icon: Star,
    label: `${eventsCount} eventos · ${ratingLabel} valoraciones`,
    iconColor: 'text-yellow-500',
    hideBelow: 'md',
  },
];

const hideClassMap: Record<NonNullable<TrustBarItem['hideBelow']>, string> = {
  sm: 'hidden sm:flex',
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
};

export function TrustBar({
  items,
  eventsCount = '+2.000',
  ratingLabel = '4.8/5',
}: TrustBarProps = {}) {
  const finalItems = items ?? DEFAULT_ITEMS(eventsCount, ratingLabel);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
          {finalItems.map((item, i) => {
            const Icon = item.icon;
            const visibility = item.hideBelow ? hideClassMap[item.hideBelow] : 'flex';
            return (
              <div key={i} className={`${visibility} items-center gap-1.5 text-gray-700`}>
                <Icon className={`w-4 h-4 ${item.iconColor ?? 'text-gray-600'} flex-shrink-0`} />
                <span className="font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrustBar;
