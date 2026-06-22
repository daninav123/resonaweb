import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { Reveal } from '../components/motion/Reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

interface FAQ {
  q: string;
  a: string;
}

interface FAQGroup {
  title: string;
  items: FAQ[];
}

const FAQ_GROUPS: FAQGroup[] = [
  {
    title: 'Presupuesto y reserva',
    items: [
      {
        q: '¿Cuánto cuesta un evento con vosotros?',
        a: 'Una boda de 100 invitados con sonido, iluminación, DJ y banquete completo arranca sobre los 2.500€. Un evento corporativo depende mucho del formato: ronda los 1.500€ si es una presentación sencilla y puede subir a decenas de miles en producciones grandes. Te damos precio cerrado en 24h cuando nos pasas el brief.',
      },
      {
        q: '¿Hay que pagar algo para reservar la fecha?',
        a: 'Reservamos la fecha con una señal del 30% del presupuesto aceptado. El resto se abona el día del evento o al finalizar, como prefieras. Aceptamos transferencia y tarjeta.',
      },
      {
        q: '¿Hasta cuándo puedo cancelar sin penalización?',
        a: 'Hasta 60 días antes del evento la señal es reembolsable al 100%. Entre 60 y 30 días, 50%. Menos de 30 días, retenemos la señal. En casos de fuerza mayor siempre buscamos una solución flexible.',
      },
    ],
  },
  {
    title: 'Logística y montaje',
    items: [
      {
        q: '¿Viajáis fuera de Valencia?',
        a: 'Sí. Trabajamos habitualmente en toda la Comunidad Valenciana (Alicante, Castellón, Cuenca, Teruel). Para eventos fuera añadimos dietas de equipo y, si aplica, coste de transporte extra. Te lo detallamos en el presupuesto.',
      },
      {
        q: '¿A qué hora llegáis al montaje?',
        a: 'En bodas solemos llegar 5-6 horas antes de la ceremonia para montar, testear y dejar todo listo con margen. En corporativos grandes el montaje puede empezar la noche anterior. Nos coordinamos con la finca, catering y resto de proveedores.',
      },
      {
        q: '¿Recogéis el mismo día o al día siguiente?',
        a: 'Depende del evento y de lo que permita el lugar. Si la finca lo permite y el evento acaba tarde, recogemos a primera hora del día siguiente para no molestar. Siempre acordado de antemano.',
      },
    ],
  },
  {
    title: 'Técnica y equipos',
    items: [
      {
        q: '¿Los técnicos están durante todo el evento?',
        a: 'Sí. Todos nuestros eventos incluyen uno o varios técnicos presentes durante el evento completo. No dejamos un sistema sonando solo.',
      },
      {
        q: '¿Qué pasa si algo falla durante el evento?',
        a: 'Llevamos siempre backup completo (mesa, subs, cabezas) y el técnico puede cambiar cualquier componente crítico en menos de 5 minutos. Nunca hemos tenido un corte visible para el cliente.',
      },
      {
        q: '¿Podéis cumplir con limitaciones sonoras municipales?',
        a: 'Sí. Medimos dB en continuo y ajustamos con line array direccional si hace falta. En zonas residenciales estrictas trabajamos con sonorización multipunto y subs cardioides.',
      },
    ],
  },
  {
    title: 'Bodas',
    items: [
      {
        q: '¿Coordináis con el wedding planner?',
        a: 'Siempre. El WP es nuestro interlocutor principal en el día. Le pasamos cronograma, riders y necesidades técnicas por adelantado para que todo fluya.',
      },
      {
        q: '¿Traéis DJ o lo pone la pareja?',
        a: 'Podemos traer DJ residente de la casa (hemos trabajado con los mismos 4-5 DJs durante años, sabemos lo que hacen) o integrar uno de vuestra elección. En ambos casos, el sonido y la iluminación de pista los controlamos nosotros.',
      },
    ],
  },
];

const FAQsPage = () => (
  <>
    <SEOHead
      title="Preguntas frecuentes — ReSona Events"
      description="Resolvemos dudas sobre precios, reservas, logística y técnica de eventos y bodas producidos por ReSona Events en Valencia."
      canonicalUrl="https://resonaevents.com/faqs"
    />

    <section className="pt-32 md:pt-40 pb-16 px-5 md:px-10 bg-cream text-ink">
      <div className="max-w-[1400px] mx-auto">
        <Reveal>
          <span className="eyebrow">Preguntas frecuentes</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-4 font-display text-display-lg md:text-display-xl tracking-tighter text-balance max-w-[18ch]">
            Lo que todo el mundo <span className="display-italic text-accent-500">pregunta</span>.
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-ink/70 text-lg leading-relaxed">
            Si tu pregunta no está aquí, escríbenos. Contestamos en menos de 24 horas,
            sin plantillas ni letra pequeña.
          </p>
        </Reveal>
      </div>
    </section>

    <section className="pb-24 md:pb-32 px-5 md:px-10 bg-cream text-ink">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-20 md:gap-28">
        {FAQ_GROUPS.map((group) => (
          <FAQGroupBlock key={group.title} group={group} />
        ))}
      </div>
    </section>

    <section className="py-24 md:py-32 px-5 md:px-10 bg-ink text-cream">
      <div className="max-w-[1100px] mx-auto text-center flex flex-col items-center">
        <Reveal>
          <span className="eyebrow text-cream/60">¿Queda alguna duda?</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-display text-display-md md:text-display-lg tracking-tighter text-balance">
            Pregúntanos lo que <span className="display-italic text-accent-300">quieras</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/brief"
              className="inline-flex items-center justify-between gap-4 px-7 py-4 rounded-full bg-cream text-ink hover:bg-white transition-all group"
            >
              <span className="font-medium">Escríbenos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://wa.me/34613881414?text=Hola,%20tengo%20una%20pregunta"
              className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full border border-cream/30 hover:border-cream transition"
            >
              <span className="text-sm tracking-wide">WhatsApp · 613 88 14 14</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  </>
);

const FAQGroupBlock = ({ group }: { group: FAQGroup }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
    <div className="md:col-span-4">
      <Reveal>
        <h2 className="font-display text-display-sm tracking-tighter md:sticky md:top-28">
          {group.title}
        </h2>
      </Reveal>
    </div>
    <div className="md:col-span-8 flex flex-col divide-y divide-ink/10 border-y border-ink/10">
      {group.items.map((item, i) => (
        <FAQItem key={item.q} item={item} index={i} />
      ))}
    </div>
  </div>
);

const FAQItem = ({ item, index }: { item: FAQ; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: EASE }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full py-6 flex items-start justify-between gap-6 text-left group"
      >
        <span className="font-display text-xl md:text-2xl tracking-tight text-ink group-hover:text-accent-600 transition-colors">
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-1 flex-shrink-0 w-10 h-10 rounded-full border border-ink/30 flex items-center justify-center text-ink group-hover:bg-ink group-hover:text-cream group-hover:border-ink transition-colors"
        >
          <Plus className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-16 text-ink/75 leading-relaxed text-lg">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQsPage;
