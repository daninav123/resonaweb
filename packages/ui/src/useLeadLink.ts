import { useCallback, useMemo } from 'react';
import {
  createLeadRef,
  reportLeadClick,
  messageWithRef,
  whatsappHref,
  openWhatsAppLead,
  trackLead,
  type LeadApp,
  type LeadChannel,
} from '@resona/utils';

export interface UseLeadLinkOptions {
  app: LeadApp;
  /** Slug corto de la página o bloque, p. ej. 'bodas', 'sonido', 'home'. Va en el código. */
  section: string;
  channel: LeadChannel;
  /** Número en formato internacional sin '+' (WhatsApp y teléfono). */
  phone?: string;
  /** Destinatario (canal email). */
  email?: string;
  /** Texto prellenado de WhatsApp o asunto del email, sin el código. */
  message?: string;
  value?: number;
}

export interface LeadLinkProps {
  href: string;
  onClick: () => void;
  target?: string;
  rel?: string;
}

/**
 * Devuelve las props de un enlace de contacto directo ya instrumentado: genera el código
 * de referencia, lo incrusta donde el canal lo permite y registra el clic al pulsarlo.
 *
 * En `telefono` el código no puede viajar (una llamada no lleva texto), así que el clic
 * queda registrado para el agregado pero esa conversación no se puede casar una a una.
 */
export function useLeadLink({
  app,
  section,
  channel,
  phone,
  email,
  message,
  value,
}: UseLeadLinkOptions): LeadLinkProps {
  const ref = useMemo(() => createLeadRef(app, section), [app, section]);

  const href = useMemo(() => {
    if (channel === 'whatsapp') {
      return whatsappHref(phone || '', message || 'Hola, quería pedir presupuesto', ref);
    }
    if (channel === 'email') {
      const subject = encodeURIComponent(messageWithRef(message || 'Consulta desde la web', ref));
      return `mailto:${email}?subject=${subject}`;
    }
    return `tel:+${phone}`;
  }, [channel, phone, email, message, ref]);

  const onClick = useCallback(() => {
    reportLeadClick({ ref, app, section, channel });
    trackLead({ leadType: channel, ...(value != null ? { value } : {}) });
  }, [ref, app, section, channel, value]);

  return channel === 'whatsapp'
    ? { href, onClick, target: '_blank', rel: 'noopener noreferrer' }
    : { href, onClick };
}

export interface GlobalWhatsAppProps {
  href: string;
  target: string;
  rel: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Variante para cabecera, pie y botón flotante: elementos que se montan una vez y viven
 * en todas las páginas, así que la sección solo se puede resolver al pulsar. El `href`
 * queda sin código como plan B por si el manejador no llega a ejecutarse.
 */
export function useGlobalWhatsApp(app: LeadApp, phone: string, message: string): GlobalWhatsAppProps {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      trackLead({ leadType: 'whatsapp' });
      e.preventDefault();
      window.open(openWhatsAppLead(app, 'whatsapp', phone, message), '_blank', 'noopener,noreferrer');
    },
    [app, phone, message],
  );

  return { href, target: '_blank', rel: 'noopener noreferrer', onClick };
}
