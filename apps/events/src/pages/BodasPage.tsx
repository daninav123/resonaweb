import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';
import Testimonials from '../components/Testimonials';
import { getCasesByType } from '../data/portfolio';
import { getPacksByType, formatEuros } from '../data/packs';

const EASE = [0.22, 1, 0.36, 1] as const;

const HERO = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2400&auto=format&fit=crop';

const MOMENTS = [
  {
    key: 'ceremonia',
    label: 'Ceremonia',
    desc: 'Micros inalámbricos discretos para los votos, sonido ambiente para los invitados y la música que elegisteis sin cortes ni acoples.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop',
  },
  {
    key: 'coctel',
    label: 'Cóctel',
    desc: 'Sonido distribuido por zonas para que la música acompañe sin tapar las conversaciones. Iluminación cálida para el atardecer.',
    image: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
  },
  {
    key: 'banquete',
    label: 'Banquete',
    desc: 'Discursos nítidos, primer baile impecable y transiciones invisibles entre DJ y banda en vivo si la hay.',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1800&auto=format&fit=crop',
  },
  {
    key: 'disco',
    label: 'Disco',
    desc: 'Energía controlada hasta la última hora. Graves sin molestar a vecinos, pista iluminada para moverse, barra iluminada para respirar.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
  },
];

const BodasPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.35, 0.7]);

  const bodas = getCasesByType('boda');

  return (
    <>
      <SEOHead
        title="Bodas en Valencia — ReSona Events"
        description="Sonido, iluminación y producción técnica para bodas en Valencia y la Comunidad Valenciana. Ceremonia, cóctel, banquete y disco con un solo equipo."
        canonicalUrl="https://resonaevents.com/bodas"
      />

      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src={HERO}
            alt="Boda iluminada al atardecer por ReSona Events"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/85" aria-hidden />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-28">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80"
            >
              Bodas · Valencia
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-lg md:text-display-xl text-cream text-balance"
            >
              El día más <span className="display-italic text-accent-300">vuestro</span>,<br />
              sonando como lo <span className="display-italic text-accent-300">imaginasteis</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-8 max-w-xl text-cream/80 text-lg leading-relaxed"
            >
              Un único equipo que os acompaña desde el primer "sí" hasta el último baile.
              Ceremonia, cóctel, banquete y disco con transiciones invisibles.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
              className="mt-10"
            >
              <Link
                to="/brief?tipo=boda"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-cream text-ink hover:bg-white transition-all group"
              >
                <span className="font-medium">Pedir propuesta para nuestra boda</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <Reveal>
              <span className="eyebrow">Filosofía</span>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal delay={0.1}>
              <p className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-tighter text-balance">
                Creemos que en una boda <span className="display-italic text-accent-500">la técnica
                no se ve</span>. Se siente. Nadie debería recordar los altavoces,
                sólo cómo sonó el <span className="display-italic text-accent-500">"sí quiero"</span>.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-28 md:pb-40 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-14">
            <Reveal>
              <span className="eyebrow">Los cuatro momentos</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-display-md md:text-display-lg tracking-tighter text-balance max-w-[14ch]">
                Una boda son <span className="display-italic text-accent-500">cuatro películas</span> seguidas.
              </h2>
            </Reveal>
          </div>

          <div className="flex flex-col gap-24 md:gap-40">
            {MOMENTS.map((m, i) => (
              <div
                key={m.key}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center ${
                  i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                <Reveal className="md:col-span-7">
                  <div className="relative overflow-hidden aspect-[4/5] md:aspect-[4/3] bg-ink/10">
                    <img src={m.image} alt={m.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </Reveal>
                <div className="md:col-span-5">
                  <Reveal>
                    <span className="eyebrow">0{i + 1} · {m.label}</span>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <h3 className="mt-4 font-display text-display-sm tracking-tighter">{m.label}</h3>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <p className="mt-6 text-lg leading-relaxed text-ink/80">{m.desc}</p>
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
                <span className="eyebrow text-cream/60">Bodas recientes</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter text-balance">
                  Algunas parejas que ya <span className="display-italic text-accent-300">lo vivieron</span>.
                </h2>
              </Reveal>
            </div>
            <Link to="/portfolio" className="inline-flex items-center gap-2 group text-cream">
              <span className="text-sm tracking-wide">Portfolio completo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {bodas.slice(0, 3).map((c, i) => (
              <Reveal
                key={c.slug}
                delay={i * 0.08}
                className={i === 0 ? 'md:col-span-6 md:row-span-2' : 'md:col-span-6'}
              >
                <Link to={`/portfolio/${c.slug}`} className="group block">
                  <div className={`relative overflow-hidden bg-cream/5 ${i === 0 ? 'aspect-[4/5] md:aspect-[4/5]' : 'aspect-[4/3]'}`}>
                    <img src={c.cover} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                    <div className="absolute left-5 right-5 bottom-5 md:left-7 md:right-7 md:bottom-7">
                      <div className="eyebrow text-cream/70">{c.place}</div>
                      <div className="mt-2 font-display text-2xl md:text-4xl tracking-tighter">{c.title}</div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink border-t border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-10 md:mb-14">
            <div>
              <Reveal>
                <span className="eyebrow">Packs con precio cerrado</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="mt-3 font-display text-display-sm md:text-display-md tracking-tighter text-balance max-w-[20ch]">
                  Elegid uno, o <span className="display-italic text-accent-500">adaptadlo</span>.
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 max-w-xl text-ink/70 leading-relaxed">
                  Tres packs pensados para los escenarios más habituales de boda.
                  Precio claro, contenido detallado, upgrades opcionales. Reservables online.
                </p>
              </Reveal>
            </div>
            <Link to="/packs" className="inline-flex items-center gap-2 group">
              <span className="text-sm tracking-wide">Ver todos los packs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {getPacksByType('boda').map((pack, i) => (
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

      <Testimonials
        filter="boda"
        eyebrow="Lo que cuentan las parejas"
        title={
          <>
            Un día que se <span className="display-italic text-accent-300">recuerda</span> en voz alta.
          </>
        }
      />

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow">Siguiente paso</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
              Cuéntanos cómo imagináis <span className="display-italic text-accent-500">vuestro día</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-ink/70 text-lg leading-relaxed">
              Un brief corto (fecha, lugar aproximado, número de invitados) es suficiente
              para que os devolvamos una propuesta personalizada en menos de 24 horas.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/brief?tipo=boda"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-ink text-cream hover:bg-ink-800 transition-all group"
              >
                <span className="font-medium">Empezar brief</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/34613881414?text=Hola,%20nos%20casamos%20y%20quer%C3%ADamos%20pedir%20propuesta"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-ink/30 hover:border-ink transition"
              >
                <span className="text-sm tracking-wide">WhatsApp · 613 88 14 14</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default BodasPage;
