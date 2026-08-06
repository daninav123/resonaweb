// Atribución de contactos directos (WhatsApp, teléfono, email).
//
// El canal real de captación es WhatsApp, y WhatsApp no envía ninguna metadata de origen:
// al móvil llega un número y un texto. La única forma de saber de qué web y de qué página
// salió una conversación es que el propio mensaje lleve una marca, así que generamos un
// código corto (`R-SON-4f2`) que viaja en el texto prellenado y se guarda en `lead_clicks`.
//
// El registro es best-effort a propósito: el `href` apunta directo a wa.me y el POST sale
// en paralelo con sendBeacon. Si el backend está frío o caído, el lead pasa igual — perder
// el dato es aceptable, perder al cliente no.

export type LeadApp = 'rent' | 'events';
export type LeadChannel = 'whatsapp' | 'telefono' | 'email';

export interface LeadClickPayload {
  ref: string;
  app: LeadApp;
  section: string;
  channel: LeadChannel;
}

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) || '/api/v1';

// Sin l/o/0/1: el código se lee a ojo desde el móvil y esos cuatro se confunden entre sí.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

function randomSuffix(length = 3): string {
  const values = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(values);
  } else {
    for (let i = 0; i < length; i++) values[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[values[i] % ALPHABET.length];
  return out;
}

function sectionCode(section: string): string {
  const clean = section.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (clean.slice(0, 3) || 'GEN').padEnd(3, 'X');
}

/**
 * Código visible que se incrusta en el mensaje. Formato `R-SON-4f2`: inicial de la app,
 * tres letras de la sección y un sufijo aleatorio que lo hace único por clic.
 */
export function createLeadRef(app: LeadApp, section: string): string {
  return `${app === 'rent' ? 'R' : 'E'}-${sectionCode(section)}-${randomSuffix()}`;
}

function currentDevice(): 'movil' | 'escritorio' | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'movil' : 'escritorio';
}

/**
 * Envía el registro sin bloquear la navegación. Nunca lanza.
 */
export function reportLeadClick({ ref, app, section, channel }: LeadClickPayload): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams(window.location.search);
    const body = JSON.stringify({
      ref,
      app,
      section,
      channel,
      path: window.location.pathname.slice(0, 300),
      referrer: document.referrer ? document.referrer.slice(0, 300) : undefined,
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      gclid: params.get('gclid') || undefined,
      device: currentDevice(),
    });

    const url = `${API_BASE_URL}/lead-clicks`;

    // sendBeacon sobrevive a que el navegador se vaya a WhatsApp; fetch con keepalive
    // es el plan B para navegadores donde no está disponible.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }

    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Silencio deliberado: este registro nunca puede impedir que el usuario contacte.
  }
}

/**
 * Añade el código al final del mensaje prellenado.
 */
export function messageWithRef(message: string, ref: string): string {
  return `${message.trim()} (ref. ${ref})`;
}

export function whatsappHref(phone: string, message: string, ref: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(messageWithRef(message, ref))}`;
}

/**
 * Sección a partir de la ruta actual, para los elementos globales (botón flotante,
 * cabecera, pie) que no saben en qué página están.
 */
export function sectionFromPath(pathname?: string): string {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const first = path.split('/').filter(Boolean)[0];
  return first ? first.slice(0, 20) : 'home';
}

/**
 * Abre WhatsApp registrando el clic, generando el código en ese momento. Para elementos
 * globales que persisten entre páginas y no pueden fijar el código al montarse.
 */
export function openWhatsAppLead(
  app: LeadApp,
  channel: LeadChannel,
  phone: string,
  message: string,
  section?: string,
): string {
  const resolvedSection = section || sectionFromPath();
  const ref = createLeadRef(app, resolvedSection);
  reportLeadClick({ ref, app, section: resolvedSection, channel });
  return whatsappHref(phone, message, ref);
}
