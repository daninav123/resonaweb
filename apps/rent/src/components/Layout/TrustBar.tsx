import { ShieldCheck, Truck, Wrench, Star } from 'lucide-react';
import { TrustBar as SharedTrustBar } from '@resona/ui';

// Items específicos de Resona Rent — orientados a alquiler, no a evento completo.
const RENT_ITEMS = [
  { icon: Truck, label: 'Entrega y recogida en Valencia', iconColor: 'text-green-600' },
  { icon: ShieldCheck, label: 'Depósito reembolsable', iconColor: 'text-blue-600', hideBelow: 'sm' as const },
  { icon: Wrench, label: 'Técnico opcional', iconColor: 'text-purple-600' },
  {
    icon: Star,
    label: '+2.000 alquileres · 4.8/5 valoraciones',
    iconColor: 'text-yellow-500',
    hideBelow: 'md' as const,
  },
];

const TrustBar = () => <SharedTrustBar items={RENT_ITEMS} />;

export default TrustBar;
