import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const PRINCIPLES = [
  {
    label: 'La técnica es invisible',
    body: 'Si alguien recuerda nuestros altavoces, hemos fallado. La técnica es el bastidor detrás del cuadro.',
  },
  {
    label: 'Un único interlocutor',
    body: 'No repartimos responsabilidades entre proveedores. Quien te hace el brief te monta el evento y está en el móvil el día D.',
  },
  {
    label: 'Backup en todo',
    body: 'Duplicamos componentes críticos. Si algo falla, lo cambiamos antes de que se note. En 15 años nunca hemos tenido un corte visible.',
  },
  {
    label: 'Honestos con el presupuesto',
    body: 'Te diremos que un servicio es innecesario si lo es. Preferimos un evento más pequeño bien producido que uno grande mal cubierto.',
  },
];

const EstudioPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.4, 0.75]);

  return (
    <>
      <SEOHead
        title="Estudio de producción de eventos en Valencia — ReSona"
        description="Quince años produciendo eventos en Valencia. Un estudio obsesionado con que la técnica sirva a la emoción, no al revés."
        canonicalUrl="https://resonaevents.com/estudio"
      />

      <section ref={heroRef} className="relative h-[85svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div style={{ y: heroY }} className="absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2400&auto=format&fit=crop"
            alt="Equipo de ReSona Events montando un evento"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
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
              El estudio
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-lg md:text-display-xl text-cream text-balance max-w-[16ch]"
            >
              Quince años convirtiendo<br />
              brief en <span className="display-italic text-accent-300">memoria</span>.
            </motion.h1>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <span className="eyebrow">Quiénes somos</span>
            </Reveal>
          </div>
          <div className="md:col-span-8 flex flex-col gap-8">
            <Reveal delay={0.1}>
              <p className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] tracking-tighter text-balance">
                Somos un <span className="display-italic text-accent-500">estudio de producción audiovisual</span>
                con base en Valencia. Pequeño por diseño, grande por experiencia.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg leading-relaxed text-ink/80 max-w-2xl">
                Arrancamos en 2011 sonorizando bodas en masías de la huerta. Hoy
                producimos desde ceremonias íntimas de 60 invitados hasta conciertos
                municipales de 8.000. La escala ha cambiado. La obsesión, no: cada
                evento es el único que importa el día que sucede.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-lg leading-relaxed text-ink/80 max-w-2xl">
                Trabajamos como productora, no como alquiler. Nos metemos en la historia
                que se cuenta y decidimos qué técnica sirve para contarla mejor.
                Si no sirve, la quitamos.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <span className="eyebrow">Principios</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-md tracking-tighter text-balance max-w-[18ch]">
              En qué <span className="display-italic text-accent-500">creemos</span>.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-ink/15">
            {PRINCIPLES.map((p, i) => (
              <Reveal
                key={p.label}
                delay={i * 0.08}
                className={`py-10 md:py-14 md:px-10 ${i % 2 === 1 ? 'md:border-l border-ink/15' : ''} ${i >= 2 ? 'md:border-t' : ''} border-b border-ink/15`}
              >
                <div className="font-display text-2xl tracking-tighter">{p.label}</div>
                <p className="mt-4 text-ink/70 leading-relaxed">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          <Reveal>
            <div>
              <div className="font-display text-6xl md:text-7xl text-accent-300">+2.000</div>
              <div className="mt-3 text-cream/70">eventos producidos desde 2011</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <div className="font-display text-6xl md:text-7xl text-accent-300">15</div>
              <div className="mt-3 text-cream/70">años en el oficio, siempre en Valencia</div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div>
              <div className="font-display text-6xl md:text-7xl text-accent-300">9,6</div>
              <div className="mt-3 text-cream/70">valoración media de las parejas y marcas con las que trabajamos</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-28 md:py-40 px-5 md:px-10 bg-cream text-ink">
        <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow">Trabajar juntos</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
              ¿Vamos a <span className="display-italic text-accent-500">contarlo</span>?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-ink/70 text-lg leading-relaxed">
              Si has llegado hasta aquí, probablemente tengamos una conversación pendiente.
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
                <span className="text-sm tracking-wide">Ver trabajos recientes</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default EstudioPage;
