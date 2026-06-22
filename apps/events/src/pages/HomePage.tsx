import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '../components/SEO/schemas';
import { Reveal } from '../components/motion/Reveal';
import Testimonials from '../components/Testimonials';
import { getFeaturedCases } from '../data/portfolio';
import { getFeaturedPacks, formatEuros } from '../data/packs';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2400&auto=format&fit=crop';

const EASE = [0.22, 1, 0.36, 1] as const;

const HomePage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.35, 0.7]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <>
      <SEOHead
        title="ReSona Events — Producción integral de bodas y eventos en Valencia"
        description="Bodas, eventos corporativos y privados llave en mano en Valencia. Sonido, iluminación, DJ y producción técnica. Te acompañamos del brief al día del evento."
        ogImage="https://resonaevents.com/og-image.png"
        canonicalUrl="https://resonaevents.com/"
        schema={[getLocalBusinessSchema(), getOrganizationSchema(), getWebSiteSchema()]}
      />

      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroImageY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src={HERO_IMAGE}
            alt="Boda íntima al atardecer iluminada por ReSona Events"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/80" aria-hidden />

        <motion.div style={{ y: heroTextY }} className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-28">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80"
            >
              Producción audiovisual · Valencia
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-lg md:text-display-xl text-cream text-balance"
            >
              Bodas que <span className="display-italic text-accent-300">suenan</span><br />
              como se <span className="display-italic text-accent-300">ven</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-8 max-w-xl text-cream/80 text-lg leading-relaxed"
            >
              Producimos el día que vas a recordar para siempre. Sonido, iluminación y
              montaje pensados para emocionar, no para caber en un catálogo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
              className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center"
            >
              <Link
                to="/brief"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-cream text-ink hover:bg-white transition-all group"
              >
                <span className="font-medium">Cuéntanos tu evento</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-5 py-4 text-cream/80 hover:text-cream transition"
              >
                <span className="text-sm tracking-wide">Ver trabajos recientes</span>
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 right-5 md:right-10 z-10 hidden md:flex items-center gap-3 text-cream/60 text-xs tracking-[0.2em] uppercase"
        >
          <span className="w-8 h-px bg-cream/40" />
          Scroll
        </motion.div>
      </section>

      <Manifesto />
      <DualFork />
      <PacksTeaser />
      <PortfolioTeaser />
      <Process />
      <Testimonials />
      <ClosingCTA />
    </>
  );
};

const Manifesto = () => (
  <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <Reveal>
            <span className="eyebrow">Manifiesto</span>
          </Reveal>
        </div>
        <div className="md:col-span-9">
          <Reveal delay={0.1}>
            <p className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-tighter text-balance">
              No montamos equipos, <span className="display-italic text-accent-500">montamos</span> atmósferas.
              Cada boda tiene su grano, cada empresa su acento. Nuestra obsesión es que el
              primer beso, el primer discurso y el último baile <span className="display-italic text-accent-500">suenen</span> exactamente como
              los imaginaste.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-12 flex flex-col sm:flex-row gap-8 sm:gap-14">
              <div>
                <div className="font-display text-5xl text-accent-500">+2.000</div>
                <div className="mt-1 text-sm text-ink/60">eventos producidos</div>
              </div>
              <div>
                <div className="font-display text-5xl text-accent-500">15</div>
                <div className="mt-1 text-sm text-ink/60">años en Valencia</div>
              </div>
              <div>
                <div className="font-display text-5xl text-accent-500">9,6</div>
                <div className="mt-1 text-sm text-ink/60">valoración media clientes</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

const DualFork = () => (
  <section className="pb-24 md:pb-32 px-5 md:px-10 bg-cream text-ink">
    <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <Reveal>
        <Link to="/bodas" className="group relative block overflow-hidden aspect-[4/5] md:aspect-[4/5] bg-ink/10">
          <img
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1800&auto=format&fit=crop"
            alt="Bodas"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-10 text-cream">
            <span className="eyebrow text-cream/70">Para parejas</span>
            <h3 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter">
              Bodas
            </h3>
            <p className="mt-4 max-w-md text-cream/80">
              Ceremonia, cóctel, banquete y disco con un único equipo que
              sabe exactamente cuándo subir y cuándo desaparecer.
            </p>
            <div className="mt-6 inline-flex items-center gap-2">
              <span className="text-sm tracking-wide">Ver más</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </Reveal>

      <Reveal delay={0.1}>
        <Link to="/eventos" className="group relative block overflow-hidden aspect-[4/5] md:aspect-[4/5] bg-ink/10">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop"
            alt="Eventos corporativos"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute left-6 right-6 bottom-6 md:left-10 md:right-10 md:bottom-10 text-cream">
            <span className="eyebrow text-cream/70">Para empresas y organizadores</span>
            <h3 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter">
              Eventos
            </h3>
            <p className="mt-4 max-w-md text-cream/80">
              Corporativos, privados, conciertos y festivales.
              De 80 a 8.000 asistentes con producción técnica integral.
            </p>
            <div className="mt-6 inline-flex items-center gap-2">
              <span className="text-sm tracking-wide">Ver más</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </Reveal>
    </div>
  </section>
);

const PacksTeaser = () => {
  const packs = getFeaturedPacks();
  return (
    <section className="pb-28 md:pb-40 px-5 md:px-10 bg-cream text-ink">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
          <div>
            <Reveal>
              <span className="eyebrow">Packs con precio cerrado</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter text-balance max-w-[20ch]">
                Sabes lo que <span className="display-italic text-accent-500">cuesta</span>. Resérvalo <span className="display-italic text-accent-500">online</span>.
              </h2>
            </Reveal>
          </div>
          <Link to="/packs" className="inline-flex items-center gap-2 group">
            <span className="text-sm tracking-wide">Ver todos los packs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {packs.map((pack, i) => (
            <Reveal key={pack.slug} delay={i * 0.08}>
              <Link to={`/packs/${pack.slug}`} className="group block h-full">
                <div className="relative overflow-hidden aspect-[4/5] bg-ink/10">
                  <img
                    src={pack.cover}
                    alt={pack.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute top-5 left-5 right-5 flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream/90 text-ink text-xs tracking-wide">
                      {pack.typeLabel}
                    </span>
                  </div>
                  <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7 text-cream">
                    <div className="flex items-baseline justify-between gap-3 mb-3">
                      <div className="font-display text-3xl md:text-4xl tracking-tighter">
                        {pack.name}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-cream/60">Desde</div>
                        <div className="font-display text-xl text-accent-300">
                          {formatEuros(pack.price)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-cream/80 italic font-display leading-snug">
                      {pack.tagline}
                    </p>
                    <div className="mt-4 pt-4 border-t border-cream/20 flex items-center justify-between">
                      <span className="text-xs text-cream/70">hasta {pack.maxGuests} invitados</span>
                      <div className="w-9 h-9 rounded-full border border-cream/40 flex items-center justify-center group-hover:bg-cream group-hover:text-ink group-hover:border-cream transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const PortfolioTeaser = () => {
  const teaser = getFeaturedCases().slice(0, 3);
  return (
    <section className="pb-28 md:pb-40 px-5 md:px-10 bg-cream text-ink">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
          <div>
            <Reveal>
              <span className="eyebrow">Trabajos recientes</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter text-balance">
                Un vistazo al <span className="display-italic text-accent-500">backstage</span>.
              </h2>
            </Reveal>
          </div>
          <Link to="/portfolio" className="inline-flex items-center gap-2 group">
            <span className="text-sm tracking-wide">Ver todos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
          {teaser.map((item, i) => (
            <Reveal
              key={item.slug}
              delay={i * 0.1}
              className={
                i === 0
                  ? 'md:col-span-7 md:row-span-2'
                  : 'md:col-span-5'
              }
            >
              <Link to={`/portfolio/${item.slug}`} className="group block">
                <div className="relative overflow-hidden bg-ink/10 aspect-[4/5] md:aspect-auto md:h-full">
                  <img
                    src={item.cover}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                    style={{ minHeight: i === 0 ? '600px' : '340px' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7 text-cream">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="eyebrow text-cream/70">{item.place}</div>
                        <div className="mt-2 font-display text-3xl md:text-4xl tracking-tighter">
                          {item.title}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-cream/40 flex items-center justify-center group-hover:bg-cream group-hover:text-ink group-hover:border-cream transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const PROCESS_STEPS = [
  {
    n: '01',
    label: 'Brief',
    desc: 'Nos cuentas fecha, lugar, número de invitados y qué tipo de evento imaginas. Un café, una llamada o un formulario corto — como prefieras.',
  },
  {
    n: '02',
    label: 'Propuesta',
    desc: 'En menos de 24 horas recibes una propuesta a medida, con desglose de servicios, referencias visuales y precio cerrado.',
  },
  {
    n: '03',
    label: 'Producción',
    desc: 'Nos coordinamos con tus proveedores (catering, wedding planner, agencia) y resolvemos licencias, permisos y logística. Tú no tocas un solo cable.',
  },
  {
    n: '04',
    label: 'Día del evento',
    desc: 'Llegamos al amanecer, montamos, hacemos pruebas y nos quedamos hasta el último invitado. Recogida incluida, por supuesto.',
  },
];

const Process = () => (
  <section className="py-28 md:py-40 px-5 md:px-10 bg-ink text-cream">
    <div className="max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14 md:mb-20">
        <div className="md:col-span-4">
          <Reveal>
            <span className="eyebrow text-cream/60">Cómo trabajamos</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-md tracking-tighter text-balance">
              Cuatro pasos,<br />
              <span className="display-italic text-accent-300">cero sorpresas</span>.
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-7 md:col-start-6 flex items-end">
          <Reveal delay={0.2}>
            <p className="text-lg text-cream/70 leading-relaxed max-w-xl">
              Un proceso limpio, pensado para que la distancia entre
              "tengo una idea" y "está sonando" sea lo más corta posible.
              Sin intermediarios, sin letra pequeña.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-cream/15">
        {PROCESS_STEPS.map((step, i) => (
          <Reveal
            key={step.n}
            delay={i * 0.08}
            className={`py-10 md:py-14 md:px-8 ${i > 0 ? 'md:border-l border-cream/15' : ''} ${i > 0 && i < PROCESS_STEPS.length ? 'border-t md:border-t-0 border-cream/15' : ''}`}
          >
            <div className="font-display text-6xl text-accent-400/80">{step.n}</div>
            <div className="mt-6 font-display text-2xl tracking-tighter">{step.label}</div>
            <p className="mt-4 text-cream/70 leading-relaxed">{step.desc}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const ClosingCTA = () => (
  <section className="relative bg-cream text-ink py-28 md:py-40 px-5 md:px-10 overflow-hidden border-t border-ink/10">
    <div className="relative max-w-[1200px] mx-auto text-center flex flex-col items-center">
      <span className="eyebrow">Tu evento empieza aquí</span>
      <Reveal delay={0.1}>
        <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
          Queremos conocer <span className="display-italic text-accent-500">tu historia</span>.
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-xl text-ink/70 text-lg leading-relaxed">
          Cuéntanos cómo imaginas el día. Un café, un WhatsApp o una llamada.
          Te respondemos en menos de 24 horas con una propuesta personalizada.
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
          <a
            href="https://wa.me/34613881414?text=Hola,%20me%20gustaría%20organizar%20un%20evento"
            className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
          >
            <span className="text-sm tracking-wide">WhatsApp · 613 88 14 14</span>
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

export default HomePage;
