import { useMemo, useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Users, Clock, MapPin } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import { getPackBySlug, formatEuros, PACKS } from '../data/packs';

const EASE = [0.22, 1, 0.36, 1] as const;

const PackDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const pack = slug ? getPackBySlug(slug) : undefined;

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.4, 0.75]);

  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);

  const total = useMemo(() => {
    if (!pack) return 0;
    const upgradesTotal = pack.upgrades
      .filter((u) => selectedUpgrades.includes(u.key))
      .reduce((acc, u) => acc + u.price, 0);
    return pack.price + upgradesTotal;
  }, [pack, selectedUpgrades]);

  const signal = useMemo(() => Math.round(total * 0.3), [total]);

  if (!pack) return <Navigate to="/packs" replace />;

  const currentIdx = PACKS.findIndex((p) => p.slug === pack.slug);
  const next = PACKS[(currentIdx + 1) % PACKS.length];

  const toggleUpgrade = (key: string) =>
    setSelectedUpgrades((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const upgradesQuery =
    selectedUpgrades.length > 0 ? `&upgrades=${selectedUpgrades.join(',')}` : '';

  const packSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Pack ${pack.name} — ${pack.typeLabel}`,
    description: pack.tagline,
    image: pack.cover,
    brand: { '@type': 'Brand', name: 'ReSona Events' },
    offers: {
      '@type': 'Offer',
      price: pack.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `https://resonaevents.com/packs/${pack.slug}`,
    },
  };

  return (
    <>
      <SEOHead
        title={`${pack.name} · ${pack.typeLabel} — ReSona Events`}
        description={`${pack.tagline} ${pack.description.slice(0, 120)}`}
        canonicalUrl={`https://resonaevents.com/packs/${pack.slug}`}
        ogImage={pack.cover}
        schema={packSchema}
      />

      <section ref={heroRef} className="relative h-[85svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src={pack.heroLandscape}
            alt={pack.name}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/90" aria-hidden />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-24">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: EASE }}
            >
              <Link to="/packs" className="inline-flex items-center gap-2 text-cream/80 hover:text-cream text-sm tracking-wide">
                <ArrowLeft className="w-4 h-4" />
                Packs
              </Link>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80 block mt-8"
            >
              {pack.typeLabel}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.1, ease: EASE }}
              className="mt-4 font-display text-display-lg md:text-display-xl text-cream tracking-tighter text-balance"
            >
              {pack.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.9, ease: EASE }}
              className="mt-6 font-display text-xl md:text-2xl italic text-cream/90 max-w-xl leading-snug"
            >
              {pack.tagline}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="flex flex-wrap items-center gap-5 text-ink/70 text-sm mb-8">
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  hasta {pack.maxGuests} invitados
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {pack.durationLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Valencia y Comunidad Valenciana
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.2] tracking-tight text-balance">
                {pack.description}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 p-6 bg-ink/5 border border-ink/10">
                <div className="eyebrow mb-2">Ideal para</div>
                <p className="text-ink/80">{pack.idealFor}</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-16">
                <span className="eyebrow">Incluye, todo sin asteriscos</span>
                <ul className="mt-6 flex flex-col gap-4">
                  {pack.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-4 pb-4 border-b border-ink/10">
                      <Check className="w-5 h-5 mt-0.5 text-accent-500 flex-shrink-0" />
                      <span className="text-ink/85 leading-relaxed">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-20">
                <span className="eyebrow">Upgrades opcionales</span>
                <h3 className="mt-3 font-display text-display-sm tracking-tighter">
                  Añade lo que necesites.
                </h3>
                <p className="mt-4 text-ink/70 max-w-xl">
                  Márcalos y verás el precio total ajustarse en tiempo real. No te compromete nada:
                  puedes quitarlos o añadirlos cuando reserves.
                </p>
              </div>
            </Reveal>

            <div className="mt-8 flex flex-col gap-3">
              {pack.upgrades.map((u, i) => {
                const active = selectedUpgrades.includes(u.key);
                return (
                  <Reveal key={u.key} delay={i * 0.04}>
                    <button
                      type="button"
                      onClick={() => toggleUpgrade(u.key)}
                      className={`w-full text-left p-5 md:p-6 border transition-all ${
                        active
                          ? 'border-ink bg-ink text-cream'
                          : 'border-ink/15 hover:border-ink/40 bg-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-4 flex-wrap">
                            <span className="font-display text-xl md:text-2xl tracking-tighter">
                              {u.label}
                            </span>
                            <span className={`text-sm ${active ? 'text-cream/70' : 'text-ink/60'}`}>
                              +{formatEuros(u.price)}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm leading-relaxed ${active ? 'text-cream/70' : 'text-ink/60'}`}>
                            {u.description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                            active ? 'bg-accent-400 text-ink' : 'border border-ink/30'
                          }`}
                        >
                          {active && <Check className="w-4 h-4" />}
                        </span>
                      </div>
                    </button>
                  </Reveal>
                );
              })}
            </div>

            {pack.testimonial && (
              <Reveal delay={0.1}>
                <div className="mt-20 p-8 md:p-10 bg-ink text-cream">
                  <span className="eyebrow text-cream/50">Alguien que lo reservó</span>
                  <blockquote className="mt-6 font-display text-2xl md:text-3xl leading-[1.2] tracking-tight">
                    <span className="display-italic text-accent-300">“</span>
                    {pack.testimonial.quote}
                    <span className="display-italic text-accent-300">”</span>
                  </blockquote>
                  <div className="mt-6 text-cream/70">— {pack.testimonial.author}</div>
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 flex flex-col gap-6">
              <div className="bg-ink text-cream p-6 md:p-8">
                <div className="eyebrow text-cream/60">Tu configuración</div>
                <div className="mt-6 flex items-baseline justify-between gap-4 pb-5 border-b border-cream/15">
                  <span className="text-cream/70">Pack {pack.name}</span>
                  <span className="font-display text-xl">{formatEuros(pack.price)}</span>
                </div>
                {selectedUpgrades.length > 0 && (
                  <div className="pt-5 pb-5 border-b border-cream/15 flex flex-col gap-3">
                    {pack.upgrades
                      .filter((u) => selectedUpgrades.includes(u.key))
                      .map((u) => (
                        <div key={u.key} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-cream/70">+ {u.label}</span>
                          <span className="text-cream/80">{formatEuros(u.price)}</span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="mt-6">
                  <div className="eyebrow text-cream/60 text-[0.65rem]">Total, IVA no incluido</div>
                  <motion.div
                    key={total}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="mt-2 font-display text-5xl md:text-6xl tracking-tighter"
                  >
                    {formatEuros(total)}
                  </motion.div>
                </div>
                <div className="mt-6 pt-5 border-t border-cream/15 text-sm text-cream/70 flex items-baseline justify-between gap-4">
                  <span>Reserva con señal del 30%</span>
                  <span className="text-cream">{formatEuros(signal)}</span>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    to={`/brief?pack=${pack.slug}${upgradesQuery}&reserve=1`}
                    className="inline-flex items-center justify-between gap-3 px-6 py-4 rounded-full bg-accent-400 text-ink hover:bg-accent-300 transition-all group"
                  >
                    <span className="font-medium">Reservar este pack</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={`/brief?pack=${pack.slug}${upgradesQuery}`}
                    className="inline-flex items-center justify-between gap-3 px-6 py-4 rounded-full border border-cream/30 hover:border-cream text-cream transition text-sm"
                  >
                    <span>Adaptarlo a nuestro evento</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="mt-6 text-xs text-cream/50 leading-relaxed">
                  La reserva no es firme hasta que revisamos disponibilidad y detalles logísticos
                  (típicamente 24h). Si no podemos atender tu fecha, devolvemos la señal al 100%.
                </p>
              </div>

              <div className="p-6 md:p-8 bg-cream border border-ink/15">
                <span className="eyebrow">Cómo funciona</span>
                <ol className="mt-4 flex flex-col gap-3 text-sm text-ink/75">
                  <li className="flex gap-3">
                    <span className="font-display text-accent-500">01</span>
                    <span>Configuras y envías la reserva con tus datos y fecha.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-display text-accent-500">02</span>
                    <span>Verificamos disponibilidad en 24h y te confirmamos.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-display text-accent-500">03</span>
                    <span>Recibes link de pago seguro para la señal del 30%.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-display text-accent-500">04</span>
                    <span>Coordinamos detalles finales y el resto se liquida 15 días antes.</span>
                  </li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-24 md:pb-32 px-5 md:px-10 bg-cream">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <span className="eyebrow">Cómo se ve</span>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {pack.gallery.map((src, i) => {
              const col = i === 0 ? 'md:col-span-12' : 'md:col-span-6';
              const aspect = i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]';
              return (
                <Reveal key={i} delay={i * 0.05} className={col}>
                  <div className={`relative overflow-hidden bg-ink/10 ${aspect}`}>
                    <img
                      src={src}
                      alt={`${pack.name} — imagen ${i + 1}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-5 md:px-10 bg-cream text-ink border-t border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <Link
            to={`/packs/${next.slug}`}
            className="group flex items-center justify-between gap-8"
          >
            <div>
              <span className="eyebrow">Siguiente pack</span>
              <div className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter group-hover:text-accent-500 transition-colors">
                {next.name}
              </div>
              <div className="mt-2 text-ink/60">{next.typeLabel} · desde {formatEuros(next.price)}</div>
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0 rounded-full border border-ink/40 flex items-center justify-center group-hover:bg-ink group-hover:text-cream transition-all">
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </Link>
        </div>
      </section>
    </>
  );
};

export default PackDetailPage;
