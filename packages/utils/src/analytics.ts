// Firma alineada con las declaraciones globales existentes en las apps (any[]) para
// que el merge de tipos de Window no entre en conflicto.
// Firma alineada con las declaraciones globales existentes en las apps (any[]) para
// que el merge de tipos de Window no entre en conflicto.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
  }
}

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || undefined;
const PURCHASE_LABEL = import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL || undefined;
const LEAD_LABEL = import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL || undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || undefined;

// No gateamos las conversiones de Google por consentimiento: con Consent Mode v2 el ping
// se envía siempre y el estado de ad_storage (fijado en index.html + banner de cookies)
// decide si se usa cookie o conversión modelada. En localhost window.gtag no existe → no-op.
function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag(...args);
}

// Meta no tiene Consent Mode: solo cargamos/disparamos el pixel si hay consentimiento
// de marketing. fbq() es no-op hasta que initMetaPixel() haya inyectado el script.
function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const consent = JSON.parse(localStorage.getItem('cookie_consent') || 'null');
    return !!(consent && consent.marketing);
  } catch {
    return false;
  }
}

function fbq(...args: unknown[]): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  window.fbq(...args);
}

let metaLoaded = false;

export function initGoogleAds(): void {
  if (!GOOGLE_ADS_ID) return;
  gtag('config', GOOGLE_ADS_ID);
}

// Carga el Meta Pixel (snippet estándar fbevents.js) solo si hay ID configurado y
// consentimiento de marketing. Es idempotente: llamar varias veces no recarga el script.
// Las apps lo invocan al arrancar (visitante recurrente) y desde el banner al aceptar.
export function initMetaPixel(): void {
  if (!META_PIXEL_ID || metaLoaded || typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  metaLoaded = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const w = window as any;
  if (!w.fbq) {
    const n: any = (w.fbq = function (...a: any[]) {
      n.callMethod ? n.callMethod.apply(n, a) : n.queue.push(a);
    });
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  fbq('init', META_PIXEL_ID);
  fbq('track', 'PageView');
}

export interface PurchaseItem {
  item_id?: string;
  item_name?: string;
  quantity?: number;
  price?: number;
}

export interface PurchaseParams {
  transactionId: string;
  value?: number;
  currency?: string;
  items?: PurchaseItem[];
}

export function trackPurchase({ transactionId, value, currency = 'EUR', items }: PurchaseParams): void {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    ...(value != null ? { value } : {}),
    currency,
    ...(items ? { items } : {}),
  });
  if (GOOGLE_ADS_ID && PURCHASE_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${PURCHASE_LABEL}`,
      ...(value != null ? { value } : {}),
      currency,
      transaction_id: transactionId,
    });
  }
  fbq('track', 'Purchase', { ...(value != null ? { value } : {}), currency });
}

export interface LeadParams {
  value?: number;
  currency?: string;
  leadType?: string;
}

export function trackLead({ value, currency = 'EUR', leadType }: LeadParams = {}): void {
  gtag('event', 'generate_lead', {
    ...(value != null ? { value } : {}),
    currency,
    ...(leadType ? { lead_type: leadType } : {}),
  });
  if (GOOGLE_ADS_ID && LEAD_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${LEAD_LABEL}`,
      ...(value != null ? { value } : {}),
      currency,
    });
  }
  fbq('track', 'Lead', { ...(value != null ? { value } : {}), currency });
}
