import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import { PORTFOLIO, CaseType } from '../data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

const FILTERS: { key: CaseType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'boda', label: 'Bodas' },
  { key: 'corporativo', label: 'Corporativo' },
  { key: 'privado', label: 'Privado' },
  { key: 'concierto', label: 'Concierto' },
];

const PortfolioPage = () => {
  const [active, setActive] = useState<CaseType | 'all'>('all');

  const filtered = useMemo(
    () => (active === 'all' ? PORTFOLIO : PORTFOLIO.filter((c) => c.type === active)),
    [active]
  );

  return (
    <>
      <SEOHead
        title="Portfolio de bodas y eventos en Valencia — ReSona Events"
        description="Bodas, eventos corporativos, conciertos y eventos privados producidos por ReSona Events en Valencia y toda la Comunidad Valenciana."
        canonicalUrl="https://resonaevents.com/portfolio"
      />

      <section className="pt-32 md:pt-40 pb-16 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <span className="eyebrow">Portfolio</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 font-display text-display-lg md:text-display-xl tracking-tighter text-balance max-w-[14ch]">
              Los días que nos <span className="display-italic text-accent-500">recordarán</span>.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-ink/70 text-lg leading-relaxed">
              Una selección de los trabajos recientes. Cada caso es único,
              cada cliente nos trajo algo que aprender. Haz click para ver el detalle.
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
                      layoutId="filter-pill"
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
        <div className="max-w-[1600px] mx-auto">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => {
                const layout = layoutFor(i);
                return (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7, ease: EASE, delay: (i % 6) * 0.05 }}
                    className={layout.col}
                  >
                    <Link to={`/portfolio/${item.slug}`} className="group block">
                      <div className={`relative overflow-hidden bg-ink/10 ${layout.aspect}`}>
                        <img
                          src={item.cover}
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                        <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7 text-cream">
                          <div className="flex items-end justify-between gap-4">
                            <div className="min-w-0">
                              <div className="eyebrow text-cream/70">
                                {item.typeLabel} · {item.year}
                              </div>
                              <div className="mt-2 font-display text-2xl md:text-4xl tracking-tighter truncate">
                                {item.title}
                              </div>
                              <div className="mt-1 text-sm text-cream/70 truncate">
                                {item.place}
                              </div>
                            </div>
                            <div className="w-10 h-10 flex-shrink-0 rounded-full border border-cream/40 flex items-center justify-center group-hover:bg-cream group-hover:text-ink group-hover:border-cream transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-ink/60">
              Todavía no hay casos publicados en esta categoría.
            </div>
          )}
        </div>
      </section>
    </>
  );
};

function layoutFor(i: number) {
  const mod = i % 6;
  switch (mod) {
    case 0: return { col: 'md:col-span-7', aspect: 'aspect-[4/5] md:aspect-[5/6]' };
    case 1: return { col: 'md:col-span-5', aspect: 'aspect-[4/5] md:aspect-[4/5]' };
    case 2: return { col: 'md:col-span-4', aspect: 'aspect-[4/5]' };
    case 3: return { col: 'md:col-span-4', aspect: 'aspect-[4/5]' };
    case 4: return { col: 'md:col-span-4', aspect: 'aspect-[4/5]' };
    case 5: return { col: 'md:col-span-12', aspect: 'aspect-[16/9] md:aspect-[21/9]' };
    default: return { col: 'md:col-span-6', aspect: 'aspect-[4/5]' };
  }
}

export default PortfolioPage;
