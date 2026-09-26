import { MessageCircle } from 'lucide-react';
import { useLeadLink } from '@resona/ui';

const WHATSAPP_NUMBER = '34613881414';

interface QuoteCtaProps {
  section: string;
  message: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

const QuoteCta = ({
  section,
  message,
  title = 'Pide tu presupuesto aquí',
  subtitle = 'Te lo preparamos por WhatsApp, sin pagar nada online. Te asesoramos con el equipo, las fechas y la recogida.',
  className = '',
}: QuoteCtaProps) => {
  const whatsapp = useLeadLink({ app: 'rent', section, channel: 'whatsapp', phone: WHATSAPP_NUMBER, message });

  return (
    <a
      {...whatsapp}
      className={`group flex items-center gap-4 rounded-sm bg-resona px-5 py-4 text-white transition-colors hover:bg-resona-dark md:px-6 md:py-5 ${className}`}
    >
      <MessageCircle className="h-8 w-8 shrink-0" strokeWidth={2} />
      <span className="flex-1">
        <span className="block text-[17px] font-semibold leading-tight md:text-[19px]">{title}</span>
        <span className="mt-1 block text-[13px] leading-snug text-white/80">{subtitle}</span>
      </span>
      <span aria-hidden className="text-[22px] transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
};

export const QuoteButton = ({ section, message, className = '' }: Pick<QuoteCtaProps, 'section' | 'message' | 'className'>) => {
  const whatsapp = useLeadLink({ app: 'rent', section, channel: 'whatsapp', phone: WHATSAPP_NUMBER, message });

  return (
    <a
      {...whatsapp}
      className={`flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-resona px-3 text-[14px] font-semibold text-white hover:bg-resona-dark ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
      Pedir presupuesto
    </a>
  );
};

export default QuoteCta;
