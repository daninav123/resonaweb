export type EventType = 'boda' | 'corporativo' | 'privado' | 'concierto';

export interface ServiceOption {
  key: string;
  label: string;
  description: string;
  basePrice: number;
  perGuest?: number;
}

export const EVENT_TYPES: { key: EventType; label: string; description: string; basePrice: number }[] = [
  { key: 'boda',         label: 'Boda',          description: 'Ceremonia, banquete y disco',           basePrice: 1800 },
  { key: 'corporativo',  label: 'Corporativo',   description: 'Convención, lanzamiento, gala',         basePrice: 1500 },
  { key: 'privado',      label: 'Evento privado', description: 'Cumpleaños, aniversario, fiesta',       basePrice: 900 },
  { key: 'concierto',    label: 'Concierto',     description: 'Festival, plaza, actuación',            basePrice: 3200 },
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  { key: 'sonido',       label: 'Sonido completo',          description: 'Line array + técnico',                basePrice: 600, perGuest: 2 },
  { key: 'iluminacion',  label: 'Iluminación',              description: 'Decorativa + pista',                  basePrice: 450, perGuest: 1.5 },
  { key: 'dj',           label: 'DJ residente',             description: 'DJ de la casa con rider',             basePrice: 650 },
  { key: 'video',        label: 'Vídeo y streaming',        description: 'Multicámara + streaming',             basePrice: 900 },
  { key: 'videoescenario', label: 'Videoescenario LED',     description: 'Pantallas modulares',                 basePrice: 1400 },
  { key: 'produccion',   label: 'Producción integral',      description: 'Project manager dedicado',            basePrice: 800 },
  { key: 'fotografia',   label: 'Fotografía',               description: 'Partner fotográfico',                 basePrice: 750 },
];

export interface PricingInput {
  eventType: EventType | null;
  guests: number;
  services: string[];
}

export interface PriceRange {
  min: number;
  max: number;
  formatted: string;
}

const fmt = (n: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n);

export function estimatePrice({ eventType, guests, services }: PricingInput): PriceRange | null {
  if (!eventType) return null;

  const typeBase = EVENT_TYPES.find((t) => t.key === eventType)?.basePrice ?? 0;
  const servicesCost = SERVICE_OPTIONS
    .filter((s) => services.includes(s.key))
    .reduce((acc, s) => acc + s.basePrice + (s.perGuest ?? 0) * Math.max(guests, 0), 0);

  const subtotal = typeBase + servicesCost;

  const min = Math.round(subtotal * 0.9 / 50) * 50;
  const max = Math.round(subtotal * 1.3 / 100) * 100;

  return {
    min,
    max,
    formatted: `${fmt(min)}€ – ${fmt(max)}€`,
  };
}
