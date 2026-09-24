import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import Photo from '../components/Photo';
import { type PhotoSlug } from '../data/photos';
import { useLeadLink } from '@resona/ui';
import { PORTFOLIO } from '../data/portfolio';

const EASE = [0.22, 1, 0.36, 1] as const;

// TODO(dani): faltan fotos reales de un corporativo y de un concierto; son las dos que
// siguen tirando de stock.
type Vertical = {
  key: string;
  label: string;
  desc: string;
  deliverables: string[];
  photo?: PhotoSlug;
  stock?: string;
};

const VERTICALS: Vertical[] = [
  {
    key: 'corporativo',
    label: 'Corporativo',
    desc: 'Convenciones, lanzamientos, galas, kick-offs. Producción que transmite lo que la marca quiere decir sin que la técnica se cuele en la foto.',
    stock: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
    deliverables: ['Escenario + line array', 'Streaming multicámara', 'Régie centralizada', 'Traducción simultánea'],
  },
  {
    key: 'privado',
    label: 'Eventos privados',
    desc: 'Cumpleaños, aniversarios, fiestas familiares de alto perfil. Discreción, elegancia y la música justa para cada momento.',
    photo: 'cabina-dj-letras',
    deliverables: ['Sonido multizona', 'Iluminación decorativa', 'DJ + técnico', 'Fuegos fríos sincronizados'],
  },
  {
    key: 'concierto',
    label: 'Conciertos y festivales',
    desc: 'Ayuntamientos, promotoras y marcas. Gran formato con capacidad para riders complejos y cambios de escenario ajustados.',
    stock: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1800&auto=format&fit=crop',
    deliverables: ['Line array gran formato', 'Iluminación espectáculo', 'Backline', 'Producción técnica'],
  },
];

const EventosPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.4, 0.75]);

  const corporateFeatured = PORTFOLIO.filter((c) => c.type !== 'boda').slice(0, 4);
  const whatsapp = useLeadLink({
    app: 'events',
    section: 'eventos',
    channel: 'whatsapp',
    phone: '34613881414',
    message: 'Hola, quería pedir presupuesto para un evento',
  });

  return (
    <>
      <SEOHead
        title="Eventos corporativos, privados y conciertos — ReSona Events"
        description="Producción audiovisual integral en Valencia para eventos corporativos, privados, conciertos y festivales. Sonido, iluminación, videoescenario y streaming."
        canonicalUrl="https://resonaevents.com/eventos"
      />

      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] -bottom-[10%] [&>picture]:block [&>picture]:h-full">
          <Photo
            slug="iluminacion-truss-azul"
            alt="Estructura de truss con cabezas móviles iluminando la pista durante un evento producido por ReSona Events"
            sizes="100vw"
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/90" aria-hidden />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-28">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80"
            >
              Eventos corporativos · Privados · Conciertos
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-md md:text-display-lg text-cream text-balance"
            >
              Producción técnica de
              <br />
              <span className="display-italic text-accent-300">eventos en Valencia</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-6 max-w-xl text-cream/85 text-lg leading-relaxed"
            >
              Sonido, iluminación, vídeo y montaje para eventos de empresa, celebraciones
              privadas y conciertos. En corporativo lo llevamos llave en mano: nos
              encargamos de todo.
            </motion.p>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.9, ease: EASE }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/70"
            >
              <li>Llave en mano en corporativo</li>
              <li>Valencia y Comunidad Valenciana</li>
              <li>Respuesta en menos de 24 h</li>
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/brief?tipo=corporativo"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-cream-100 hover:bg-accent-400 transition-all group"
              >
                <span className="font-medium">Solicitar propuesta</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                {...whatsapp}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-cream/40 text-cream hover:border-cream hover:bg-cream/10 transition"
              >
                <span className="text-sm tracking-wide">WhatsApp · 613 88 14 14</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-paper text-ink">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-14">
            <Reveal>
              <span className="eyebrow">Tipologías</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-display-md md:text-display-lg tracking-tighter text-balance max-w-[18ch]">
                Cada evento tiene su <span className="display-italic text-accent-500">idioma</span>.
              </h2>
            </Reveal>
          </div>

          <div className="flex flex-col gap-24 md:gap-40">
            {VERTICALS.map((v, i) => (
              <div
                key={v.key}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center ${
                  i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal className="md:col-span-7">
                  <div className="relative overflow-hidden aspect-[4/5] md:aspect-[4/3] bg-ink/10 [&>picture]:absolute [&>picture]:inset-0 [&>picture]:block [&>picture]:h-full">
                    {v.photo ? (
                      <Photo
                        slug={v.photo}
                        sizes="(min-width: 768px) 58vw, 100vw"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={v.stock} alt={v.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                </Reveal>
                <div className="md:col-span-5">
                  <Reveal>
                    <span className="eyebrow">0{i + 1}</span>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <h3 className="mt-4 font-display text-display-sm tracking-tighter">{v.label}</h3>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <p className="mt-6 text-lg leading-relaxed text-ink/80">{v.desc}</p>
                  </Reveal>
                  <Reveal delay={0.3}>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {v.deliverables.map((d) => (
                        <span key={d} className="px-3 py-1.5 rounded-full border border-ink/20 text-sm text-ink/70">
                          {d}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-ink text-cream">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
            <div>
              <Reveal>
                <span className="eyebrow text-cream/60">Casos recientes</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter text-balance">
                  Marcas y eventos que <span className="display-italic text-accent-300">confían</span>.
                </h2>
              </Reveal>
            </div>
            <Link to="/portfolio" className="inline-flex items-center gap-2 group text-cream">
              <span className="text-sm tracking-wide">Ver portfolio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {corporateFeatured.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.08}>
                <Link to={`/portfolio/${c.slug}`} className="group block">
                  <div className="relative overflow-hidden aspect-[4/3] bg-paper/5">
                    <img src={c.cover} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                    <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7">
                      <div className="eyebrow text-cream/70">{c.typeLabel} · {c.year}</div>
                      <div className="mt-2 font-display text-2xl md:text-4xl tracking-tighter">{c.title}</div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-paper text-ink">
        <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow">Briefing</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
              Cuéntanos tu <span className="display-italic text-accent-500">evento</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-ink/70 text-lg leading-relaxed">
              Trabajamos con agencias, marcas y organizadores. Un brief por email
              o una llamada de 15 minutos es suficiente para devolverte propuesta con precio.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/brief?tipo=corporativo"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-cream-100 hover:bg-accent-400 transition-all group"
              >
                <span className="font-medium">Empezar brief</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:info@resonaevents.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
              >
                <span className="text-sm tracking-wide">info@resonaevents.com</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default EventosPage;
