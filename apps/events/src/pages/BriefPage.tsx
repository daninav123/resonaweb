import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, MessageCircle, Mail, X, Check } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { EVENT_TYPES, EventType } from '../data/pricing';
import { quoteRequestService } from '../services/quoteRequest.service';
import { api } from '@resona/api-client';
import { getPackBySlug, formatEuros, Pack } from '../data/packs';
import { trackLead } from '@resona/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const WHATSAPP = '34613881414';
const PHONE_DISPLAY = '+34 613 881 414';
const CONTACT_EMAIL = 'info@resonaevents.com';

// El backend puede devolver el error como objeto ({ error: { code, message } }) o como
// string; forzamos siempre un string para no pintar un objeto como hijo de React (#31).
// Solo mostramos el detalle del backend en validaciones (400), accionables por el usuario;
// el resto (401, red, 5xx) → mensaje genérico.
const friendlyError = (err: any, fallback: string): string => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const backendMsg =
    (typeof data?.error === 'string' && data.error) ||
    (typeof data?.error?.message === 'string' && data.error.message) ||
    (typeof data?.message === 'string' && data.message) ||
    '';
  if (status === 400 && backendMsg) return backendMsg;
  return fallback;
};

const BriefPage = () => {
  const [searchParams] = useSearchParams();
  const packSlug = searchParams.get('pack');
  const pack = packSlug ? getPackBySlug(packSlug) : undefined;

  return pack ? <PackBrief pack={pack} /> : <EventContact />;
};

/* ──────────────────────────────────────────────────────────────────────────
   Flujo general (sin pack): página de contacto simple de una pantalla.
   ────────────────────────────────────────────────────────────────────────── */

interface ContactForm {
  eventType: EventType | null;
  name: string;
  email: string;
  phone: string;
  date: string;
  place: string;
  message: string;
}

const leadLines = (f: ContactForm): string[] => {
  const typeLabel = EVENT_TYPES.find((t) => t.key === f.eventType)?.label;
  return [
    `Nombre: ${f.name}`,
    `Email: ${f.email}`,
    `Teléfono: ${f.phone}`,
    ...(typeLabel ? [`Tipo de evento: ${typeLabel}`] : []),
    ...(f.date ? [`Fecha aproximada: ${f.date}`] : []),
    ...(f.place.trim() ? [`Lugar o ciudad: ${f.place.trim()}`] : []),
    '',
    f.message.trim() || '(sin mensaje adicional)',
  ];
};

const buildMailto = (f: ContactForm): string => {
  const typeLabel = EVENT_TYPES.find((t) => t.key === f.eventType)?.label;
  const subject = typeLabel ? `Evento — ${typeLabel}` : 'Consulta de evento';
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    leadLines(f).join('\n')
  )}`;
};

const buildWhatsapp = (f: ContactForm): string =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    'Hola, quiero información para mi evento:\n\n' + leadLines(f).join('\n')
  )}`;

const EventContact = () => {
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo');
  const presetType = EVENT_TYPES.find((t) => t.key === tipoParam)?.key ?? null;

  const [form, setForm] = useState<ContactForm>({
    eventType: presetType,
    name: '',
    email: '',
    phone: '',
    date: '',
    place: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const nameValid = form.name.trim().length > 1;
  const phoneValid = form.phone.trim().length >= 9;
  const emailValid = /.+@.+\..+/.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValid || !phoneValid || !emailValid) {
      setError('Revisa tu nombre, email y teléfono para que podamos responderte.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setShowFallback(false);
    try {
      const typeLabel = EVENT_TYPES.find((t) => t.key === form.eventType)?.label;
      const subject = typeLabel ? `Nuevo evento — ${typeLabel}` : 'Consulta desde la web';
      const details = [
        typeLabel ? `Tipo de evento: ${typeLabel}` : null,
        form.date ? `Fecha aproximada: ${form.date}` : null,
        form.place.trim() ? `Lugar o ciudad: ${form.place.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      const message =
        [form.message.trim(), details].filter(Boolean).join('\n\n') ||
        'Sin mensaje adicional.';

      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject,
        message,
      });
      trackLead({ leadType: 'contacto' });
      setSubmitted(true);
    } catch (err: any) {
      const status = err?.response?.status;
      // 400 = validación que el usuario puede corregir; el resto (401/red/5xx) →
      // ofrecemos enviar el mismo mensaje por email/WhatsApp para no perder el lead.
      setShowFallback(status !== 400);
      setError(
        friendlyError(
          err,
          'No hemos podido enviar el formulario automáticamente. Mándanoslo en un clic — llega igual a nuestro equipo:'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEOHead
          title="Mensaje recibido — ReSona Events"
          description="Hemos recibido tu mensaje. Te respondemos en menos de 24 horas."
          canonicalUrl="https://resonaevents.com/brief"
        />
        <ThankYou name={form.name} />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Cuéntanos tu evento — ReSona Events"
        description="Déjanos tus datos y cómo imaginas el evento. Te respondemos en menos de 24 horas con una propuesta a medida."
        canonicalUrl="https://resonaevents.com/brief"
      />

      <section className="min-h-[100svh] pt-28 md:pt-36 pb-20 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <aside className="md:col-span-5">
              <div className="md:sticky md:top-28 flex flex-col gap-8">
                <div>
                  <span className="eyebrow">Contacto</span>
                  <h1 className="mt-4 font-display text-display-md tracking-tighter text-balance">
                    Cuéntanos tu <span className="display-italic text-accent-500">evento</span>.
                  </h1>
                  <p className="mt-5 text-ink/70 leading-relaxed max-w-md">
                    Déjanos tus datos y un par de líneas sobre cómo lo imaginas. Te
                    respondemos en menos de 24 horas con una propuesta a medida — sin spam,
                    sin llamadas automáticas.
                  </p>
                </div>

                <div className="flex flex-col border-y border-ink/10 divide-y divide-ink/10">
                  {[
                    { href: `tel:+${WHATSAPP}`, icon: Phone, label: PHONE_DISPLAY, ext: false },
                    { href: `https://wa.me/${WHATSAPP}`, icon: MessageCircle, label: 'WhatsApp directo', ext: true },
                    { href: `mailto:${CONTACT_EMAIL}`, icon: Mail, label: CONTACT_EMAIL, ext: false },
                  ].map(({ href, icon: Icon, label, ext }) => (
                    <a
                      key={label}
                      href={href}
                      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-center gap-4 py-4 text-ink/80 hover:text-ink transition-colors"
                    >
                      <Icon className="w-5 h-5 text-accent-500" />
                      <span className="tracking-wide">{label}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-ink/0 group-hover:text-ink/40 group-hover:translate-x-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="md:col-span-7">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
                <Field eyebrow="01" label="¿Qué tipo de evento es?" hint="Opcional">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EVENT_TYPES.map((et) => {
                      const active = form.eventType === et.key;
                      return (
                        <button
                          key={et.key}
                          type="button"
                          onClick={() => set('eventType', active ? null : et.key)}
                          className={`group text-left p-5 rounded-xl border transition-all duration-300 ${
                            active
                              ? 'border-ink bg-ink text-cream shadow-sm'
                              : 'border-ink/15 bg-cream-50 hover:border-ink/40 hover:bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-display text-2xl tracking-tight">{et.label}</div>
                              <div
                                className={`mt-1 text-sm ${active ? 'text-cream/70' : 'text-ink/55'}`}
                              >
                                {et.description}
                              </div>
                            </div>
                            <span
                              className={`mt-1 w-5 h-5 rounded-full flex-shrink-0 border flex items-center justify-center transition-colors ${
                                active
                                  ? 'bg-accent-400 border-accent-400 text-ink'
                                  : 'border-ink/25 group-hover:border-ink/50'
                              }`}
                            >
                              {active && <Check className="w-3 h-3" strokeWidth={3} />}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field eyebrow="02" label="Tu nombre">
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field eyebrow="03" label="Teléfono">
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+34 ..."
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field eyebrow="04" label="Email">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field eyebrow="05" label="Fecha aproximada" hint="Opcional">
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => set('date', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field eyebrow="06" label="Lugar o ciudad" hint="Opcional">
                    <input
                      type="text"
                      value={form.place}
                      onChange={(e) => set('place', e.target.value)}
                      placeholder="Valencia, Alicante, Masía..."
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field eyebrow="07" label="¿Cómo imaginas el evento?" hint="Opcional">
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Nº de invitados, servicios que buscas, referencias, inspiración..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex flex-col gap-4">
                    <p className="text-sm text-red-700">{error}</p>
                    {showFallback && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href={buildMailto(form)}
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-ink text-cream text-sm font-medium hover:bg-ink-800 transition"
                        >
                          <Mail className="w-4 h-4" />
                          Enviar por email
                        </a>
                        <a
                          href={buildWhatsapp(form)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-ink/30 text-sm hover:border-ink transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Enviar por WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-ink/15">
                  <span className="text-xs text-ink/50 max-w-xs leading-relaxed">
                    Al enviar aceptas que te contactemos sobre tu evento. Sin spam.
                  </span>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 disabled:opacity-40 disabled:hover:bg-ink transition-all group"
                  >
                    <span className="font-medium">{submitting ? 'Enviando…' : 'Enviar'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Flujo con pack: adaptación / reserva con señal (Stripe). Sin cambios de fondo.
   ────────────────────────────────────────────────────────────────────────── */

interface PackForm {
  eventType: EventType;
  guests: number;
  date: string;
  place: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const packTypeToEventType = (t: Pack['type']): EventType =>
  t === 'boda' ? 'boda' : 'corporativo';

const PackBrief = ({ pack }: { pack: Pack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const upgradesParam = searchParams.get('upgrades');
  const reserveMode = searchParams.get('reserve') === '1';
  const wasCanceled = searchParams.get('canceled') === '1';

  const selectedUpgradeKeys = useMemo(
    () => (upgradesParam ? upgradesParam.split(',').filter(Boolean) : []),
    [upgradesParam]
  );
  const selectedUpgrades = useMemo(
    () => pack.upgrades.filter((u) => selectedUpgradeKeys.includes(u.key)),
    [pack, selectedUpgradeKeys]
  );

  const [form, setForm] = useState<PackForm>(() => ({
    eventType: packTypeToEventType(pack.type),
    guests: Math.min(pack.maxGuests, 100),
    date: '',
    place: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      eventType: packTypeToEventType(pack.type),
      guests: Math.min(pack.maxGuests, f.guests || 100),
    }));
  }, [pack]);

  const removePack = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('pack');
    p.delete('upgrades');
    p.delete('reserve');
    p.delete('canceled');
    setSearchParams(p, { replace: true });
  };

  const update = <K extends keyof PackForm>(key: K, value: PackForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const packTotal = useMemo(
    () => pack.price + selectedUpgrades.reduce((acc, u) => acc + u.price, 0),
    [pack, selectedUpgrades]
  );
  const packSignal = Math.round(packTotal * 0.3);
  const upgradesQueryString =
    selectedUpgradeKeys.length > 0 ? '&upgrades=' + selectedUpgradeKeys.join(',') : '';

  const canSubmit =
    form.name.trim().length > 1 &&
    form.phone.trim().length >= 9 &&
    /.+@.+\..+/.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const packNote = `Pack ${pack.name} (${formatEuros(pack.price)})${
        selectedUpgrades.length
          ? ' + upgrades: ' +
            selectedUpgrades.map((u) => `${u.label} (${formatEuros(u.price)})`).join(', ')
          : ''
      }. Total ${formatEuros(packTotal)}.${
        reserveMode ? ' Cliente pidió reservar directamente.' : ''
      }`;
      const combinedNotes = [packNote, form.notes.trim()].filter(Boolean).join('\n\n');
      const servicesPayload = ['pack:' + pack.slug, ...selectedUpgrades.map((u) => 'upgrade:' + u.key)];

      if (reserveMode) {
        const origin = window.location.origin;
        const response = await quoteRequestService.reserveWithPayment({
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          eventType: form.eventType,
          attendees: form.guests,
          eventDate: form.date || undefined,
          eventLocation: form.place.trim() || undefined,
          services: servicesPayload,
          estimatedTotal: packTotal,
          notes: combinedNotes || undefined,
          selectedPack: pack.slug,
          successUrl: `${origin}/reserva-confirmada?quote={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/brief?pack=${pack.slug}${upgradesQueryString}&reserve=1&canceled=1`,
        });
        const checkoutUrl = response.data?.checkoutUrl;
        if (!checkoutUrl) {
          throw new Error('No hemos podido generar el pago. Intenta de nuevo.');
        }
        window.location.assign(checkoutUrl);
        return;
      }

      await quoteRequestService.submit({
        customerName: form.name.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        eventType: form.eventType,
        attendees: form.guests,
        eventDate: form.date || undefined,
        eventLocation: form.place.trim() || undefined,
        services: servicesPayload,
        estimatedTotal: packTotal,
        notes: combinedNotes || undefined,
      });
      trackLead({ value: packTotal, leadType: 'pack' });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        friendlyError(
          err,
          `No hemos podido enviar el brief. Inténtalo otra vez, llámanos al ${PHONE_DISPLAY} o escríbenos a ${CONTACT_EMAIL}.`
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEOHead
          title="Brief recibido — ReSona Events"
          description="Hemos recibido tu brief. Te respondemos en menos de 24 horas."
          canonicalUrl="https://resonaevents.com/brief"
        />
        <ThankYou name={form.name} />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Reserva tu pack — ReSona Events"
        description="Últimos datos para reservar tu pack. Verificamos disponibilidad y te enviamos propuesta con precio cerrado en menos de 24 horas."
        canonicalUrl="https://resonaevents.com/brief"
      />

      <section className="min-h-[100svh] pt-28 md:pt-36 pb-20 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <aside className="md:col-span-4">
              <div className="md:sticky md:top-28 flex flex-col gap-8">
                <div>
                  <span className="eyebrow">{reserveMode ? 'Reserva' : 'Adaptación'}</span>
                  <h1 className="mt-4 font-display text-display-md tracking-tighter text-balance">
                    {reserveMode ? (
                      <>
                        Últimos <span className="display-italic text-accent-500">datos</span>.
                      </>
                    ) : (
                      <>
                        Adaptamos <span className="display-italic text-accent-500">el pack</span>.
                      </>
                    )}
                  </h1>
                  <p className="mt-5 text-ink/70 leading-relaxed max-w-md">
                    {reserveMode
                      ? 'Solo nos falta tu fecha y datos de contacto. En 24h verificamos disponibilidad y te enviamos link de pago seguro.'
                      : 'Has elegido un pack como punto de partida. Cuéntanos qué cambiarías y nuestro equipo vuelve con propuesta.'}
                  </p>
                </div>

                <PackSummary
                  pack={pack}
                  upgrades={selectedUpgrades}
                  total={packTotal}
                  signal={packSignal}
                  onRemove={removePack}
                  reserveMode={reserveMode}
                />
              </div>
            </aside>

            <div className="md:col-span-8">
              <StepWrapper>
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                  {wasCanceled && (
                    <div className="text-sm text-ink/80 bg-accent-50 border border-accent-200 rounded-lg px-4 py-3">
                      Has cancelado el pago. Tus datos siguen aquí: si quieres, puedes volver a
                      intentarlo o guardar la reserva para hablarlo con nosotros primero.
                    </div>
                  )}
                  <PackDetails form={form} update={update} />
                  {error && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                      {error}
                    </div>
                  )}
                  <div className="flex items-center justify-end pt-4 border-t border-ink/15">
                    <button
                      type="submit"
                      disabled={!canSubmit || submitting}
                      className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 disabled:opacity-40 disabled:hover:bg-ink transition-all group"
                    >
                      <span className="font-medium">
                        {submitting
                          ? 'Enviando…'
                          : reserveMode
                          ? `Pagar señal (${formatEuros(packSignal)}) y reservar`
                          : 'Enviar brief'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </form>
              </StepWrapper>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
   Piezas compartidas
   ────────────────────────────────────────────────────────────────────────── */

const inputClass =
  'w-full px-4 py-3.5 bg-cream-50 border border-ink/15 rounded-xl text-ink placeholder:text-ink/35 focus:border-accent-500 focus:bg-white focus:ring-0 transition-colors';

const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: EASE }}
    className="flex flex-col gap-10"
  >
    {children}
  </motion.div>
);

const PackDetails = ({
  form,
  update,
}: {
  form: PackForm;
  update: <K extends keyof PackForm>(key: K, value: PackForm[K]) => void;
}) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Field eyebrow="01" label="Fecha del evento">
        <input
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field eyebrow="02" label="Lugar o ciudad">
        <input
          type="text"
          value={form.place}
          onChange={(e) => update('place', e.target.value)}
          placeholder="Valencia, Alicante, Masía..."
          className={inputClass}
        />
      </Field>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Field eyebrow="03" label="Tu nombre">
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field eyebrow="04" label="Teléfono">
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+34 ..."
          className={inputClass}
        />
      </Field>
    </div>
    <Field eyebrow="05" label="Email">
      <input
        required
        type="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        className={inputClass}
      />
    </Field>
    <Field eyebrow="06" label="¿Algo más que nos quieras contar?" hint="Opcional">
      <textarea
        rows={5}
        value={form.notes}
        onChange={(e) => update('notes', e.target.value)}
        placeholder="Referencias, inspiración, peticiones especiales..."
        className={`${inputClass} resize-none`}
      />
    </Field>
  </>
);

const Field = ({
  eyebrow,
  label,
  hint,
  children,
}: {
  eyebrow: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3.5">
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="font-display text-sm text-accent-500">{eyebrow}</span>
      <label className="font-display text-xl md:text-2xl tracking-tight">{label}</label>
      {hint && (
        <span className="text-[0.65rem] uppercase tracking-widest text-ink/40 font-medium">
          {hint}
        </span>
      )}
    </div>
    <div>{children}</div>
  </div>
);

const PackSummary = ({
  pack,
  upgrades,
  total,
  signal,
  onRemove,
  reserveMode,
}: {
  pack: Pack;
  upgrades: Pack['upgrades'];
  total: number;
  signal: number;
  onRemove: () => void;
  reserveMode: boolean;
}) => (
  <div className="bg-ink text-cream p-6 md:p-8">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="eyebrow text-cream/60">
          {reserveMode ? 'Reservando pack' : 'Pack seleccionado'}
        </div>
        <div className="mt-3 font-display text-3xl tracking-tighter">{pack.name}</div>
        <div className="mt-1 text-sm text-cream/70">{pack.typeLabel}</div>
      </div>
      <button
        onClick={onRemove}
        aria-label="Quitar pack"
        className="w-8 h-8 rounded-full border border-cream/20 hover:border-cream flex items-center justify-center text-cream/70 hover:text-cream transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="mt-6 pt-5 border-t border-cream/15 flex flex-col gap-3 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-cream/70">Pack base</span>
        <span className="text-cream/90">{formatEuros(pack.price)}</span>
      </div>
      {upgrades.map((u) => (
        <div key={u.key} className="flex items-baseline justify-between gap-4">
          <span className="text-cream/70">+ {u.label}</span>
          <span className="text-cream/90">{formatEuros(u.price)}</span>
        </div>
      ))}
    </div>

    <div className="mt-6 pt-5 border-t border-cream/15">
      <div className="eyebrow text-cream/60 text-[0.65rem]">Total, IVA no incluido</div>
      <div className="mt-2 font-display text-4xl md:text-5xl tracking-tighter">
        {formatEuros(total)}
      </div>
      <div className="mt-4 pt-4 border-t border-cream/10 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-cream/70">Señal al reservar (30%)</span>
        <span className="text-cream">{formatEuros(signal)}</span>
      </div>
    </div>

    <p className="mt-6 text-xs text-cream/50 leading-relaxed">
      {reserveMode
        ? 'Confirmamos disponibilidad en 24h y te enviamos link de pago seguro. Si no podemos, devolvemos la señal al 100%.'
        : 'Estos precios son orientativos con el pack base. Los ajustamos si pides cambios.'}
    </p>
  </div>
);

const ThankYou = ({ name }: { name: string }) => (
  <section className="min-h-[100svh] pt-28 md:pt-36 pb-20 px-5 md:px-10 bg-cream text-ink flex items-center">
    <div className="max-w-[900px] mx-auto text-center">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="eyebrow"
      >
        Recibido
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.9, ease: EASE }}
        className="mt-6 font-display text-display-lg md:text-display-xl tracking-tighter text-balance"
      >
        Gracias, {name.split(' ')[0] || 'buena gente'}.<br />
        <span className="display-italic text-accent-500">Te escribimos hoy.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        className="mt-8 max-w-xl mx-auto text-ink/70 text-lg leading-relaxed"
      >
        Hemos recibido tu mensaje. Tenemos 24 horas para leerlo con calma y devolverte una
        propuesta a medida, con precio cerrado y sin compromiso.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
        className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link
          to="/portfolio"
          className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 transition-all group"
        >
          <span className="font-medium">Mientras, mira el portfolio</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <a
          href={`https://wa.me/${WHATSAPP}?text=Hola,%20acabo%20de%20escribiros%20por%20la%20web`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
        >
          <span className="text-sm tracking-wide">WhatsApp directo</span>
        </a>
      </motion.div>
    </div>
  </section>
);

export default BriefPage;
