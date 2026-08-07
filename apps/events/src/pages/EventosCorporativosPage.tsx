import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLeadLink } from '@resona/ui';
import SEOHead from '../components/SEO/SEOHead';
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from '../components/SEO/schemas';
import { Reveal } from '../components/motion/Reveal';
import Photo from '../components/Photo';

const EASE = [0.22, 1, 0.36, 1] as const;

const FORMATOS = [
  { label: 'Convenciones y juntas', desc: 'Sonido para sala, micros de mesa e inalámbricos, proyección de soporte y técnico presente toda la jornada.' },
  { label: 'Kick-offs y presentaciones', desc: 'Escenario, pantalla y sonido dimensionados a la sala. Ensayo previo con quien va a hablar.' },
  { label: 'Lanzamientos y activaciones', desc: 'Iluminación de marca, vídeo y sonido para espacios no preparados: naves, patios, showrooms.' },
  { label: 'Galas y cenas de empresa', desc: 'Sonido para discursos y para baile, iluminación decorativa y DJ hasta el cierre.' },
];

const INCLUYE = [
  'Visita técnica al espacio antes de presupuestar',
  'Sonido, iluminación, vídeo y proyección',
  'Escenario, estructura y montaje',
  'Técnico dedicado durante todo el evento',
  'Desmontaje y retirada el mismo día o al siguiente',
  'Coordinación con el espacio y con el resto de proveedores',
];

const PROCESO = [
  { n: '01', label: 'Nos cuentas el evento', desc: 'Fecha, espacio, número de asistentes y qué tiene que pasar. Con eso basta para empezar.' },
  { n: '02', label: 'Propuesta en menos de 24 h', desc: 'Presupuesto cerrado y desglosado, con el material concreto que va a ir. Sin letra pequeña.' },
  { n: '03', label: 'Montamos y ejecutamos', desc: 'Llegamos con margen, probamos con vosotros y nos quedamos hasta que termina.' },
];

const FAQS = [
  {
    question: '¿Trabajáis llave en mano en eventos de empresa?',
    answer:
      'Sí. En eventos corporativos nos encargamos de la producción técnica completa: sonido, iluminación, vídeo, escenario y montaje, además de coordinar con el espacio y con el resto de proveedores. Solo tenéis un interlocutor.',
  },
  {
    question: '¿Emitís factura con IVA?',
    answer: 'Sí, todos los presupuestos y facturas se emiten con IVA y datos fiscales completos, listos para contabilizar.',
  },
  {
    question: '¿Cubrís fuera de Valencia?',
    answer:
      'Trabajamos en Valencia y la Comunidad Valenciana de forma habitual. Para eventos de mayor volumen nos desplazamos a otras provincias; se valora en el presupuesto.',
  },
  {
    question: '¿Con cuánta antelación hay que reservar?',
    answer:
      'Cuanto antes mejor, sobre todo entre octubre y diciembre, que es temporada alta de eventos de empresa. Dicho esto, si tenemos equipo y agenda libres podemos montar con pocos días de aviso.',
  },
  {
    question: '¿Qué pasa si el espacio tiene limitación de sonido?',
    answer:
      'Se resuelve en la visita técnica: dimensionamos el equipo al límite permitido y planteamos alternativas (más puntos de sonido a menos volumen) para que se oiga bien sin superarlo.',
  },
];

const EventosCorporativosPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroOverlay = useTransform(scrollYProgress, [0, 1], [0.45, 0.78]);

  const whatsapp = useLeadLink({
    app: 'events',
    section: 'corporativos',
    channel: 'whatsapp',
    phone: '34613881414',
    message: 'Hola, quería pedir presupuesto para un evento de empresa',
  });

  return (
    <>
      <SEOHead
        title="Eventos corporativos en Valencia — producción llave en mano | ReSona Events"
        description="Producción técnica llave en mano para eventos de empresa en Valencia: convenciones, kick-offs, lanzamientos y galas. Sonido, iluminación, vídeo y montaje con un único interlocutor. Propuesta en 24 h."
        keywords="eventos corporativos valencia, organizacion eventos empresa valencia, productora eventos valencia, convenciones valencia"
        canonicalUrl="https://resonaevents.com/eventos-corporativos-valencia"
        schema={[
          getServiceSchema({
            name: 'Producción de eventos corporativos en Valencia',
            description:
              'Producción técnica llave en mano para eventos de empresa: sonido, iluminación, vídeo, escenario y montaje.',
            url: 'https://resonaevents.com/eventos-corporativos-valencia',
          }),
          getFAQSchema(FAQS),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://resonaevents.com/' },
            { name: 'Eventos', url: 'https://resonaevents.com/eventos' },
            { name: 'Eventos corporativos', url: 'https://resonaevents.com/eventos-corporativos-valencia' },
          ]),
        ]}
      />

      <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-ink text-cream">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 -top-[10%] -bottom-[10%] [&>picture]:block [&>picture]:h-full"
        >
          <Photo
            slug="dj-directo"
            alt="Técnico de ReSona Events operando el equipo durante un evento en Valencia"
            sizes="100vw"
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div className="absolute inset-0 bg-ink" style={{ opacity: heroOverlay }} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink/90" aria-hidden />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 md:px-10 pb-20 md:pb-28">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/80"
            >
              Eventos de empresa · Valencia
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-md md:text-display-lg text-cream text-balance"
            >
              Eventos corporativos en Valencia,
              <br />
              <span className="display-italic text-accent-300">llave en mano</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-6 max-w-xl text-cream/85 text-lg leading-relaxed"
            >
              Convenciones, kick-offs, lanzamientos y galas. Nos ocupamos de sonido,
              iluminación, vídeo, escenario y montaje, y coordinamos con el espacio.
              Vosotros tratáis con una sola persona.
            </motion.p>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.9, ease: EASE }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/70"
            >
              <li>Propuesta en menos de 24 h</li>
              <li>Visita técnica antes de presupuestar</li>
              <li>Factura con IVA</li>
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/brief?tipo=corporativo"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-ink hover:bg-accent-400 transition-all group"
              >
                <span className="font-medium">Pedir presupuesto</span>
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

      <section className="py-24 md:py-32 px-5 md:px-10 bg-paper text-ink">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <span className="eyebrow">Formatos</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-sm md:text-display-md tracking-tighter text-balance max-w-[18ch]">
              Qué tipo de evento <span className="display-italic text-accent-500">montamos</span>.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {FORMATOS.map((f, i) => (
              <Reveal key={f.label} delay={i * 0.06}>
                <div className="border-t border-ink/15 pt-6">
                  <h3 className="font-display text-2xl tracking-tight">{f.label}</h3>
                  <p className="mt-3 text-ink/70 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-ink text-cream">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <span className="eyebrow text-cream/60">Qué incluye</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-display-sm md:text-display-md tracking-tighter text-balance">
                Todo esto va <span className="display-italic text-accent-300">dentro</span>.
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <ul className="flex flex-col">
              {INCLUYE.map((item, i) => (
                <Reveal key={item} delay={i * 0.05} as="li">
                  <div className="flex items-baseline gap-5 border-b border-cream/15 py-5">
                    <span className="font-mono text-xs text-accent-300">0{i + 1}</span>
                    <span className="text-lg text-cream/90">{item}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-paper text-ink">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <span className="eyebrow">Cómo funciona</span>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
            {PROCESO.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08}>
                <div>
                  <span className="font-mono text-sm text-accent-500">{p.n}</span>
                  <h3 className="mt-3 font-display text-2xl tracking-tight">{p.label}</h3>
                  <p className="mt-3 text-ink/70 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-paper text-ink border-t border-ink/10">
        <div className="max-w-[900px] mx-auto">
          <Reveal>
            <span className="eyebrow">Preguntas frecuentes</span>
          </Reveal>
          <div className="mt-10 flex flex-col">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.05}>
                <div className="border-b border-ink/15 py-7">
                  <h3 className="font-display text-xl md:text-2xl tracking-tight">{faq.question}</h3>
                  <p className="mt-3 text-ink/70 leading-relaxed">{faq.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-ink text-cream">
        <div className="max-w-[900px] mx-auto text-center flex flex-col items-center">
          <Reveal>
            <span className="eyebrow text-cream/60">Siguiente paso</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-display-sm md:text-display-md tracking-tighter text-balance">
              Cuéntanos el evento y te
              <span className="display-italic text-accent-300"> presupuestamos en 24 h</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                to="/brief?tipo=corporativo"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-ink hover:bg-accent-400 transition-all group"
              >
                <span className="font-medium">Pedir presupuesto</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                {...whatsapp}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-cream/40 text-cream hover:border-cream hover:bg-cream/10 transition"
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

export default EventosCorporativosPage;
