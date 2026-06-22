import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import { getCaseBySlug, PORTFOLIO } from '../data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

const PortfolioCasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getCaseBySlug(slug) : undefined;

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.4, 0.75]);

  if (!item) return <Navigate to="/portfolio" replace />;

  const currentIdx = PORTFOLIO.findIndex((c) => c.slug === item.slug);
  const next = PORTFOLIO[(currentIdx + 1) % PORTFOLIO.length];

  return (
    <>
      <SEOHead
        title={`${item.title} — ${item.typeLabel} · ReSona Events`}
        description={`${item.typeLabel} en ${item.place} producida por ReSona Events. ${item.approach.slice(0, 120)}`}
        canonicalUrl={`https://resonaevents.com/portfolio/${item.slug}`}
        ogImage={item.cover}
      />

      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src={item.heroLandscape}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/90" aria-hidden />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-28">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: EASE }}
            >
              <Link to="/portfolio" className="inline-flex items-center gap-2 text-cream/80 hover:text-cream text-sm tracking-wide">
                <ArrowLeft className="w-4 h-4" />
                Portfolio
              </Link>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80 block mt-8"
            >
              {item.typeLabel} · {item.year}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.1, ease: EASE }}
              className="mt-4 font-display text-display-lg md:text-display-xl text-cream tracking-tighter text-balance"
            >
              {item.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-6 text-cream/80 text-lg"
            >
              {item.place}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <Reveal>
              <span className="eyebrow">Ficha</span>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-6 flex flex-col gap-5 text-ink">
                <div>
                  <dt className="text-sm text-ink/60">Tipología</dt>
                  <dd className="mt-1 font-display text-2xl tracking-tighter">{item.typeLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/60">Localización</dt>
                  <dd className="mt-1 font-display text-2xl tracking-tighter">{item.place}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/60">Asistentes</dt>
                  <dd className="mt-1 font-display text-2xl tracking-tighter">{item.guests.toLocaleString('es-ES')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink/60">Año</dt>
                  <dd className="mt-1 font-display text-2xl tracking-tighter">{item.year}</dd>
                </div>
              </dl>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10">
                <div className="text-sm text-ink/60 mb-3">Servicios</div>
                <div className="flex flex-wrap gap-2">
                  {item.services.map((s) => (
                    <span key={s} className="px-3 py-1.5 rounded-full border border-ink/20 text-sm text-ink/80">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-8 flex flex-col gap-12">
            <Reveal>
              <div>
                <span className="eyebrow">El reto</span>
                <p className="mt-5 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] tracking-tighter text-balance">
                  {item.challenge}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <span className="eyebrow">Nuestra respuesta</span>
                <p className="mt-5 text-lg leading-relaxed text-ink/80 max-w-2xl">
                  {item.approach}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32 px-5 md:px-10 bg-cream">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {item.gallery.map((src, i) => {
            const aspect = i % 4 === 0 ? 'aspect-[16/10]' : i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]';
            const col = i % 4 === 0 ? 'md:col-span-12' : 'md:col-span-6';
            return (
              <Reveal key={i} delay={i * 0.05} className={col}>
                <div className={`relative overflow-hidden bg-ink/10 ${aspect}`}>
                  <img
                    src={src}
                    alt={`${item.title} — imagen ${i + 1}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {item.testimonial && (
        <section className="py-24 md:py-32 px-5 md:px-10 bg-ink text-cream">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <span className="eyebrow text-cream/50">Testimonio</span>
            </Reveal>
            <Reveal delay={0.1}>
              <blockquote className="mt-8 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.1] tracking-tighter text-balance">
                <span className="display-italic text-accent-300">“</span>
                {item.testimonial.quote}
                <span className="display-italic text-accent-300">”</span>
              </blockquote>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 text-cream/70">— {item.testimonial.author}</div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 px-5 md:px-10 bg-cream text-ink border-t border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <Link
            to={`/portfolio/${next.slug}`}
            className="group flex items-center justify-between gap-8"
          >
            <div>
              <span className="eyebrow">Siguiente caso</span>
              <div className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter group-hover:text-accent-500 transition-colors">
                {next.title}
              </div>
              <div className="mt-2 text-ink/60">{next.place}</div>
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

export default PortfolioCasePage;
