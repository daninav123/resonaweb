import { ShieldCheck, Truck, Wrench, CalendarCheck } from 'lucide-react';
import { TrustBar as SharedTrustBar } from '@resona/ui';

// Items específicos de Resona Rent — orientados a alquiler, no a evento completo.
// Sin reviews/valoraciones inventadas: solo claims verificables del servicio.
const RENT_ITEMS = [
  { icon: Truck, label: 'Entrega y recogida en Valencia' },
  { icon: ShieldCheck, label: 'Depósito reembolsable', hideBelow: 'sm' as const },
  { icon: Wrench, label: 'Técnico opcional' },
  { icon: CalendarCheck, label: 'Reserva 100% online', hideBelow: 'md' as const },
];

const TrustBar = () => <SharedTrustBar items={RENT_ITEMS} />;

export default TrustBar;
