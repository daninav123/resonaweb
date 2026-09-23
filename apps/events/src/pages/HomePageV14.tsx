import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { trackLead } from '@resona/utils';
import SEOHead from '../components/SEO/SEOHead';
import { getLocalBusinessSchema, getOrganizationSchema, getWebSiteSchema } from '../components/SEO/schemas';
import { getFeaturedPacks, formatEuros } from '../data/packs';
import { Logo } from '@resona/ui';

/**
 * Home de resonaevents.com. Hero partido (Bodas | Empresa) que se expande al
 * pasar el ratón o tocar, y el resto de la página en voz editorial sobre la
 * paleta corporativa (#3D5AFE). Se monta dentro de Layout: cabecera, footer,
 * cookies y WhatsApp flotante vienen de allí.
 */

const INK = '#0e0d0c';
const CREAM = '#f6f1e7';
// Papel de los bloques claros: mismo tono corporativo desaturado al máximo.
const PAPER = '#f6f2ed';
const BRAND = '#3D5AFE';
const BRAND_LIGHT = '#5D75FE';
const BRAND_DEEP = '#1134FE';
const WA_NUMBER = '34613881414';
const CONTACT_EMAIL = 'info@resonaevents.com';
const EASE = [0.22, 1, 0.36, 1] as const;

type Side = 'bodas' | 'empresa';

const REEL_VIDEO = '/images/resona-events-reel-boda-valencia.mp4';
const HERO_LOOP = '/images/boda-hero-loop.mp4';
const REEL_POSTER = '/images/resona-events-dj-cabina-directo.jpg';

// Fotos propias. Los packs destacados se pisan aquí en vez de en packs.ts
// porque el resto de la web sigue con las imágenes de stock.
const PACK_IMG: Record<string, string> = {
  'boda-esencial': '/images/resona-events-banquete-huerto-montesinos.jpg',
  'boda-completo': '/images/resona-events-cabina-dj-letras-luminosas.jpg',
  'boda-premium': '/images/resona-events-iluminacion-pista-azul.jpg',
};

const SIDES: Record<Side, {
  label: string; kicker: string; title: string[]; line: string;
  to: string; img: string; video?: string; wash: string; accent: string; wa: string; stat: string;
}> = {
  bodas: {
    label: 'Bodas',
    kicker: 'Para quien se casa',
    title: ['Vuestra', 'boda'],
    line: 'Sonido, luz y producción que convierten un sitio bonito en la noche que nadie olvida.',
    stat: '+2.000 eventos producidos',
    to: '/bodas',
    img: '/images/resona-events-boda-pista-luces-valencia.jpg',
    video: HERO_LOOP,
    wash: 'linear-gradient(200deg, rgba(61,90,254,0.42), rgba(14,13,12,0.88))',
    accent: BRAND_LIGHT,
    wa: 'Hola Resona, nos casamos y queremos una boda diferente. ¿Hablamos?',
  },
  empresa: {
    label: 'Empresa',
    kicker: 'Para marcas y organizadores',
    title: ['Tu', 'evento'],
    line: 'Producción audiovisual integral para que tu marca brille en el escenario y en directo.',
    stat: '15 años · 9,6 de valoración',
    to: '/eventos',
    img: '/images/resona-events-luces-guirnalda-noche.jpg',
    wash: 'linear-gradient(200deg, rgba(17,52,254,0.55), rgba(14,13,12,0.9))',
    accent: '#7B8FFE',
    wa: 'Hola Resona, organizamos un evento de empresa. ¿Hablamos?',
  },
};

// La tipografia de marca (Montserrat) ya viene del index.html; las dos clases
// se mantienen porque el marcado de esta pagina las usa por todas partes.
const useFonts = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .v14{font-family:'Montserrat',ui-sans-serif,system-ui,sans-serif;}
      .v14-serif{font-family:'Montserrat',ui-sans-serif,system-ui,sans-serif;font-weight:700;letter-spacing:-0.015em;}
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);
};

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return mobile;
};

const Reveal = ({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div className={className}
    initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE, delay }}>
    {children}
  </motion.div>
);

const Kicker = ({ children, color }: { children: ReactNode; color: string }) => (
  <span className="v14 inline-block text-[0.72rem] font-bold uppercase tracking-[0.3em]" style={{ color }}>{children}</span>
);

/* ---------- Hero partido ---------- */

const Panel = ({ side, active, setActive }: { side: Side; active: Side | null; setActive: (s: Side | null) => void }) => {
  const c = SIDES[side];
  const isActive = active === side;
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  // En móvil no hay hover: cada lado es un hero apilado con el contenido siempre
  // visible. En escritorio, el lado activo se expande y el otro se atenúa.
  const open = isMobile || isActive;
  const isDim = !isMobile && active !== null && !isActive;
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${c.label}: ${c.kicker}`}
      className="relative overflow-hidden cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-cream/70 min-h-[70svh] md:min-h-0"
      onMouseEnter={() => !isMobile && setActive(side)}
      onMouseLeave={() => !isMobile && setActive(null)}
      onFocus={() => !isMobile && setActive(side)}
      onClick={() => (open ? navigate(c.to) : setActive(side))}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(c.to); } }}
      animate={{ flexGrow: isMobile ? 1 : isActive ? 1.55 : isDim ? 0.7 : 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ flexBasis: 0, flexGrow: 1 }}
    >
      {/* En escritorio el vídeo solo se reproduce en el lado activo (y el loop
         solo se descarga al interactuar); en móvil se reproduce directamente. */}
      {open && c.video && !reduce ? (
        <video
          src={c.video} poster={c.img} autoPlay muted loop playsInline preload="auto" aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scale(1.05)', transition: 'transform .8s ease' }}
        />
      ) : (
        <motion.img
          src={c.img} alt={c.label} loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
          animate={reduce
            ? { filter: isDim ? 'grayscale(0.4) brightness(0.6)' : 'none' }
            : { scale: isActive ? 1.08 : [1, 1.05, 1], filter: isDim ? 'grayscale(0.4) brightness(0.6)' : 'none' }}
          transition={isActive || reduce
            ? { duration: 0.8, ease: EASE }
            : { scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' }, filter: { duration: 0.8 } }}
        />
      )}
      <div className="absolute inset-0" style={{ background: c.wash }} />
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ background: 'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.6))' }} />

      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-6 pb-16 md:pb-24">
        <Kicker color={c.accent}>{c.kicker}</Kicker>
        <h2 className="v14-serif mt-4 leading-[0.92] text-[clamp(2.8rem,7vw,6.5rem)]" style={{ color: CREAM }}>
          <span className="block font-normal" style={{ opacity: 0.85 }}>{c.title[0]}</span>
          <span className="block" style={{ fontWeight: 600 }}>{c.title[1]}</span>
        </h2>

        <motion.div
          className="overflow-hidden"
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="v14 mt-6 max-w-sm text-base md:text-lg" style={{ color: 'rgba(246,241,231,0.85)' }}>{c.line}</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Link to={c.to} onClick={(e) => e.stopPropagation()}
              className="v14 text-sm font-bold uppercase tracking-wide px-7 py-4 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ background: BRAND, color: INK }}>
              Descubrir →
            </Link>
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(c.wa)}`}
              onClick={(e) => { e.stopPropagation(); trackLead({ leadType: 'whatsapp' }); }}
              target="_blank" rel="noopener noreferrer"
              className="v14 text-sm font-bold uppercase tracking-wide px-7 py-4 rounded-full transition-colors"
              style={{ border: '1px solid rgba(246,241,231,0.5)', color: CREAM }}>
              Escríbenos
            </a>
          </div>
        </motion.div>

        {!isMobile && (
          <motion.div
            className="v14 mt-6 flex flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.25em]"
            animate={{ opacity: isActive ? 0 : 0.7 }}
            style={{ color: CREAM }}
          >
            <span style={{ color: c.accent }}>{c.stat}</span>
            <span>Pasa el ratón</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const Hero = () => {
  const [active, setActive] = useState<Side | null>(null);
  return (
    <section className="flex flex-col md:flex-row w-full h-auto md:h-[100svh] md:min-h-[560px]">
      <Panel side="bodas" active={active} setActive={setActive} />
      <div className="hidden md:block w-px" style={{ background: 'rgba(246,241,231,0.25)' }} />
      <Panel side="empresa" active={active} setActive={setActive} />
    </section>
  );
};

/* ---------- Manifiesto ---------- */

const Manifesto = () => (
  <section className="px-5 md:px-10 py-24 md:py-36" style={{ background: PAPER, color: INK }}>
    <div className="max-w-[1300px] mx-auto grid md:grid-cols-12 gap-10">
      <div className="md:col-span-3"><Reveal><Kicker color={BRAND_DEEP}>Manifiesto</Kicker></Reveal></div>
      <div className="md:col-span-9">
        <Reveal>
          <p className="v14-serif text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[1.1]" style={{ fontWeight: 400 }}>
            No montamos equipos, montamos <span className="font-semibold" style={{ color: BRAND_DEEP }}>atmósferas</span>. Cada boda tiene
            su grano, cada empresa su acento. Nuestra obsesión es que el primer beso, el primer discurso
            y el último baile <span className="font-semibold" style={{ color: BRAND_DEEP }}>suenen</span> exactamente como los imaginaste.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col sm:flex-row gap-10 sm:gap-16">
            {[['+2.000', 'eventos producidos'], ['15', 'años en Valencia'], ['9,6', 'valoración media']].map(([n, l]) => (
              <div key={l}>
                <div className="v14-serif text-5xl md:text-6xl" style={{ color: BRAND_DEEP, fontWeight: 600 }}>{n}</div>
                <div className="v14 mt-2 text-sm" style={{ color: 'rgba(14,13,12,0.6)' }}>{l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ---------- Servicios ---------- */

const CAPS = [
  { n: '01', t: 'Sonido', d: 'Line array, refuerzo y microfonía. Nítido en la ceremonia, contundente en la pista.' },
  { n: '02', t: 'Iluminación', d: 'Diseño de luz dinámica, arquitectónica y de escenario. El sitio cambia de cara.' },
  { n: '03', t: 'Pantallas LED', d: 'Alta resolución para vuestro nombre, vuestras fotos o el contenido de tu marca.' },
  { n: '04', t: 'Láser y efectos', d: 'Espectáculo láser, CO₂, chispas frías y humo. El momento que todos graban.' },
  { n: '05', t: 'Visuales a medida', d: 'Motion y VJ diseñados para vosotros, coherentes de principio a fin. Nada de plantillas.' },
  { n: '06', t: 'Streaming y directo', d: 'Realización multicámara y retransmisión para quien no puede estar presente.' },
];

const Services = () => (
  <section id="servicios" className="px-5 md:px-10 py-24 md:py-36" style={{ background: INK, color: CREAM }}>
    <div className="max-w-[1400px] mx-auto">
      <Reveal className="grid md:grid-cols-12 gap-6 items-end mb-14 md:mb-20">
        <div className="md:col-span-7">
          <Kicker color={BRAND_LIGHT}>En escena</Kicker>
          <h2 className="v14-serif mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1]" style={{ fontWeight: 600 }}>
            Todo bajo un <span className="font-normal">mismo equipo</span>.
          </h2>
        </div>
        <p className="md:col-span-5 v14 text-lg" style={{ color: 'rgba(246,241,231,0.65)' }}>
          Una sola productora audiovisual. Sin subcontratas, sin descoordinación y sin un solo cable a la vista.
        </p>
      </Reveal>

      <div className="border-t" style={{ borderColor: 'rgba(246,241,231,0.15)' }}>
        {CAPS.map((cap, i) => (
          <Reveal key={cap.n} delay={i * 0.04}>
            <div className="grid md:grid-cols-12 gap-3 md:gap-6 py-7 md:py-9 border-b transition-colors hover:bg-white/[0.03]" style={{ borderColor: 'rgba(246,241,231,0.15)' }}>
              <div className="md:col-span-1 v14-serif text-xl" style={{ color: 'rgba(246,241,231,0.4)' }}>{cap.n}</div>
              <div className="md:col-span-4 v14-serif text-2xl md:text-3xl" style={{ fontWeight: 600 }}>{cap.t}</div>
              <div className="md:col-span-7 v14 text-base md:text-lg" style={{ color: 'rgba(246,241,231,0.7)' }}>{cap.d}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Reel (vídeo real, play al clic) ---------- */

const Reel = () => {
  const [play, setPlay] = useState(false);
  return (
    <section className="px-0 md:px-10 py-16 md:py-28" style={{ background: INK, color: CREAM }}>
      <div className="max-w-[1500px] mx-auto">
        <Reveal className="px-5 md:px-0 mb-8 md:mb-12 max-w-2xl">
          <Kicker color={BRAND_LIGHT}>El reel</Kicker>
          <h2 className="v14-serif mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1]" style={{ fontWeight: 600 }}>
            El día, <span className="font-normal">en movimiento</span>.
          </h2>
        </Reveal>

        <div className="relative overflow-hidden md:rounded-3xl aspect-video" style={{ background: '#000' }}>
          {play ? (
            <video src={REEL_VIDEO} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <button onClick={() => setPlay(true)} aria-label="Reproducir el reel de boda" className="group absolute inset-0 w-full h-full">
              <img src={REEL_POSTER} alt="DJ de Resona en directo durante una boda" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: 'rgba(14,13,12,0.35)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <span className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full transition-transform group-hover:scale-105" style={{ background: CREAM, color: INK }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="v14 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: CREAM }}>Reproducir</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

/* ---------- Packs ---------- */

const Packs = () => {
  const packs = getFeaturedPacks().slice(0, 3);
  return (
    <section id="packs" className="px-5 md:px-10 py-24 md:py-36" style={{ background: INK, color: CREAM }}>
      <div className="max-w-[1500px] mx-auto">
        <Reveal className="flex items-end justify-between flex-wrap gap-6 mb-12 md:mb-16">
          <div>
            <Kicker color={BRAND_LIGHT}>Packs con precio cerrado</Kicker>
            <h2 className="v14-serif mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1]" style={{ fontWeight: 600 }}>
              Sabes lo que <span className="font-normal">cuesta</span>.
            </h2>
          </div>
          <Link to="/packs" className="v14 text-sm font-bold uppercase tracking-wide pb-1 border-b" style={{ color: CREAM, borderColor: CREAM }}>Ver todos →</Link>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {packs.map((pack, i) => (
            <Reveal key={pack.slug} delay={i * 0.08}>
              <Link to={`/packs/${pack.slug}`} className="group block relative overflow-hidden rounded-2xl aspect-[4/5]" style={{ background: '#1a1917' }}>
                <img src={PACK_IMG[pack.slug] ?? pack.cover} alt={pack.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-[1.2s] group-hover:opacity-90 group-hover:scale-[1.04]" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(14,13,12,0.2) 0%, rgba(14,13,12,0.9) 85%)' }} />
                <div className="absolute inset-0 p-7 flex flex-col justify-end">
                  <div className="v14 text-[0.62rem] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(246,241,231,0.7)' }}>{pack.typeLabel}</div>
                  <div className="v14-serif text-4xl mt-2" style={{ fontWeight: 600 }}>{pack.name}</div>
                  <p className="v14 text-base mt-2" style={{ color: 'rgba(246,241,231,0.8)' }}>{pack.tagline}</p>
                  <div className="mt-5 pt-5 flex items-center justify-between border-t" style={{ borderColor: 'rgba(246,241,231,0.2)' }}>
                    <span className="v14 text-xs" style={{ color: 'rgba(246,241,231,0.6)' }}>hasta {pack.maxGuests} invitados</span>
                    <div className="text-right">
                      <div className="v14 text-[0.6rem] uppercase tracking-wide" style={{ color: 'rgba(246,241,231,0.6)' }}>Desde</div>
                      <div className="v14-serif text-2xl" style={{ color: BRAND_LIGHT, fontWeight: 600 }}>{formatEuros(pack.price)}</div>
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

/* ---------- Proceso ---------- */

const STEPS = [
  { n: '01', t: 'Brief', d: 'Nos cuentas fecha, lugar e idea. Un café, una llamada o un formulario corto.' },
  { n: '02', t: 'Propuesta', d: 'En menos de 24 h, una propuesta a medida con desglose y precio cerrado.' },
  { n: '03', t: 'Producción', d: 'Coordinamos proveedores, licencias y logística. Tú no tocas un cable.' },
  { n: '04', t: 'El día', d: 'Montamos, hacemos pruebas y nos quedamos hasta el último invitado.' },
];

const Process = () => (
  <section className="px-5 md:px-10 py-24 md:py-36" style={{ background: PAPER, color: INK }}>
    <div className="max-w-[1500px] mx-auto">
      <Reveal className="mb-14 md:mb-20 max-w-2xl">
        <Kicker color={BRAND_DEEP}>Cómo trabajamos</Kicker>
        <h2 className="v14-serif mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] leading-[1]" style={{ fontWeight: 600 }}>
          Cuatro pasos, <span className="font-normal">cero sorpresas</span>.
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-4 border-t" style={{ borderColor: 'rgba(14,13,12,0.15)' }}>
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08} className={`py-10 md:py-12 md:px-7 ${i > 0 ? 'md:border-l' : ''} border-b md:border-b-0`}>
            <div style={{ borderColor: 'rgba(14,13,12,0.15)' }}>
              <div className="v14-serif text-5xl" style={{ color: BRAND_DEEP, fontWeight: 600 }}>{s.n}</div>
              <h3 className="v14-serif text-2xl mt-5" style={{ fontWeight: 600 }}>{s.t}</h3>
              <p className="v14 mt-3 text-base" style={{ color: 'rgba(14,13,12,0.65)' }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ---------- Cierre / contacto ---------- */

const Closing = () => (
  <section id="contacto" className="px-5 md:px-10 py-28 md:py-40 text-center" style={{ background: INK, color: CREAM }}>
    <Reveal>
      <Kicker color="rgba(246,241,231,0.55)">+2.000 eventos · 15 años · 9,6 de valoración</Kicker>
      <h3 className="v14-serif mt-6 text-[clamp(2.4rem,7vw,6rem)] leading-[0.98]" style={{ fontWeight: 600 }}>
        Cuéntanos qué <span className="font-normal" style={{ color: BRAND_LIGHT }}>imaginas</span>.
      </h3>
      <p className="v14 mt-6 max-w-xl mx-auto text-lg" style={{ color: 'rgba(246,241,231,0.7)' }}>
        Un WhatsApp, un email o una llamada. Te responde una persona del equipo, casi siempre el mismo día.
      </p>
      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <a href={`https://wa.me/${WA_NUMBER}`} onClick={() => trackLead({ leadType: 'whatsapp' })} className="v14 text-sm font-bold uppercase tracking-wide px-8 py-5 rounded-full transition-transform hover:-translate-y-0.5" style={{ background: BRAND, color: INK }}>
          WhatsApp · 613 88 14 14
        </a>
        <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta sobre mi evento')}`} onClick={() => trackLead({ leadType: 'email' })} className="v14 text-sm font-bold uppercase tracking-wide px-8 py-5 rounded-full transition-transform hover:-translate-y-0.5" style={{ border: '1px solid rgba(246,241,231,0.35)', color: CREAM }}>
          Email
        </a>
        <a href="tel:+34613881414" onClick={() => trackLead({ leadType: 'phone' })} className="v14 text-sm font-bold uppercase tracking-wide px-8 py-5 rounded-full" style={{ border: '1px solid rgba(246,241,231,0.35)', color: CREAM }}>
          Llamar
        </a>
      </div>
    </Reveal>
  </section>
);

/* ---------- Intro (reveal del logo, 1 vez por sesión) ---------- */

const Intro = ({ onDone }: { onDone: () => void }) => (
  <motion.div
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer"
    style={{ background: INK }}
    onClick={onDone}
    initial={{ opacity: 1 }}
    exit={{ y: '-100%' }}
    transition={{ duration: 0.9, ease: EASE }}
  >
    <motion.div
      style={{ color: CREAM }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2.4, ease: EASE }}
    >
      <Logo width={520} className="w-[min(74vw,520px)]" title="ReSona Events" />
    </motion.div>
    <motion.span
      className="v14 mt-6 text-[0.7rem] font-bold uppercase tracking-[0.35em]" style={{ color: 'rgba(246,241,231,0.55)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.4 }}
    >
      Valencia · desde 2009
    </motion.span>
  </motion.div>
);

/* ---------- Página ---------- */

const HomePageV14 = () => {
  useFonts();
  const reduce = useReducedMotion();
  const [showIntro, setShowIntro] = useState(() => typeof window !== 'undefined' && !sessionStorage.getItem('resona-intro'));

  useEffect(() => {
    if (!showIntro) return;
    if (reduce) { setShowIntro(false); return; }
    sessionStorage.setItem('resona-intro', '1');
    const t = setTimeout(() => setShowIntro(false), 4200);
    return () => clearTimeout(t);
  }, [showIntro, reduce]);

  return (
    <div className="relative" style={{ background: INK }}>
      <SEOHead
        title="Producción de bodas y eventos en Valencia — ReSona Events"
        description="Bodas, eventos corporativos y privados llave en mano en Valencia. Sonido, iluminación, DJ y producción técnica. Te acompañamos del brief al día del evento."
        ogImage="https://resonaevents.com/og-image.png"
        canonicalUrl="https://resonaevents.com/"
        schema={[getLocalBusinessSchema(), getOrganizationSchema(), getWebSiteSchema()]}
      />

      <AnimatePresence>
        {showIntro && <Intro key="intro" onDone={() => setShowIntro(false)} />}
      </AnimatePresence>

      <h1 className="sr-only">Producción de bodas y eventos en Valencia — sonido, iluminación y DJ</h1>

      <Hero />
      <Manifesto />
      <Services />
      <Reel />
      <Packs />
      <Process />
      <Closing />
    </div>
  );
};

export default HomePageV14;
