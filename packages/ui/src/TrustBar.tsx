import { ComponentType, SVGProps } from 'react';
import { Shield, Truck, Clock } from 'lucide-react';

export interface TrustBarItem {
  /** Icono de lucide-react (o cualquier componente SVG compatible). */
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Texto del item. */
  label: string;
  /** En qué breakpoint mostrarse. Default: siempre. */
  hideBelow?: 'sm' | 'md' | 'lg';
}

interface TrustBarProps {
  /** Items custom. Si no se pasan, usa los defaults. */
  items?: TrustBarItem[];
  /** Paleta. 'dark' para sitios de fondo oscuro. Default: 'light'. */
  tone?: 'light' | 'dark';
}

// Sin reviews/valoraciones inventadas: solo claims verificables del servicio.
const DEFAULT_ITEMS: TrustBarItem[] = [
  { icon: Truck, label: 'Montaje y desmontaje incluido' },
  { icon: Shield, label: 'Pago 100% seguro', hideBelow: 'sm' },
  { icon: Clock, label: 'Solo 25% de reserva' },
];

const hideClassMap: Record<NonNullable<TrustBarItem['hideBelow']>, string> = {
  sm: 'hidden sm:flex',
  md: 'hidden md:flex',
  lg: 'hidden lg:flex',
};

export function TrustBar({ items, tone = 'light' }: TrustBarProps = {}) {
  const finalItems = items ?? DEFAULT_ITEMS;
  const oscuro = tone === 'dark';

  return (
    <div className={oscuro ? 'border-b border-white/10 bg-[#0B0B0C]' : 'border-b border-[#E5E5E5] bg-[#FAFAFA]'}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
          {finalItems.map((item, i) => {
            const Icon = item.icon;
            const visibility = item.hideBelow ? hideClassMap[item.hideBelow] : 'flex';
            return (
              <div key={i} className={`${visibility} items-center gap-2 ${oscuro ? 'text-[#F7F3EB]/60' : 'text-[#4D4D4D]'}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${oscuro ? 'text-[#F7F3EB]/40' : 'text-[#8A8A8A]'}`} strokeWidth={1.75} />
                <span className="font-medium tracking-[0.01em]">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrustBar;
