import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import {
  EVENT_TYPES,
  SERVICE_OPTIONS,
  estimatePrice,
  EventType,
} from '../data/pricing';
import { quoteRequestService } from '../services/quoteRequest.service';
import { getPackBySlug, formatEuros, Pack } from '../data/packs';

const EASE = [0.22, 1, 0.36, 1] as const;

type Step = 1 | 2 | 3;

interface FormState {
  eventType: EventType | null;
  guests: number;
  date: string;
  place: string;
  services: string[];
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const initialState: FormState = {
  eventType: null,
  guests: 100,
  date: '',
  place: '',
  services: [],
  name: '',
  email: '',
  phone: '',
  notes: '',
};

const packTypeToEventType = (t: Pack['type']): EventType =>
  t === 'boda' ? 'boda' : 'corporativo';

const BriefPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const packSlug = searchParams.get('pack');
  const upgradesParam = searchParams.get('upgrades');
  const reserveMode = searchParams.get('reserve') === '1';

  const pack = packSlug ? getPackBySlug(packSlug) : undefined;
  const selectedUpgradeKeys = useMemo(
    () => (upgradesParam ? upgradesParam.split(',').filter(Boolean) : []),
    [upgradesParam]
  );
  const selectedUpgrades = useMemo(
    () => (pack ? pack.upgrades.filter((u) => selectedUpgradeKeys.includes(u.key)) : []),
    [pack, selectedUpgradeKeys]
  );

  const [step, setStep] = useState<Step>(pack ? 3 : 1);
  const [form, setForm] = useState<FormState>(() => {
    if (!pack) return initialState;
    return {
      ...initialState,
      eventType: packTypeToEventType(pack.type),
      guests: Math.min(pack.maxGuests, 100),
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pack) {
      setForm((f) => ({
        ...f,
        eventType: packTypeToEventType(pack.type),
        guests: Math.min(pack.maxGuests, f.guests || 100),
      }));
      setStep(3);
    }
  }, [pack]);

  const removePack = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('pack');
    p.delete('upgrades');
    p.delete('reserve');
    setSearchParams(p, { replace: true });
    setStep(1);
  };

  const packTotal = useMemo(() => {
    if (!pack) return 0;
    return pack.price + selectedUpgrades.reduce((acc, u) => acc + u.price, 0);
  }, [pack, selectedUpgrades]);
  const packSignal = Math.round(packTotal * 0.3);
  const upgradesQueryString =
    selectedUpgradeKeys.length > 0 ? '&upgrades=' + selectedUpgradeKeys.join(',') : '';
  const wasCanceled = searchParams.get('canceled') === '1';

  const priceRange = useMemo(
    () => estimatePrice({ eventType: form.eventType, guests: form.guests, services: form.services }),
    [form.eventType, form.guests, form.services]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleService = (key: string) =>
    setForm((f) => ({
      ...f,
      services: f.services.includes(key)
        ? f.services.filter((s) => s !== key)
        : [...f.services, key],
    }));

  const canAdvanceFrom1 = form.eventType !== null && form.guests > 0;
  const canAdvanceFrom2 = form.services.length > 0;
  const canSubmit =
    form.name.trim().length > 1 &&
    form.phone.trim().length >= 9 &&
    /.+@.+\..+/.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !form.eventType) return;
    setSubmitting(true);
    setError(null);
    try {
      const estimated = pack
        ? packTotal
        : priceRange
        ? Math.round((priceRange.min + priceRange.max) / 2)
        : undefined;
      const packNote = pack
        ? `Pack ${pack.name} (${formatEuros(pack.price)})${
            selectedUpgrades.length
              ? ' + upgrades: ' + selectedUpgrades.map((u) => `${u.label} (${formatEuros(u.price)})`).join(', ')
              : ''
          }. Total ${formatEuros(packTotal)}.${reserveMode ? ' Cliente pidió reservar directamente.' : ''}`
        : '';
      const combinedNotes = [packNote, form.notes.trim()].filter(Boolean).join('\n\n');
      const servicesPayload = pack
        ? ['pack:' + pack.slug, ...selectedUpgrades.map((u) => 'upgrade:' + u.key)]
        : form.services;

      if (pack && reserveMode) {
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
        estimatedTotal: estimated,
        notes: combinedNotes || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message;
      setError(msg || 'No hemos podido enviar el brief. Inténtalo otra vez o escríbenos a info@resonaevents.com.');
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
        <ThankYou form={form} priceRange={priceRange?.formatted ?? null} />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Empezar brief — ReSona Events"
        description="Cuéntanos tu evento en tres pasos. Fecha, servicios y datos. Te devolvemos propuesta con precio cerrado en menos de 24 horas."
        canonicalUrl="https://resonaevents.com/brief"
      />

      <section className="min-h-[100svh] pt-28 md:pt-36 pb-20 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <aside className="md:col-span-4">
              <div className="md:sticky md:top-28 flex flex-col gap-8">
                <div>
                  <span className="eyebrow">{pack ? (reserveMode ? 'Reserva' : 'Adaptación') : 'Brief'}</span>
                  <h1 className="mt-4 font-display text-display-md tracking-tighter text-balance">
                    {pack ? (
                      reserveMode ? (
                        <>Últimos <span className="display-italic text-accent-500">datos</span>.</>
                      ) : (
                        <>Adaptamos <span className="display-italic text-accent-500">el pack</span>.</>
                      )
                    ) : (
                      <>Tres pasos para <span className="display-italic text-accent-500">empezar</span>.</>
                    )}
                  </h1>
                  <p className="mt-5 text-ink/70 leading-relaxed max-w-md">
                    {pack
                      ? reserveMode
                        ? 'Solo nos falta tu fecha y datos de contacto. En 24h verificamos disponibilidad y te enviamos link de pago seguro.'
                        : 'Has elegido un pack como punto de partida. Cuéntanos qué cambiarías y nuestro equipo vuelve con propuesta.'
                      : 'Cuéntanos cómo imaginas el día. Te respondemos en menos de 24 horas con una propuesta a medida — sin spam, sin llamadas automáticas.'}
                  </p>
                </div>

                {pack ? (
                  <PackSummary
                    pack={pack}
                    upgrades={selectedUpgrades}
                    total={packTotal}
                    signal={packSignal}
                    onRemove={removePack}
                    reserveMode={reserveMode}
                  />
                ) : (
                  <>
                    <ProgressRail step={step} onSelect={(s) => s < step && setStep(s)} />
                    <PricePreview priceFormatted={priceRange?.formatted ?? null} />
                  </>
                )}
              </div>
            </aside>

            <div className="md:col-span-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StepWrapper key="step-1">
                    <Step1
                      form={form}
                      update={update}
                    />
                    <StepFooter
                      canAdvance={canAdvanceFrom1}
                      onNext={() => setStep(2)}
                    />
                  </StepWrapper>
                )}
                {step === 2 && (
                  <StepWrapper key="step-2">
                    <Step2
                      form={form}
                      toggleService={toggleService}
                    />
                    <StepFooter
                      canAdvance={canAdvanceFrom2}
                      onNext={() => setStep(3)}
                      onBack={() => setStep(1)}
                    />
                  </StepWrapper>
                )}
                {step === 3 && (
                  <StepWrapper key="step-3">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                      {wasCanceled && (
                        <div className="text-sm text-ink/80 bg-accent-50 border border-accent-200 rounded-lg px-4 py-3">
                          Has cancelado el pago. Tus datos siguen aquí: si quieres, puedes volver a intentarlo o guardar la reserva para hablarlo con nosotros primero.
                        </div>
                      )}
                      <Step3
                        form={form}
                        update={update}
                        showDateAndPlace={!!pack}
                        submitLabel={reserveMode ? 'Pagar señal y reservar' : undefined}
                      />
                      {error && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                          {error}
                        </div>
                      )}
                      <StepFooter
                        canAdvance={canSubmit}
                        submitting={submitting}
                        submit
                        submitLabel={reserveMode ? `Pagar señal (${formatEuros(packSignal)}) y reservar` : 'Enviar brief'}
                        onBack={pack ? undefined : () => setStep(2)}
                      />
                    </form>
                  </StepWrapper>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.5, ease: EASE }}
    className="flex flex-col gap-10"
  >
    {children}
  </motion.div>
);

const ProgressRail = ({ step, onSelect }: { step: Step; onSelect: (s: Step) => void }) => {
  const items: { n: Step; label: string }[] = [
    { n: 1, label: 'Tu evento' },
    { n: 2, label: 'Servicios' },
    { n: 3, label: 'Contacto' },
  ];
  return (
    <ol className="flex flex-col gap-1 border-t border-ink/15">
      {items.map((it) => {
        const isActive = step === it.n;
        const isDone = step > it.n;
        return (
          <li key={it.n} className="border-b border-ink/15">
            <button
              type="button"
              onClick={() => onSelect(it.n)}
              disabled={it.n > step}
              className={`w-full flex items-center justify-between py-4 transition-colors ${
                isActive ? 'text-ink' : isDone ? 'text-ink/70 hover:text-ink' : 'text-ink/30'
              } ${it.n > step ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-sm transition-colors ${
                    isActive
                      ? 'bg-ink text-cream'
                      : isDone
                      ? 'bg-accent-400 text-ink'
                      : 'border border-ink/30 text-ink/40'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : `0${it.n}`}
                </span>
                <span className="font-display text-lg tracking-tight">{it.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

const PricePreview = ({ priceFormatted }: { priceFormatted: string | null }) => (
  <div className="bg-ink text-cream p-6 md:p-8 rounded-sm">
    <div className="eyebrow text-cream/60">Presupuesto estimado</div>
    <AnimatePresence mode="wait">
      {priceFormatted ? (
        <motion.div
          key={priceFormatted}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-3 font-display text-4xl md:text-5xl tracking-tighter"
        >
          {priceFormatted}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 font-display text-3xl md:text-4xl tracking-tighter text-cream/40"
        >
          —
        </motion.div>
      )}
    </AnimatePresence>
    <p className="mt-3 text-sm text-cream/60 leading-relaxed">
      Rango orientativo, IVA no incluido. El precio final lo cerramos con el brief completo.
    </p>
  </div>
);

const Step1 = ({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) => (
  <>
    <Field
      eyebrow="01"
      label="¿Qué tipo de evento es?"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EVENT_TYPES.map((et) => {
          const active = form.eventType === et.key;
          return (
            <button
              key={et.key}
              type="button"
              onClick={() => update('eventType', et.key)}
              className={`text-left p-5 border transition-all ${
                active
                  ? 'border-ink bg-ink text-cream'
                  : 'border-ink/20 hover:border-ink/50'
              }`}
            >
              <div className="font-display text-2xl tracking-tighter">{et.label}</div>
              <div className={`mt-1 text-sm ${active ? 'text-cream/70' : 'text-ink/60'}`}>
                {et.description}
              </div>
            </button>
          );
        })}
      </div>
    </Field>

    <Field
      eyebrow="02"
      label="¿Cuántos asistentes?"
      hint={`${form.guests} personas`}
    >
      <input
        type="range"
        min={20}
        max={1500}
        step={10}
        value={form.guests}
        onChange={(e) => update('guests', parseInt(e.target.value, 10))}
        className="w-full accent-ink"
      />
      <div className="mt-2 flex justify-between text-xs text-ink/50">
        <span>20</span>
        <span>500</span>
        <span>1.500+</span>
      </div>
    </Field>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Field eyebrow="03" label="Fecha aproximada">
        <input
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
        />
      </Field>
      <Field eyebrow="04" label="Lugar o ciudad">
        <input
          type="text"
          value={form.place}
          onChange={(e) => update('place', e.target.value)}
          placeholder="Valencia, Alicante, Masía..."
          className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
        />
      </Field>
    </div>
  </>
);

const Step2 = ({
  form,
  toggleService,
}: {
  form: FormState;
  toggleService: (key: string) => void;
}) => (
  <Field
    eyebrow="05"
    label="¿Qué servicios necesitas?"
    hint="Puedes marcar varios"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SERVICE_OPTIONS.map((s) => {
        const active = form.services.includes(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => toggleService(s.key)}
            className={`text-left p-5 border transition-all ${
              active
                ? 'border-ink bg-ink text-cream'
                : 'border-ink/20 hover:border-ink/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-xl tracking-tighter">{s.label}</div>
                <div className={`mt-1 text-sm ${active ? 'text-cream/70' : 'text-ink/60'}`}>
                  {s.description}
                </div>
              </div>
              <span
                className={`mt-1 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                  active ? 'bg-accent-400 text-ink' : 'border border-ink/30'
                }`}
              >
                {active && <Check className="w-4 h-4" />}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  </Field>
);

const Step3 = ({
  form,
  update,
  showDateAndPlace,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  showDateAndPlace?: boolean;
  submitLabel?: string;
}) => (
  <>
    {showDateAndPlace && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field eyebrow="01" label="Fecha del evento">
          <input
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
          />
        </Field>
        <Field eyebrow="02" label="Lugar o ciudad">
          <input
            type="text"
            value={form.place}
            onChange={(e) => update('place', e.target.value)}
            placeholder="Valencia, Alicante, Masía..."
            className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
          />
        </Field>
      </div>
    )}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Field eyebrow="06" label="Tu nombre">
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
        />
      </Field>
      <Field eyebrow="07" label="Teléfono">
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+34 ..."
          className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
        />
      </Field>
    </div>
    <Field eyebrow="08" label="Email">
      <input
        required
        type="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none"
      />
    </Field>
    <Field
      eyebrow="09"
      label="¿Algo más que nos quieras contar?"
      hint="Opcional"
    >
      <textarea
        rows={5}
        value={form.notes}
        onChange={(e) => update('notes', e.target.value)}
        placeholder="Referencias, inspiración, peticiones especiales..."
        className="w-full px-4 py-3 bg-transparent border border-ink/20 focus:border-ink focus:ring-0 rounded-none resize-none"
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
  <div className="flex flex-col gap-4">
    <div className="flex items-baseline justify-between gap-3">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-sm text-accent-500">{eyebrow}</span>
        <label className="font-display text-xl md:text-2xl tracking-tight">{label}</label>
      </div>
      {hint && <span className="text-xs text-ink/50 tracking-wide">{hint}</span>}
    </div>
    <div>{children}</div>
  </div>
);

const StepFooter = ({
  canAdvance,
  onNext,
  onBack,
  submit,
  submitting,
  submitLabel,
}: {
  canAdvance: boolean;
  onNext?: () => void;
  onBack?: () => void;
  submit?: boolean;
  submitting?: boolean;
  submitLabel?: string;
}) => (
  <div className="flex items-center justify-between pt-4 border-t border-ink/15">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-ink/70 hover:text-ink text-sm tracking-wide"
      >
        <ArrowLeft className="w-4 h-4" />
        Atrás
      </button>
    ) : (
      <span />
    )}
    {submit ? (
      <button
        type="submit"
        disabled={!canAdvance || submitting}
        className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 disabled:opacity-40 disabled:hover:bg-ink transition-all group"
      >
        <span className="font-medium">
          {submitting ? 'Enviando…' : submitLabel ?? 'Enviar brief'}
        </span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    ) : (
      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance}
        className="inline-flex items-center gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 disabled:opacity-40 disabled:hover:bg-ink transition-all group"
      >
        <span className="font-medium">Siguiente</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    )}
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
        <div className="mt-3 font-display text-3xl tracking-tighter">
          {pack.name}
        </div>
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

const ThankYou = ({ form, priceRange }: { form: FormState; priceRange: string | null }) => (
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
        Gracias, {form.name.split(' ')[0] || 'buena gente'}.<br />
        <span className="display-italic text-accent-500">Te escribimos hoy.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        className="mt-8 max-w-xl mx-auto text-ink/70 text-lg leading-relaxed"
      >
        Hemos recibido tu brief. Tenemos 24 horas para leerlo con calma y
        devolverte una propuesta a medida, con precio cerrado y sin compromiso.
        {priceRange && (
          <>
            {' '}El rango estimado que viste (<strong>{priceRange}</strong>) lo afinaremos
            con tu lugar, fecha y detalles específicos.
          </>
        )}
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
          href="https://wa.me/34613881414?text=Hola,%20acabo%20de%20enviar%20un%20brief"
          className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
        >
          <span className="text-sm tracking-wide">WhatsApp directo</span>
        </a>
      </motion.div>
    </div>
  </section>
);

export default BriefPage;
