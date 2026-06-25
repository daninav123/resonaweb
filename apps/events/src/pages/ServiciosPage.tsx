import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import { SERVICES, Service } from '../data/services';

const EASE = [0.22, 1, 0.36, 1] as const;

const ServiciosPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <>
      <SEOHead
        title="Producción técnica de eventos en Valencia — ReSona Events"
        description="Sonido, iluminación, DJ, vídeo, streaming y producción integral para bodas y eventos en Valencia. Un único equipo, cinco disciplinas."
        canonicalUrl="https://resonaevents.com/servicios"
      />

      <section ref={heroRef} className="relative min-h-[70svh] md:min-h-[80svh] w-full overflow-hidden bg-cream text-ink flex items-end">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 -top-[10%] -bottom-[10%] opacity-80"
          aria-hidden
        >
          <img
            src="https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2400&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/70 to-cream" aria-hidden />

        <div className="relative z-10 w-full px-5 md:px-10 pb-20 md:pb-32 pt-32">
          <div className="max-w-[1600px] mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
              className="eyebrow"
            >
              Servicios
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-lg md:text-display-xl tracking-tighter text-balance max-w-[16ch]"
            >
              Cinco disciplinas.<br />
              <span className="display-italic text-accent-500">Una sola intención</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.9, ease: EASE }}
              className="mt-8 max-w-xl text-ink/70 text-lg leading-relaxed"
            >
              Trabajamos como una productora, no como un catálogo.
              Cada servicio sirve a la historia del evento, nunca al revés.
            </motion.p>
          </div>
        </div>
      </section>

      <nav aria-label="Servicios" className="sticky top-16 md:top-20 z-30 bg-cream/90 backdrop-blur-md border-y border-ink/10">
        <div className="max-w-[1600px] mx-auto px-5 md:px-10">
          <div className="flex items-center gap-2 md:gap-6 py-4 overflow-x-auto scrollbar-hide">
            {SERVICES.map((s) => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm text-ink/70 hover:text-ink hover:bg-ink/5 transition"
              >
                <span className="text-ink/40 mr-2">{s.number}</span>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {SERVICES.map((service, i) => (
        <ServiceChapter key={service.slug} service={service} alt={i % 2 === 1} />
      ))}

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink border-t border-ink/10">
        <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow">Siguiente paso</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
              Combinamos lo que <span className="display-italic text-accent-500">necesita</span> tu evento.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-ink/70 text-lg leading-relaxed">
              Cuéntanos qué tienes en mente y te hacemos una propuesta con los servicios
              justos — ni uno más, ni uno menos.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/brief"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 transition-all group"
              >
                <span className="font-medium">Empezar brief</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
              >
                <span className="text-sm tracking-wide">Ver casos reales</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

const ServiceChapter = ({ service, alt }: { service: Service; alt: boolean }) => {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section
      id={service.slug}
      ref={ref}
      className="relative py-24 md:py-40 px-5 md:px-10 bg-cream text-ink border-t border-ink/10 scroll-mt-24"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center ${alt ? 'md:[&>*:first-child]:order-2' : ''}`}>
          <div className="md:col-span-7">
            <motion.div
              style={{ y: imgY }}
              className="relative overflow-hidden aspect-[4/5] md:aspect-[5/6] bg-ink/10"
            >
              <img
                src={service.image}
                alt={service.label}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </div>
          <div className="md:col-span-5">
            <Reveal>
              <div className="font-display text-7xl md:text-8xl leading-none text-accent-400/80">
                {service.number}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-6 font-display text-display-sm md:text-display-md tracking-tighter">
                {service.label}
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 font-display text-2xl md:text-3xl leading-[1.15] tracking-tight text-balance">
                <span className="display-italic text-accent-500">{service.tagline}</span>
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-6 text-lg leading-relaxed text-ink/80">
                {service.description}
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="mt-8">
                <div className="eyebrow mb-3">Incluye</div>
                <ul className="flex flex-col gap-2">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-3 text-ink/80">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-500 flex-shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiciosPage;
