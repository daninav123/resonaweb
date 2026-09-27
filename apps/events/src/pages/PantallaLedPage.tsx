import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLeadLink } from '@resona/ui';
import SEOHead from '../components/SEO/SEOHead';
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from '../components/SEO/schemas';
import { Reveal } from '../components/motion/Reveal';
import Photo from '../components/Photo';

const EASE = [0.22, 1, 0.36, 1] as const;
const PAGE_URL = 'https://resonaevents.com/pantalla-led-eventos-valencia';
const RENT_LED_URL = 'https://resonarent.com/servicios/alquiler-pantallas-led';

const USOS = [
  {
    label: 'Convenciones y congresos',
    desc: 'La presentación de quien habla, los vídeos de apertura y los logos de patrocinadores, a un tamaño que se lee desde la última fila.',
  },
  {
    label: 'Escenarios y conciertos',
    desc: 'Fondo de escenario con visuales o imagen del artista. La integramos con el sonido y la iluminación para que todo vaya a una.',
  },
  {
    label: 'Deporte en directo',
    desc: 'Partidos y finales para empresas, clubes, hostelería y ayuntamientos. Brillo de sobra para verlo a pleno sol.',
  },
  {
    label: 'Presentaciones y lanzamientos',
    desc: 'Producto, marca y vídeo en grande, en espacios que no están preparados para ello: naves, patios, showrooms.',
  },
];

const FORMATOS = [
  { size: '6 m²', dims: '3 × 2 m', desc: 'Salas, terrazas y eventos de empresa de formato medio.' },
  { size: '12 m²', dims: '3 × 4 m', desc: 'Salones grandes, plazas y presentaciones con mucho público.' },
  { size: '18 m²', dims: '6 × 3 m', desc: 'Fondos de escenario, conciertos y grandes aforos.' },
];

const INCLUYE = [
  'Transporte, montaje y desmontaje',
  'Colgada de truss o sobre estructura, según el espacio',
  'Técnico de vídeo durante todo el evento',
  'Vuestros vídeos, presentaciones y logos, lanzados en el momento que toca',
  'Prueba de contenidos antes de que entre el público',
  'Integración con el sonido y la iluminación si también los ponemos nosotros',
];

const PROCESO = [
  { n: '01', label: 'Nos cuentas el evento', desc: 'Fecha, espacio, público y qué quieres enseñar en pantalla. Con eso basta para empezar.' },
  { n: '02', label: 'Presupuesto en menos de 24 h', desc: 'Cerrado y desglosado: tamaño de pantalla, estructura, horas de técnico y desplazamiento.' },
  { n: '03', label: 'Montamos y operamos', desc: 'Llegamos con margen, probamos vuestros contenidos y nos quedamos hasta el final.' },
];

const FAQS = [
  {
    question: '¿Cuánto cuesta una pantalla LED para un evento?',
    answer:
      'Depende del tamaño, de cuántas horas tiene que estar el técnico, de cómo se monta (colgada o sobre estructura) y de dónde es el evento. Cuéntanos esos datos y te enviamos un presupuesto cerrado en menos de 24 horas.',
  },
  {
    question: '¿Qué contenido se puede poner en la pantalla?',
    answer:
      'Vídeos, presentaciones, imágenes y logos. Nos lo pasáis antes del evento y lo probamos en la pantalla para que se vea bien. Si alguien tiene que presentar desde su portátil, también lo conectamos.',
  },
  {
    question: '¿Sirve para interior y exterior?',
    answer:
      'Sí. Es una pantalla LED P3.9 con brillo suficiente para verse de día al aire libre, y funciona igual en un salón, una carpa o una nave.',
  },
  {
    question: '¿Qué diferencia hay con alquilarla en ReSona Rent?',
    answer:
      'En ReSona Rent alquilas la pantalla montada y tú te encargas de lo que se ve en ella. En ReSona Events viene con técnico durante todo el evento, que gestiona los contenidos y la coordina con el sonido y la iluminación.',
  },
  {
    question: '¿Con cuánta antelación hay que reservar?',
    answer:
      'Cuanto antes mejor: tenemos un número limitado de pantallas y las fechas de temporada alta se llenan. Si hay pantalla libre, podemos montar con pocos días de aviso.',
  },
  {
    question: '¿Emitís factura con IVA?',
    answer: 'Sí, todos los presupuestos y facturas se emiten con IVA y datos fiscales completos.',
  },
];

const PantallaLedPage = () => {
  const whatsapp = useLeadLink({
    app: 'events',
    section: 'pantalla-led',
    channel: 'whatsapp',
    phone: '34613881414',
    message: 'Hola, quería pedir presupuesto para una pantalla LED en un evento',
  });

  return (
    <>
      <SEOHead
        title="Pantalla LED para eventos en Valencia — con técnico y contenidos | ReSona Events"
        description="Pantalla LED P3.9 de 6, 12 y 18 m² para eventos en Valencia, con técnico durante todo el evento, gestión de contenidos y montaje. Convenciones, escenarios y deporte en directo. Presupuesto en 24 h."
        keywords="pantalla led eventos valencia, videoescenario valencia, pantalla led escenario, pantalla led congreso, produccion audiovisual eventos valencia"
        canonicalUrl={PAGE_URL}
        schema={[
          getServiceSchema({
            name: 'Pantalla LED para eventos en Valencia',
            description:
              'Pantalla LED para eventos con técnico, gestión de contenidos, estructura y montaje incluidos.',
            url: PAGE_URL,
          }),
          getFAQSchema(FAQS),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://resonaevents.com/' },
            { name: 'Servicios', url: 'https://resonaevents.com/servicios' },
            { name: 'Pantalla LED', url: PAGE_URL },
          ]),
        ]}
      />

      <section className="relative min-h-[88svh] w-full overflow-hidden bg-ink text-cream flex items-end">
        <div className="relative z-10 w-full px-5 md:px-10 pb-20 md:pb-28 pt-36">
          <div className="max-w-[1600px] mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
              className="eyebrow text-cream/70"
            >
              Pantalla LED · Valencia
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.1, ease: EASE }}
              className="mt-5 font-display text-display-md md:text-display-lg text-cream text-balance max-w-[18ch]"
            >
              Pantalla LED para eventos,{' '}
              <span className="display-italic text-accent-300">con alguien a los mandos</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
              className="mt-6 max-w-xl text-cream/85 text-lg leading-relaxed"
            >
              La montamos, la operamos y la desmontamos. Un técnico se queda todo el evento
              lanzando vuestros vídeos, presentaciones y logos, coordinado con el sonido y la luz.
            </motion.p>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.9, ease: EASE }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/70"
            >
              <li>6, 12 y 18 m² · P3.9</li>
              <li>Interior y exterior</li>
              <li>Presupuesto en menos de 24 h</li>
            </motion.ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.9, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/brief"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-cream-100 hover:bg-accent-400 transition-all group"
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
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
          <Reveal className="md:col-span-7">
            <Photo
              slug="pantalla-led-plaza"
              sizes="(min-width: 768px) 58vw, 100vw"
              reserveSpace
              className="w-full h-auto rounded-sm"
            />
          </Reveal>
          <div className="md:col-span-5">
            <Reveal>
              <span className="eyebrow">Montaje</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 font-display text-display-sm tracking-tighter text-balance">
                Donde haga falta, <span className="display-italic text-accent-500">bien sujeta</span>.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-ink/70 leading-relaxed">
                La colgamos de truss o la montamos sobre estructura, según el espacio. Nos ocupamos
                del cableado, la corriente y la señal, y dejamos el sonido montado alrededor si
                también lo llevamos nosotros.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-paper text-ink border-t border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <span className="eyebrow">Para qué</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-sm md:text-display-md tracking-tighter text-balance max-w-[18ch]">
              Eventos donde la pantalla <span className="display-italic text-accent-500">manda</span>.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {USOS.map((u, i) => (
              <Reveal key={u.label} delay={i * 0.06}>
                <div className="border-t border-ink/15 pt-6">
                  <h3 className="font-display text-2xl tracking-tight">{u.label}</h3>
                  <p className="mt-3 text-ink/70 leading-relaxed">{u.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-5 md:px-10 bg-paper text-ink border-t border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <Reveal>
            <span className="eyebrow">Formatos</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 font-display text-display-sm md:text-display-md tracking-tighter text-balance max-w-[20ch]">
              Tres tamaños, <span className="display-italic text-accent-500">misma nitidez</span>.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
            {FORMATOS.map((f, i) => (
              <Reveal key={f.size} delay={i * 0.08}>
                <div className="border-t border-ink/15 pt-6">
                  <span className="font-display text-display-sm tracking-tighter">{f.size}</span>
                  <p className="mt-1 font-mono text-sm text-accent-500">{f.dims} · P3.9</p>
                  <p className="mt-4 text-ink/70 leading-relaxed">{f.desc}</p>
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

          <Reveal delay={0.2}>
            <div className="mt-20 border-t border-ink/15 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-ink/70 leading-relaxed max-w-xl">
                ¿Solo necesitas la pantalla montada y tú te encargas de lo que sale en ella?
                Eso lo alquilamos en ReSona Rent.
              </p>
              <a
                href={RENT_LED_URL}
                className="inline-flex items-center gap-2 text-ink hover:text-accent-500 transition-colors group"
              >
                <span className="font-medium underline underline-offset-4 decoration-ink/30 group-hover:decoration-accent-500">
                  Ver alquiler de pantalla LED
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
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
                to="/brief"
                className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-accent text-cream-100 hover:bg-accent-400 transition-all group"
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

export default PantallaLedPage;
