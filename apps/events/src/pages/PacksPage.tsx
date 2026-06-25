import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Check } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import { PACKS, PackType, formatEuros } from '../data/packs';

const EASE = [0.22, 1, 0.36, 1] as const;

const FILTERS: { key: PackType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'boda', label: 'Bodas' },
  { key: 'corporativo', label: 'Corporativo' },
];

const PacksPage = () => {
  const [active, setActive] = useState<PackType | 'all'>('all');
  const filtered = useMemo(
    () => (active === 'all' ? PACKS : PACKS.filter((p) => p.type === active)),
    [active]
  );

  return (
    <>
      <SEOHead
        title="Packs de bodas y eventos en Valencia — ReSona Events"
        description="Packs de producción para bodas y eventos corporativos en Valencia con precio cerrado. Resérvalos online o adáptalos a tu evento."
        canonicalUrl="https://resonaevents.com/packs"
      />

      <section className="pt-32 md:pt-40 pb-16 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <span className="eyebrow">Packs cerrados</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 font-display text-display-lg md:text-display-xl tracking-tighter text-balance max-w-[16ch]">
              Precio <span className="display-italic text-accent-500">claro</span>.<br />
              Resérvalo <span className="display-italic text-accent-500">hoy</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-ink/70 text-lg leading-relaxed">
              Packs pensados para los escenarios más habituales. Cada uno con precio desde,
              contenido detallado y upgrades opcionales. Resérvalos tal cual o úsalos
              como punto de partida para adaptarlos a tu día.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="sticky top-16 md:top-20 z-30 bg-cream/90 backdrop-blur-md border-y border-ink/10">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="flex items-center gap-2 md:gap-6 py-4 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => {
              const isActive = active === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActive(f.key)}
                  className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm transition-colors ${
                    isActive ? 'text-cream' : 'text-ink/70 hover:text-ink'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="packs-filter-pill"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      className="absolute inset-0 bg-ink rounded-full"
                    />
                  )}
                  <span className="relative z-10">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-5 md:px-10 bg-cream">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((pack, i) => (
              <motion.article
                key={pack.slug}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: EASE, delay: (i % 6) * 0.05 }}
                className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-stretch"
              >
                <Link
                  to={`/packs/${pack.slug}`}
                  className="md:col-span-7 relative overflow-hidden aspect-[4/3] bg-ink/10"
                >
                  <img
                    src={pack.cover}
                    alt={pack.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <div className="absolute left-5 top-5 md:left-7 md:top-7">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/90 text-ink text-xs tracking-wide">
                      {pack.typeLabel}
                    </span>
                  </div>
                </Link>

                <div className="md:col-span-5 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-baseline justify-between gap-4 mb-4">
                      <h2 className="font-display text-display-sm md:text-display-md tracking-tighter">
                        {pack.name}
                      </h2>
                      <div className="text-right">
                        <div className="text-xs text-ink/50">Desde</div>
                        <div className="font-display text-2xl md:text-3xl text-accent-500">
                          {formatEuros(pack.price)}
                        </div>
                      </div>
                    </div>
                    <p className="font-display text-lg md:text-xl leading-[1.2] tracking-tight italic text-ink/90 mb-5">
                      {pack.tagline}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-ink/60 mb-5">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        hasta {pack.maxGuests} invitados
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1.5 text-sm text-ink/80">
                      {pack.includes.slice(0, 4).map((inc) => (
                        <li key={inc} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-0.5 text-accent-500 flex-shrink-0" />
                          <span className="line-clamp-1">{inc}</span>
                        </li>
                      ))}
                      <li className="text-ink/50 italic">
                        y {pack.includes.length - 4} más…
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/packs/${pack.slug}`}
                      className="inline-flex items-center justify-between gap-3 px-5 py-3 rounded-full bg-ink text-cream hover:bg-ink-800 transition-all group/cta flex-1"
                    >
                      <span className="text-sm font-medium">Ver detalle</span>
                      <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to={`/brief?pack=${pack.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-ink/30 hover:border-ink transition text-sm"
                    >
                      Adaptarlo
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-ink text-cream">
        <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow text-cream/60">¿Ninguno te encaja?</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
              Construye el tuyo <span className="display-italic text-accent-300">a medida</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-cream/70 text-lg leading-relaxed">
              Los packs son un buen punto de partida, pero cada evento es único.
              Cuéntanos lo que imaginas y te devolvemos propuesta en menos de 24h.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link
              to="/brief"
              className="mt-10 inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-cream text-ink hover:bg-white transition-all group"
            >
              <span className="font-medium">Empezar brief personalizado</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default PacksPage;
